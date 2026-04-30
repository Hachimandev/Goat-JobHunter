import { Client } from '@stomp/stompjs';
import { ThunkDispatch } from 'redux-thunk';
import { UnknownAction } from 'redux';
import SockJS from 'sockjs-client';
import { CHAT_MESSAGE_PAGE_SIZE } from '@/constants/constant';
import { store } from '@/lib/store';
import { chatRoomApi } from '@/services/chatRoom/chatRoomApi';
import { FetchMessagesInChatRoomRequest } from '@/services/chatRoom/chatRoomType';
import { MessageResponse } from '@/types/model';
import { groupChatApi } from '@/services/chatRoom/groupChat/groupChatApi';
import { pinnedMessageApi } from '@/services/chatRoom/pinned_message/pinnedMessageApi';
import { MessageEvent } from '@/types/enum';
import { extractMessageContent, extractMessageEvent } from '@/utils/slug';
import {
  cascadeReplyContextForDeletedMessage,
  cascadeReplyContextForRecalledMessage,
} from '@/utils/replyContextRealtime';
import { pollApi } from '../poll/pollApi';

type DeleteMessageRealtimeEvent = {
  eventType?: string;
  messageId: string;
  chatRoomId: string | number;
  deletedByAccountId?: number;
  deletedAt?: string;
};

export class WebSocketMessageService {
  private client: Client | null = null;
  private subscribedChatRooms: Set<number> = new Set();
  private onConnectedCallback: (() => void) | null = null;

  constructor(
    private readonly dispatch: ThunkDispatch<any, any, UnknownAction>, // eslint-disable-line @typescript-eslint/no-explicit-any
    onConnected?: () => void,
  ) {
    this.onConnectedCallback = onConnected || null;
  }

