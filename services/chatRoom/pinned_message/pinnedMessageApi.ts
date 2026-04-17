import { api } from '@/services/api';
import {
  FetchPinnedMessagesInChatRoomRequest,
  FetchPinnedMessagesInChatRoomResponse,
  PinMessageRequest,
  PinMessageResponse,
} from './pinnedMessageType';

export const pinnedMessageApi = api.injectEndpoints({
  endpoints: (builder) => ({
    pinMessage: builder.mutation<PinMessageResponse, PinMessageRequest>({
      query: ({ chatRoomId, messageId }) => ({
        url: `/chatrooms/${chatRoomId}/messages/${messageId}/pin`,
        method: 'POST',
      }),
      invalidatesTags: (_, __, { chatRoomId }) => [{ type: 'PinnedMessage', id: `PINNED_MESSAGE_${chatRoomId}` }],
    }),

    unpinMessage: builder.mutation<void, PinMessageRequest>({
      query: ({ chatRoomId, messageId }) => ({
        url: `/chatrooms/${chatRoomId}/messages/${messageId}/pin`,
        method: 'DELETE',
      }),
      invalidatesTags: (_, __, { chatRoomId }) => [{ type: 'PinnedMessage', id: `PINNED_MESSAGE_${chatRoomId}` }],
    }),

    getPinnedMessages: builder.query<FetchPinnedMessagesInChatRoomResponse, FetchPinnedMessagesInChatRoomRequest>({
      query: ({ chatRoomId }) => ({
        url: `/chatrooms/${chatRoomId}/pinned-messages`,
        method: 'GET',
      }),
      providesTags: (_, __, { chatRoomId }) => [{ type: 'PinnedMessage', id: `PINNED_MESSAGE_${chatRoomId}` }],
    }),

    clearAllPinnedMessages: builder.mutation<void, Omit<PinMessageRequest, 'messageId'>>({
      query: ({ chatRoomId }) => ({
        url: `/chatrooms/${chatRoomId}/pinned-messages`,
        method: 'DELETE',
      }),
      invalidatesTags: (_, __, { chatRoomId }) => [{ type: 'PinnedMessage', id: `PINNED_MESSAGE_${chatRoomId}` }],
    }),

    getPinnedMessageDetail: builder.query<PinMessageResponse, PinMessageRequest>({
      query: ({ chatRoomId, messageId }) => ({
        url: `/chatrooms/${chatRoomId}/pinned-messages/${messageId}`,
        method: 'GET',
      }),
      providesTags: (_, __, { chatRoomId }) => [{ type: 'PinnedMessage', id: `PINNED_MESSAGE_${chatRoomId}` }],
    }),

    isMessagePinned: builder.query<boolean, PinMessageRequest>({
      query: ({ chatRoomId, messageId }) => ({
        url: `/chatrooms/${chatRoomId}/messages/${messageId}/pinned`,
        method: 'GET',
      }),
      providesTags: (_, __, { chatRoomId }) => [{ type: 'PinnedMessage', id: `PINNED_MESSAGE_${chatRoomId}` }],
    }),
  }),
});

export const {
  usePinMessageMutation,
  useUnpinMessageMutation,
  useGetPinnedMessagesQuery,
  useClearAllPinnedMessagesMutation,
  useGetPinnedMessageDetailQuery,
  useIsMessagePinnedQuery,
} = pinnedMessageApi;
