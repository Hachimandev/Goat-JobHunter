import { api } from "@/services/api";
import {
  FetchPinnedMessagesInChatRoomResponse,
  PinMessageRequest,
  PinMessageResponse,
} from "./pinnedMessageType";

export const pinnedMessageApi = api.injectEndpoints({
  endpoints: (builder) => ({
    pinMessage: builder.mutation<PinMessageResponse, PinMessageRequest>({
      query: ({ chatRoomId, messageId }) => ({
        url: `/chatrooms/${chatRoomId}/messages/${messageId}/pin`,
        method: "POST",
      }),
      invalidatesTags: (_, __, { chatRoomId }) => [
        { type: "ChatRoom", id: chatRoomId },
      ],
    }),
    unpinMessage: builder.mutation<void, PinMessageRequest>({
      query: ({ chatRoomId, messageId }) => ({
        url: `/chatrooms/${chatRoomId}/messages/${messageId}/pin`,
        method: "DELETE",
      }),
      invalidatesTags: (_, __, { chatRoomId }) => [
        { type: "ChatRoom", id: chatRoomId },
      ],
    }),
    getPinnedMessages: builder.query<
      FetchPinnedMessagesInChatRoomResponse,
      { chatRoomId: number }
    >({
      query: ({ chatRoomId }) => ({
        url: `/chatrooms/${chatRoomId}/pinned-messages`,
        method: "GET",
      }),
    }),
  }),
});

export const {
  usePinMessageMutation,
  useUnpinMessageMutation,
  useGetPinnedMessagesQuery,
} = pinnedMessageApi;