  connect() {
    this.client = new Client({
      webSocketFactory: () => new SockJS(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000/ws'),
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      debug: (str) => console.log('[STOMP Message]', str),
      beforeConnect: this.beforeConnect,
    });

    this.setupHandlers();
    this.client.activate();
  }

  disconnect() {
    if (this.client) {
      this.subscribedChatRooms.clear();
      this.client.deactivate();
      console.log('🔌 STOMP Message disconnected');
    }
  }

  subscribeToChatRoom(chatRoomId: number) {
    if (!this.client?.connected) {
      console.warn('⚠️ STOMP not connected, cannot subscribe to chat room', chatRoomId);
      return;
    }

    if (this.subscribedChatRooms.has(chatRoomId)) {
      console.log('ℹ️ Already subscribed to chat room', chatRoomId);
      return;
    }

    this.client.subscribe(`/topic/chatrooms/${chatRoomId}`, (frame) => {
      try {
        const payload: unknown = JSON.parse(frame.body);

        if (this.isDeleteMessageEvent(payload)) {
          this.handleDeleteMessageEvent(chatRoomId, payload);
          return;
        }

        const message = payload as MessageResponse;

        if (message.messageType === 'SYSTEM' || message.messageType === 'POLL') {
          this.handleGroupEvent(chatRoomId, message);
          this.handleMessage(chatRoomId, message);
          return;
        }

        this.handleMessage(chatRoomId, message);
      } catch (err) {
        console.error('❌ Parse message error:', err);
      }
    });

    this.subscribedChatRooms.add(chatRoomId);
    console.log(`✅ Subscribed to /topic/chatrooms/${chatRoomId}`);
  }

  unsubscribeFromChatRoom(chatRoomId: number) {
    this.subscribedChatRooms.delete(chatRoomId);
    console.log(`🔕 Unsubscribed from chat room ${chatRoomId}`);
  }

  private readonly beforeConnect = () => {
    const { isAuthenticated, user } = store.getState().auth;
    return isAuthenticated && user ? Promise.resolve() : Promise.reject(new Error('User is not authenticated'));
  };

  private setupHandlers() {
    if (!this.client) return;

    this.client.onConnect = () => {
      console.log('✅ STOMP Message Connected');

      // Gọi callback để xử lý pending subscriptions
      this.onConnectedCallback?.();

      // Re-subscribe to previously subscribed chat rooms after reconnection
      this.subscribedChatRooms.forEach((chatRoomId) => {
        this.subscribeToChatRoom(chatRoomId);
      });
    };

    this.client.onStompError = (frame) => {
      console.error('❌ STOMP Message Error:', frame.headers['message']);
    };

    this.client.onWebSocketClose = () => {
      console.log('⚠️ WebSocket Message closed');
    };
  }

  private isDeleteMessageEvent(payload: unknown): payload is DeleteMessageRealtimeEvent {
    if (!payload || typeof payload !== 'object') {
      return false;
    }

    const candidate = payload as Record<string, unknown>;
    const hasValidMessageId = typeof candidate.messageId === 'string';
    const hasValidChatRoomId = typeof candidate.chatRoomId === 'string' || typeof candidate.chatRoomId === 'number';
    const eventType = typeof candidate.eventType === 'string' ? candidate.eventType.toUpperCase() : '';
    const hasSender = 'sender' in candidate;

    if (eventType === 'MESSAGE_DELETED') {
      return hasValidMessageId && hasValidChatRoomId;
    }

    return hasValidMessageId && hasValidChatRoomId && !hasSender;
  }

  private getActiveMessageQueryArgs(chatRoomId: number): FetchMessagesInChatRoomRequest[] {
    const activeMessageQueries = chatRoomApi.util
      .selectInvalidatedBy(store.getState(), [{ type: 'ChatRoom', id: `MESSAGES_${chatRoomId}` }])
      .filter(({ endpointName, originalArgs }) => {
        if (endpointName !== 'fetchMessagesInChatRoom') {
          return false;
        }

        if (!originalArgs || typeof originalArgs !== 'object') {
          return false;
        }

        return (originalArgs as { chatRoomId?: number }).chatRoomId === chatRoomId;
      });

    const queryArgsByKey = new Map<string, FetchMessagesInChatRoomRequest>();

    activeMessageQueries.forEach(({ originalArgs }) => {
      const args = originalArgs as Partial<FetchMessagesInChatRoomRequest>;
      const normalizedArgs: FetchMessagesInChatRoomRequest = {
        chatRoomId,
        page: args.page ?? 1,
        size: args.size ?? CHAT_MESSAGE_PAGE_SIZE,
      };

      queryArgsByKey.set(`${normalizedArgs.page}-${normalizedArgs.size}`, normalizedArgs);
    });

    if (queryArgsByKey.size === 0) {
      return [{ chatRoomId, page: 1, size: CHAT_MESSAGE_PAGE_SIZE }];
    }

    return Array.from(queryArgsByKey.values()).sort((a, b) => (a.page ?? 1) - (b.page ?? 1));
  }

  private getFirstPageMessageQueryArg(chatRoomId: number): FetchMessagesInChatRoomRequest {
    const activeQueryArgs = this.getActiveMessageQueryArgs(chatRoomId);

    return (
      activeQueryArgs.find((queryArg) => (queryArg.page ?? 1) === 1) ?? {
        chatRoomId,
        page: 1,
        size: CHAT_MESSAGE_PAGE_SIZE,
      }
    );
  }

  private handleDeleteMessageEvent(subscribedChatRoomId: number, payload: DeleteMessageRealtimeEvent) {
    const parsedChatRoomId = Number(payload.chatRoomId);
    const targetChatRoomId = Number.isNaN(parsedChatRoomId) ? subscribedChatRoomId : parsedChatRoomId;

    const activeMessageQueryArgs = this.getActiveMessageQueryArgs(targetChatRoomId);

    activeMessageQueryArgs.forEach((queryArg) => {
      this.dispatch(
        chatRoomApi.util.updateQueryData('fetchMessagesInChatRoom', queryArg, (draft) => {
          if (!draft?.data?.result) {
            return;
          }

          cascadeReplyContextForDeletedMessage(draft.data.result, payload.messageId);
          draft.data.result = draft.data.result.filter((message) => message.messageId !== payload.messageId);
        }),
      );
    });

    this.dispatch(chatRoomApi.util.invalidateTags([{ type: 'ChatRoom', id: 'LIST' }]));
  }

  private handleMessage(chatRoomId: number, message: MessageResponse) {
    console.log(`💬 Received message in chat room ${chatRoomId}:`, message);

    // Update messages list
    const firstPageQueryArg = this.getFirstPageMessageQueryArg(chatRoomId);

    this.dispatch(
      chatRoomApi.util.updateQueryData('fetchMessagesInChatRoom', firstPageQueryArg, (draft) => {
        const draftMessages = draft?.data?.result;

        if (!draftMessages) {
          return;
        }

        const existingMessageIndex = draftMessages.findIndex((item) => item.messageId === message.messageId);

        if (existingMessageIndex === -1) {
          draftMessages.push(message);
        } else {
          draftMessages[existingMessageIndex] = {
            ...draftMessages[existingMessageIndex],
            ...message,
          };
        }

        if (message.isHidden) {
          cascadeReplyContextForRecalledMessage(draftMessages, message.messageId);
        }
      }),
    );

    // Update sidebar: last message preview & move to top
    this.dispatch(chatRoomApi.util.invalidateTags([{ type: 'ChatRoom', id: 'LIST' }]));

    // this.dispatch(
    //   chatRoomApi.util.updateQueryData("fetchChatRooms", { page: 1, size: 50 }, (draft) => {
    //     if (draft?.data?.result) {
    //
    //       console.log("Updating chat room list for new message...");
    //
    //       const chatRoomIndex = draft.data.result.findIndex((cr) => cr.roomId === chatRoomId);
    //
    //       if (chatRoomIndex !== -1) {
    //         const chatRoom = draft.data.result[chatRoomIndex];
    //         const currentUserId = store.getState().auth.user?.accountId;
    //
    //         // Update last message info
    //         chatRoom.lastMessagePreview = message.content;
    //         chatRoom.lastMessageTime = message.createdAt;
    //         chatRoom.currentUserSentLastMessage = message.sender.accountId === currentUserId;
    //
    //         // Move to top if not already first
    //         if (chatRoomIndex !== 0) {
    //           draft.data.result.splice(chatRoomIndex, 1);
    //           draft.data.result.unshift(chatRoom);
    //         }
    //       } else {
    //         // New chat room, invalidate to refetch
    //         this.dispatch(
    //           chatRoomApi.util.invalidateTags([{ type: "ChatRoom", id: "LIST" }])
    //         );
    //       }
    //     }
    //   })
    // );
  }

  private parseSystemEvent(messageContent: string): MessageEvent | null {
    const event = extractMessageEvent(messageContent);

    if (!event) {
      return null;
    }

    return (Object.values(MessageEvent) as string[]).includes(event) ? (event as MessageEvent) : null;
  }

  private invalidateGroupMembershipState(chatRoomId: number) {
    this.dispatch(groupChatApi.util.invalidateTags([{ type: 'ChatMember', id: chatRoomId }]));
    this.dispatch(
      chatRoomApi.util.invalidateTags([
        { type: 'ChatRoom', id: chatRoomId },
        { type: 'ChatRoom', id: 'LIST' },
      ]),
    );
  }

  private handleGroupEvent(chatRoomId: number, message: MessageResponse) {
    console.log(`🔔 Group event in ${chatRoomId}:`, message);

    try {
      const content = extractMessageContent(message.content) || message.content;
      const event = this.parseSystemEvent(message.content);

      const isMemberRemovedEvent =
        event === MessageEvent.MEMBER_REMOVED || (content.includes('đã xóa') && content.includes('khỏi nhóm'));
      const isMemberLeftEvent = event === MessageEvent.MEMBER_LEFT || content.includes('đã rời khỏi nhóm');

      // Detect MEMBER_REMOVED or MEMBER_LEFT or MESSAGE_UNPINNED
      if (isMemberRemovedEvent) {
        // Extract member name: "{actor} đã xóa {member} khỏi nhóm"
        const match = content.match(/đã xóa (.+?) khỏi nhóm/);
        const memberName = match?.[1]?.trim();

        if (memberName) {
          this.dispatch(
            groupChatApi.util.updateQueryData('getMemberInGroupChat', chatRoomId, (draft) => {
              if (draft?.data) {
                draft.data = draft.data.filter((m) => m.fullName !== memberName);
              }
            }),
          );
        }

        this.invalidateGroupMembershipState(chatRoomId);
      } else if (isMemberLeftEvent) {
        // Extract actor name: "{actor} đã rời khỏi nhóm"
        const match = content.match(/(.+?) đã rời khỏi nhóm/);
        const actorName = match?.[1]?.trim();

        if (actorName) {
          this.dispatch(
            groupChatApi.util.updateQueryData('getMemberInGroupChat', chatRoomId, (draft) => {
              if (draft?.data) {
                draft.data = draft.data.filter((m) => m.fullName !== actorName);
              }
            }),
          );
        }

        this.invalidateGroupMembershipState(chatRoomId);
      } else if (event === MessageEvent.MESSAGE_UNPINNED || content.includes('bỏ ghim')) {
        this.dispatch(
          pinnedMessageApi.util.invalidateTags([{ type: 'PinnedMessage', id: `PINNED_MESSAGE_${chatRoomId}` }]),
        );
      }
      // Detect ROLE_CHANGED
      else if (
        event === MessageEvent.ROLE_CHANGED ||
        (content.includes('đã thay đổi vai trò của') && content.includes('thành'))
      ) {
        // Extract: "{actor} đã thay đổi vai trò của {member} thành {role}"
        const match = content.match(/đã thay đổi vai trò của (.+?) thành (.+?)$/);
        const memberName = match?.[1]?.trim();
        const roleText = match?.[2]?.trim();

        const roleMap: Record<string, 'OWNER' | 'MODERATOR' | 'MEMBER'> = {
          'Chủ nhóm': 'OWNER',
          'Quản trị viên': 'MODERATOR',
          'Thành viên': 'MEMBER',
        };

        const newRole = roleText ? roleMap[roleText] : undefined;

        this.dispatch(
          groupChatApi.util.updateQueryData('getMemberInGroupChat', chatRoomId, (draft) => {
            if (draft?.data && memberName && newRole) {
              const member = draft.data.find((m) => m.fullName === memberName);
              if (member) {
                member.role = newRole;
              }
            }
          }),
        );

        this.dispatch(groupChatApi.util.invalidateTags([{ type: 'ChatMember', id: chatRoomId }]));
      }
      // Detect MEMBER_ADDED
      else if (event === MessageEvent.MEMBER_ADDED || (content.includes('đã thêm') && content.includes('vào nhóm'))) {
        this.invalidateGroupMembershipState(chatRoomId);
      }
      // Detect GROUP_NAME_CHANGED
      else if (event === MessageEvent.GROUP_NAME_CHANGED || content.includes('đã đổi tên nhóm từ')) {
        this.dispatch(
          chatRoomApi.util.invalidateTags([
            { type: 'ChatRoom', id: chatRoomId },
            { type: 'ChatRoom', id: 'LIST' },
          ]),
        );
      }
      // Detect GROUP_AVATAR_CHANGED
      else if (event === MessageEvent.GROUP_AVATAR_CHANGED || content.includes('đã thay đổi ảnh đại diện nhóm')) {
        this.dispatch(
          chatRoomApi.util.invalidateTags([
            { type: 'ChatRoom', id: chatRoomId },
            { type: 'ChatRoom', id: 'LIST' },
          ]),
        );
      }
      // Detect GROUP_PRIVACY_CHANGED
      else if (event === MessageEvent.GROUP_PRIVACY_CHANGED || content.includes('đã thay đổi quyền riêng tư nhóm')) {
        this.dispatch(
          chatRoomApi.util.invalidateTags([
            { type: 'ChatRoom', id: chatRoomId },
            { type: 'ChatRoom', id: 'LIST' },
          ]),
        );
      }
      // Detect GROUP_CREATED
      else if (event === MessageEvent.GROUP_CREATED || content.includes('đã tạo nhóm')) {
        // Không cần xử lý gì vì user sẽ được redirect đến room mới
      } else if (event === MessageEvent.MESSAGE_PINNED || content.includes('đã ghim một tin nhắn')) {
        this.dispatch(
          pinnedMessageApi.util.invalidateTags([{ type: 'PinnedMessage', id: `PINNED_MESSAGE_${chatRoomId}` }]),
        );
      } else if (event === MessageEvent.GROUP_DISSOLVED || content.includes('đã giải tán nhóm')) {
        this.dispatch(
          chatRoomApi.util.invalidateTags([
            { type: 'ChatRoom', id: chatRoomId },
            { type: 'ChatRoom', id: 'LIST' },
          ]),
        );
      } else if (content.includes('cuộc bình chọn')) {
        this.dispatch(
          pollApi.util.invalidateTags([
            { type: 'Poll', id: `POLLS_${chatRoomId}` },
            { type: 'ChatRoom', id: `POLL_${chatRoomId}_${chatRoomId}` },
          ]),
        );
      }
    } catch (error) {
      console.error('Failed to parse system message:', error);
    }
  }
}
