import { api } from "@/services/api";
import {
  MessageReactionRequest,
  MessageReactionResponse,
} from "./messageReactionType";

export const messageReactionApi = api.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    addReaction: builder.mutation<
      MessageReactionResponse,
      { chatRoomId: number; messageId: string } & MessageReactionRequest
    >({
      query: ({ chatRoomId, messageId, emoji }) => ({
        url: `/chatrooms/${chatRoomId}/messages/${messageId}/reactions`,
        method: "POST",
        data: { emoji },
      }),
      invalidatesTags: (_, __, { chatRoomId }) => [
        { type: "ChatRoom", id: `MESSAGES_${chatRoomId}` },
      ],
    }),
    removeReaction: builder.mutation<
      MessageReactionResponse,
      { chatRoomId: number; messageId: string; emoji: string }
    >({
      query: ({ chatRoomId, messageId, emoji }) => ({
        url: `/chatrooms/${chatRoomId}/messages/${messageId}/reactions/${emoji}`,
        method: "DELETE",
      }),
      invalidatesTags: (_, __, { chatRoomId }) => [
        { type: "ChatRoom", id: `MESSAGES_${chatRoomId}` },
      ],
    }),
    getReactions: builder.query<
      MessageReactionResponse,
      { chatRoomId: number; messageId: string }
    >({
      query: ({ chatRoomId, messageId }) => ({
        url: `/chatrooms/${chatRoomId}/messages/${messageId}/reactions`,
        method: "GET",
      }),
    }),
  }),
});

export const {
  useAddReactionMutation,
  useRemoveReactionMutation,
  useGetReactionsQuery,
} = messageReactionApi;
