import { api } from '@/services/api';
import { MessageReactionResponse, MessageReactionRequest } from './messageReactionType';

export const messageReactionApi = api.injectEndpoints({
  endpoints: (builder) => ({
    addReaction: builder.mutation<MessageReactionResponse, { chatRoomId: number; messageId: string; emoji: string }>({
      query: ({ chatRoomId, messageId, emoji }) => ({
        url: `/chatrooms/${chatRoomId}/messages/${messageId}/reactions`,
        method: 'POST',
        data: { emoji } satisfies MessageReactionRequest,
      }),
      invalidatesTags: [{ type: 'MessageReaction', id: 'LIST' }],
    }),
    removeReaction: builder.mutation<MessageReactionResponse, { chatRoomId: number; messageId: string; emoji: string }>({
      query: ({ chatRoomId, messageId, emoji }) => ({
        url: `/chatrooms/${chatRoomId}/messages/${messageId}/reactions/${encodeURIComponent(emoji)}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'MessageReaction', id: 'LIST' }],
    }),
    getReactions: builder.query<MessageReactionResponse, { chatRoomId: number; messageId: string }>({
      query: ({ chatRoomId, messageId }) => ({
        url: `/chatrooms/${chatRoomId}/messages/${messageId}/reactions`,
        method: 'GET',
      }),
      providesTags: (_result, _error, { messageId }) => [{ type: 'MessageReaction', id: messageId }],
    }),
  }),
});

export const { useAddReactionMutation, useRemoveReactionMutation, useGetReactionsQuery } = messageReactionApi;
