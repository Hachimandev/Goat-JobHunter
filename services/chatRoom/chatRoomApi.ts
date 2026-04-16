import { api } from '@/services/api';
import {
  DeleteMessagePermanentRequest,
  FetchChatRoomsRequest,
  FetchChatRoomsResponse,
  ForwardMessageBatchRequest,
  ForwardMessageBatchResponse,
  FetchMessagesInChatRoomRequest,
  FetchMessagesInChatRoomResponse,
  RecallMessageRequest,
  SearchMessagesInChatRoomRequest,
  SendContactCardsToChatRoomRequest,
  SendMessageToChatRoomRequest,
  SendMessageToNewChatRoomRequest,
} from '@/services/chatRoom/chatRoomType';
import { ChatRoom, MessageResponse } from '@/types/model';
import { IBackendRes, IModelPaginate } from '@/types/api';
import {
  cascadeReplyContextForDeletedMessage,
  cascadeReplyContextForRecalledMessage,
} from '@/utils/replyContextRealtime';
import { getMessagePreviewText } from '@/utils/messageUtils';
import { pinnedMessageApi } from './pinned_message/pinnedMessageApi';

export const chatRoomApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Fetch chat rooms of the current user
    fetchChatRooms: builder.query<FetchChatRoomsResponse, FetchChatRoomsRequest>({
      query: ({ page = 1, size = 50 }) => ({
        url: '/chatrooms/me',
        method: 'GET',
        params: { page, size },
      }),
      providesTags: (result) =>
        result?.data?.result
          ? [
              ...result.data.result.map(({ roomId }) => ({
                type: 'ChatRoom' as const,
                id: roomId,
              })),
              { type: 'ChatRoom', id: 'LIST' },
            ]
          : [{ type: 'ChatRoom', id: 'LIST' }],
    }),

    // Fetch detail chat room by ID
    fetchChatRoomsById: builder.query<IBackendRes<ChatRoom>, number>({
      query: (chatRoomId) => ({
        url: `/chatrooms/${chatRoomId}`,
        method: 'GET',
      }),
      providesTags: (result, error, chatRoomId) => [{ type: 'ChatRoom', id: chatRoomId }],
    }),

    // Fetch messages in a specific chat room
    fetchMessagesInChatRoom: builder.query<FetchMessagesInChatRoomResponse, FetchMessagesInChatRoomRequest>({
      query: ({ chatRoomId, page = 1, size = 50 }) => ({
        url: `/chatrooms/${chatRoomId}/messages`,
        method: 'GET',
        params: { size, page },
      }),
      providesTags: (_, __, { chatRoomId }) => [{ type: 'ChatRoom', id: `MESSAGES_${chatRoomId}` }],
    }),

    searchMessagesInChatRoom: builder.query<
      IBackendRes<IModelPaginate<MessageResponse>>,
      SearchMessagesInChatRoomRequest
    >({
      query: ({ chatRoomId, searchTerm, page = 1, size = 50 }) => ({
        url: `/chatrooms/${chatRoomId}/messages/search`,
        method: 'GET',
        params: { searchTerm, size, page },
      }),
      keepUnusedDataFor: 30,
      providesTags: (_, __, { chatRoomId, searchTerm }) => [
        { type: 'ChatRoom', id: `MESSAGE_SEARCH_${chatRoomId}_${searchTerm.trim().toLowerCase()}` },
      ],
    }),

    fetchFilesInChatRoom: builder.query<FetchMessagesInChatRoomResponse, { chatRoomId: number; page?: number }>({
      query: ({ chatRoomId, page = 1 }) => ({
        url: `/chatrooms/${chatRoomId}/file`,
        method: 'GET',
        params: { page },
      }),
      providesTags: (_, __, { chatRoomId }) => [{ type: 'ChatRoom', id: `MESSAGES_${chatRoomId}` }],
    }),

    fetchMediaInChatRoom: builder.query<FetchMessagesInChatRoomResponse, { chatRoomId: number; page?: number }>({
      query: ({ chatRoomId, page = 1 }) => ({
        url: `/chatrooms/${chatRoomId}/media`,
        method: 'GET',
        params: { page },
      }),
      providesTags: (_, __, { chatRoomId }) => [{ type: 'ChatRoom', id: `MESSAGES_${chatRoomId}` }],
    }),

    // Send message to a existed chat room
    sendMessageToChatRoom: builder.mutation<FetchMessagesInChatRoomResponse, SendMessageToChatRoomRequest>({
      query: ({ chatRoomId, content, files, replyToMessageId }) => {
        const formData = new FormData();
        const normalizedContent = content?.trim();
        const hasReplyReference = Boolean(replyToMessageId);

        // Add files nếu có
        if (files && files.length > 0) {
          files.forEach((file) => {
            formData.append('files', file);
          });
        }

        // Add request part when content exists or this message is a reply.
        if (normalizedContent || hasReplyReference) {
          const requestPayload: { content?: string; replyToMessageId?: string } = {};

          if (normalizedContent) {
            requestPayload.content = content;
          }

          if (replyToMessageId) {
            requestPayload.replyToMessageId = replyToMessageId;
          }

          const requestBlob = new Blob([JSON.stringify(requestPayload)], { type: 'application/json' });
          formData.append('request', requestBlob);
        }

        return {
          url: `/chatrooms/${chatRoomId}/messages`,
          method: 'POST',
          data: formData,
        };
      },
      async onQueryStarted({ chatRoomId }, { dispatch, queryFulfilled }) {
        try {
          const { data: sendResponse } = await queryFulfilled;
          const sentMessages = sendResponse?.data || [];

          if (sentMessages.length === 0) {
            return;
          }

          const latestMessage = sentMessages[sentMessages.length - 1];

          // Update chat rooms list cache
          dispatch(
            chatRoomApi.util.updateQueryData('fetchChatRooms', { page: 1, size: 50 }, (draft) => {
              if (draft?.data?.result) {
                const chatRoomIndex = draft.data.result.findIndex((room) => room.roomId === chatRoomId);

                if (chatRoomIndex !== -1) {
                  const chatRoom = draft.data.result[chatRoomIndex];

                  // Update last message info
                  chatRoom.lastMessagePreview = latestMessage.content;
                  chatRoom.lastMessageTime = latestMessage.createdAt;

                  // Move to top if not already first
                  if (chatRoomIndex !== 0) {
                    draft.data.result.splice(chatRoomIndex, 1);
                    draft.data.result.unshift(chatRoom);
                  }
                }
              }
            }),
          );
        } catch (error) {
          console.error('Failed to update cache after sending message:', error);
        }
      },
    }),

    sendContactCardsToChatRoom: builder.mutation<FetchMessagesInChatRoomResponse, SendContactCardsToChatRoomRequest>({
      query: ({ chatRoomId, userIds }) => ({
        url: `/chatrooms/${chatRoomId}/messages/contact`,
        method: 'POST',
        data: {
          userIds,
        },
      }),
      async onQueryStarted({ chatRoomId }, { dispatch, queryFulfilled }) {
        try {
          const { data: sendResponse } = await queryFulfilled;
          const sentMessages = sendResponse?.data || [];

          if (sentMessages.length === 0) {
            return;
          }

          dispatch(
            chatRoomApi.util.updateQueryData('fetchMessagesInChatRoom', { chatRoomId, page: 1, size: 50 }, (draft) => {
              const draftMessages = draft?.data;

              if (!draftMessages) {
                return;
              }

              sentMessages.forEach((message) => {
                const existingMessageIndex = draftMessages.findIndex((item) => item.messageId === message.messageId);

                if (existingMessageIndex === -1) {
                  draftMessages.push(message);
                  return;
                }

                draftMessages[existingMessageIndex] = {
                  ...draftMessages[existingMessageIndex],
                  ...message,
                };
              });
            }),
          );

          const latestMessage = sentMessages[sentMessages.length - 1];

          dispatch(
            chatRoomApi.util.updateQueryData('fetchChatRooms', { page: 1, size: 50 }, (draft) => {
              if (!draft?.data?.result) {
                return;
              }

              const chatRoomIndex = draft.data.result.findIndex((room) => room.roomId === chatRoomId);

              if (chatRoomIndex === -1) {
                return;
              }

              const chatRoom = draft.data.result[chatRoomIndex];
              chatRoom.lastMessagePreview = getMessagePreviewText(latestMessage);
              chatRoom.lastMessageTime = latestMessage.createdAt;

              if (chatRoomIndex !== 0) {
                draft.data.result.splice(chatRoomIndex, 1);
                draft.data.result.unshift(chatRoom);
              }
            }),
          );
        } catch (error) {
          console.error('Failed to update cache after sending contact cards:', error);
        }
      },
    }),

    // Send message to a new chat room
    sendMessageToNewChatRoom: builder.mutation<IBackendRes<ChatRoom>, SendMessageToNewChatRoomRequest>({
      query: ({ accountId, content, files }) => {
        const formData = new FormData();

        // Add files nếu có
        if (files && files.length > 0) {
          files.forEach((file) => {
            formData.append('files', file);
          });
        }

        const requestData: { accountId: number; content?: string } = { accountId };
        if (content && content.trim()) {
          requestData.content = content;
        }

        // Add content nếu có (dưới dạng JSON part)
        const requestBlob = new Blob([JSON.stringify(requestData)], { type: 'application/json' });
        formData.append('request', requestBlob);

        return {
          url: `/chatrooms/messages`,
          method: 'POST',
          data: formData,
        };
      },
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data: response } = await queryFulfilled;

          if (response?.data) {
            const newChatRoom = response.data;

            // Update chat rooms list cache - add new chat room at the top
            dispatch(
              chatRoomApi.util.updateQueryData('fetchChatRooms', { page: 1, size: 50 }, (draft) => {
                if (draft?.data?.result) {
                  // Check if chat room already exists
                  const exists = draft.data.result.some((room) => room.roomId === newChatRoom.roomId);

                  if (!exists) {
                    // Add new chat room at the top
                    draft.data.result.unshift(newChatRoom);
                  }
                }
              }),
            );
          }
        } catch (error) {
          console.error('Failed to update cache after creating new chat room:', error);
        }
      },
    }),

    // Check if chat room exists between two users, type of chat room is DIRECT
    checkExistingChatRoom: builder.query<IBackendRes<ChatRoom | null>, number>({
      query: (accountId) => ({
        url: `/chatrooms/direct/exists`,
        method: 'GET',
        params: { accountId },
      }),
      providesTags: (_, __, accountId) => [{ type: 'ChatRoom', id: `EXISTS_${accountId}` }],
    }),

    deleteMessagePermanent: builder.mutation<IBackendRes<null>, DeleteMessagePermanentRequest>({
      query: ({ chatRoomId, messageId }) => ({
        url: `/chatrooms/${chatRoomId}/messages/${messageId}/permanent`,
        method: 'DELETE',
      }),
      async onQueryStarted({ chatRoomId, messageId }, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;

          dispatch(
            chatRoomApi.util.updateQueryData('fetchMessagesInChatRoom', { chatRoomId, page: 1, size: 50 }, (draft) => {
              if (!draft?.data) return;

              cascadeReplyContextForDeletedMessage(draft.data, messageId);
              draft.data = draft.data.filter((message) => message.messageId !== messageId);
            }),
          );

          dispatch(chatRoomApi.util.invalidateTags([{ type: 'ChatRoom', id: 'LIST' }]));

          dispatch(
            pinnedMessageApi.util.invalidateTags([{ type: 'PinnedMessage', id: `PINNED_MESSAGE_${chatRoomId}` }]),
          );
        } catch (error) {
          console.error('Failed to permanently delete message:', error);
        }
      },
    }),

    forwardMessageBatch: builder.mutation<IBackendRes<ForwardMessageBatchResponse>, ForwardMessageBatchRequest>({
      query: ({ sourceChatRoomId, messageId, targetChatRoomIds }) => ({
        url: `/chatrooms/${sourceChatRoomId}/messages/${messageId}/forward`,
        method: 'POST',
        data: {
          targetChatRoomIds,
        },
      }),
      async onQueryStarted({ targetChatRoomIds }, { dispatch, queryFulfilled }) {
        try {
          const { data: response } = await queryFulfilled;

          const failedIds = new Set((response?.data?.failedTargetChatRooms || []).map((item) => item.chatRoomId));

          const successfulIds =
            response?.data?.successfulTargetChatRoomIds && response.data.successfulTargetChatRoomIds.length > 0
              ? response.data.successfulTargetChatRoomIds
              : targetChatRoomIds.filter((id) => !failedIds.has(id));

          const messageTags = successfulIds.map((chatRoomId) => ({
            type: 'ChatRoom' as const,
            id: `MESSAGES_${chatRoomId}`,
          }));

          dispatch(chatRoomApi.util.invalidateTags([...messageTags, { type: 'ChatRoom', id: 'LIST' }]));
        } catch (error) {
          console.error('Failed to forward message:', error);
        }
      },
    }),

    recallMessage: builder.mutation<IBackendRes<null>, RecallMessageRequest>({
      query: ({ chatRoomId, messageId }) => ({
        url: `/chatrooms/${chatRoomId}/messages/${messageId}`,
        method: 'DELETE',
      }),
      async onQueryStarted({ chatRoomId, messageId }, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;

          dispatch(
            chatRoomApi.util.updateQueryData('fetchMessagesInChatRoom', { chatRoomId, page: 1, size: 50 }, (draft) => {
              if (!draft?.data) return;

              const recalledMessage = draft.data.find((message) => message.messageId === messageId);

              if (recalledMessage) {
                recalledMessage.isHidden = true;
                recalledMessage.content = 'Tin nhắn đã được thu hồi';
              }

              cascadeReplyContextForRecalledMessage(draft.data, messageId);
            }),
          );

          dispatch(chatRoomApi.util.invalidateTags([{ type: 'ChatRoom', id: 'LIST' }]));

          dispatch(
            pinnedMessageApi.util.invalidateTags([{ type: 'PinnedMessage', id: `PINNED_MESSAGE_${chatRoomId}` }]),
          );
        } catch (error) {
          console.error('Failed to recall message:', error);
        }
      },
    }),
  }),
});

export const {
  useFetchChatRoomsQuery,
  useFetchChatRoomsByIdQuery,
  useFetchMessagesInChatRoomQuery,
  useLazySearchMessagesInChatRoomQuery,
  useFetchFilesInChatRoomQuery,
  useFetchMediaInChatRoomQuery,
  useSendMessageToChatRoomMutation,
  useSendContactCardsToChatRoomMutation,
  useSendMessageToNewChatRoomMutation,
  useLazyCheckExistingChatRoomQuery,
  useDeleteMessagePermanentMutation,
  useForwardMessageBatchMutation,
  useRecallMessageMutation,
} = chatRoomApi;
