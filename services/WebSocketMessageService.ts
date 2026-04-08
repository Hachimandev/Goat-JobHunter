import { Client } from '@stomp/stompjs';
import { ThunkDispatch } from 'redux-thunk';
import { UnknownAction } from 'redux';
import SockJS from 'sockjs-client';
import { store } from '@/lib/store';
import { chatRoomApi } from '@/services/chatRoom/chatRoomApi';
import { MessageType } from '@/types/model';
import { groupChatApi } from '@/services/chatRoom/groupChat/groupChatApi';

export class WebSocketMessageService {
  private client: Client | null = null;
  private subscribedChatRooms: Set<number> = new Set();
  private onConnectedCallback: (() => void) | null = null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(
    private readonly dispatch: ThunkDispatch<any, any, UnknownAction>,
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
        const message: MessageType = JSON.parse(frame.body);

        if (message.messageType === 'SYSTEM') {
          this.handleGroupEvent(chatRoomId, message);
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

  private handleMessage(chatRoomId: number, message: MessageType) {
    console.log(`💬 Received message in chat room ${chatRoomId}:`, message);

    // Update messages list
    this.dispatch(
      chatRoomApi.util.updateQueryData(
        'fetchMessagesInChatRoom',
        {
          chatRoomId,
          page: 1,
          size: 50,
        },
        (draft) => {
          if (draft?.data) {
            const existingMessageIndex = draft.data.findIndex((m) => m.messageId === message.messageId);

            if (existingMessageIndex === -1) {
              draft.data.push(message);
              return;
            }

            draft.data[existingMessageIndex] = {
              ...draft.data[existingMessageIndex],
              ...message,
            };
          }
        },
      ),
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

  private handleGroupEvent(chatRoomId: number, message: MessageType) {
    console.log(`🔔 Group event in ${chatRoomId}:`, message);

    // Thêm system message vào danh sách tin nhắn
    this.handleMessage(chatRoomId, message);

    try {
      const content = message.content;

      // Detect MEMBER_REMOVED or MEMBER_LEFT
      if (content.includes('đã xóa') && content.includes('khỏi nhóm')) {
        // Extract member name: "{actor} đã xóa {member} khỏi nhóm"
        const match = content.match(/đã xóa (.+?) khỏi nhóm/);
        const memberName = match?.[1];

        this.dispatch(
          groupChatApi.util.updateQueryData('getMemberInGroupChat', chatRoomId, (draft) => {
            if (draft?.data && memberName) {
              draft.data = draft.data.filter((m) => m.fullName !== memberName);
            }
          }),
        );

        // Update member count in chat rooms list
        this.dispatch(
          chatRoomApi.util.updateQueryData('fetchChatRooms', { page: 1, size: 50 }, (draft) => {
            if (draft?.data?.result) {
              const room = draft.data.result.find((r) => r.roomId === chatRoomId);
              if (room && room.memberCount) {
                room.memberCount -= 1;
              }
            }
          }),
        );
      } else if (content.includes('đã rời khỏi nhóm')) {
        // Extract actor name: "{actor} đã rời khỏi nhóm"
        const match = content.match(/(.+?) đã rời khỏi nhóm/);
        const actorName = match?.[1];

        this.dispatch(
          groupChatApi.util.updateQueryData('getMemberInGroupChat', chatRoomId, (draft) => {
            if (draft?.data && actorName) {
              draft.data = draft.data.filter((m) => m.fullName !== actorName);
            }
          }),
        );

        // Update member count
        this.dispatch(
          chatRoomApi.util.updateQueryData('fetchChatRooms', { page: 1, size: 50 }, (draft) => {
            if (draft?.data?.result) {
              const room = draft.data.result.find((r) => r.roomId === chatRoomId);
              if (room && room.memberCount) {
                room.memberCount -= 1;
              }
            }
          }),
        );
      }
      // Detect ROLE_CHANGED
      else if (content.includes('đã thay đổi vai trò của') && content.includes('thành')) {
        // Extract: "{actor} đã thay đổi vai trò của {member} thành {role}"
        const match = content.match(/đã thay đổi vai trò của (.+?) thành (.+?)$/);
        const memberName = match?.[1];
        const roleText = match?.[2];

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
      }
      // Detect MEMBER_ADDED
      else if (content.includes('đã thêm') && content.includes('vào nhóm')) {
        // Vẫn cần invalidate vì cần fetch thông tin đầy đủ của member mới
        this.dispatch(groupChatApi.util.invalidateTags([{ type: 'ChatMember', id: chatRoomId }]));

        // Update member count
        this.dispatch(
          chatRoomApi.util.updateQueryData('fetchChatRooms', { page: 1, size: 50 }, (draft) => {
            if (draft?.data?.result) {
              const room = draft.data.result.find((r) => r.roomId === chatRoomId);
              if (room) {
                room.memberCount = (room.memberCount || 0) + 1;
              }
            }
          }),
        );
      }
      // Detect GROUP_NAME_CHANGED
      else if (content.includes('đã đổi tên nhóm từ')) {
        // Extract: "{actor} đã đổi tên nhóm từ "{oldName}" thành "{newName}""
        const match = content.match(/thành "(.+?)"$/);
        const newName = match?.[1];

        this.dispatch(
          chatRoomApi.util.updateQueryData('fetchChatRooms', { page: 1, size: 50 }, (draft) => {
            if (draft?.data?.result && newName) {
              const room = draft.data.result.find((r) => r.roomId === chatRoomId);
              if (room) {
                room.name = newName;
              }
            }
          }),
        );
      }
      // Detect GROUP_AVATAR_CHANGED
      else if (content.includes('đã thay đổi ảnh đại diện nhóm')) {
        // Vẫn cần invalidate vì cần fetch avatar URL mới từ server
        this.dispatch(chatRoomApi.util.invalidateTags([{ type: 'ChatRoom', id: chatRoomId }]));
      }
      // Detect GROUP_CREATED
      else if (content.includes('đã tạo nhóm')) {
        // Không cần xử lý gì vì user sẽ được redirect đến room mới
      }
    } catch (error) {
      console.error('Failed to parse system message:', error);
    }
  }
}
