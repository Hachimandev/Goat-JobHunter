import { api } from "@/services/api";
import {
  FetchChatRoomsRequest,
  FetchChatRoomsResponse,
  FetchMessagesInChatRoomRequest,
  FetchMessagesInChatRoomResponse,
  SendMessageToChatRoomRequest,
  SendMessageToNewChatRoomRequest,
} from "@/services/chatRoom/chatRoomType";
import { IBackendRes } from "@/types/api";
import { ChatRoom, MessageType } from "@/types/model";

export const chatRoomApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Fetch chat rooms of the current user
    fetchChatRooms: builder.query<
      FetchChatRoomsResponse,
      FetchChatRoomsRequest
    >({
      query: ({ page = 1, size = 50 }) => ({
        url: "/chatrooms/me",
        method: "GET",
        params: { page, size },
        credentials: "include",
      }),
      providesTags: (result) =>
        result?.data?.result
          ? [
              ...result.data.result.map(({ roomId }) => ({
                type: "ChatRoom" as const,
                id: roomId,
              })),
              { type: "ChatRoom", id: "LIST" },
            ]
          : [{ type: "ChatRoom", id: "LIST" }],
    }),

    // Fetch detail chat room by ID
    fetchChatRoomsById: builder.query<IBackendRes<ChatRoom>, number>({
      query: (chatRoomId) => ({
        url: `/chatrooms/${chatRoomId}`,
        method: "GET",
      }),
      providesTags: (result, error, chatRoomId) => [
        { type: "ChatRoom", id: chatRoomId },
      ],
    }),

    // Fetch messages in a specific chat room
    fetchMessagesInChatRoom: builder.query<
      FetchMessagesInChatRoomResponse,
      FetchMessagesInChatRoomRequest
    >({
      query: ({ chatRoomId, page = 1, size = 50 }) => ({
        url: `/chatrooms/${chatRoomId}/messages`,
        method: "GET",
        params: { size, page },
      }),
      providesTags: (_, __, { chatRoomId }) => [
        { type: "ChatRoom", id: `MESSAGES_${chatRoomId}` },
      ],
    }),

    fetchFilesInChatRoom: builder.query<
      FetchMessagesInChatRoomResponse,
      { chatRoomId: number; page?: number }
    >({
      query: ({ chatRoomId, page = 1 }) => ({
        url: `/chatrooms/${chatRoomId}/file`,
        method: "GET",
        params: { page },
      }),
      providesTags: (_, __, { chatRoomId }) => [
        { type: "ChatRoom", id: `MESSAGES_${chatRoomId}` },
      ],
    }),

    fetchMediaInChatRoom: builder.query<
      FetchMessagesInChatRoomResponse,
      { chatRoomId: number; page?: number }
    >({
      query: ({ chatRoomId, page = 1 }) => ({
        url: `/chatrooms/${chatRoomId}/media`,
        method: "GET",
        params: { page },
      }),
      providesTags: (_, __, { chatRoomId }) => [
        { type: "ChatRoom", id: `MESSAGES_${chatRoomId}` },
      ],
    }),

    sendMessageToChatRoom: builder.mutation<
      MessageType,
      SendMessageToChatRoomRequest
    >({
      query: ({ chatRoomId, ...args }) => {
        // @ts-ignore
        const bodyData = args.data || args;

        return {
          url: `/chatrooms/${chatRoomId}/messages`,
          method: "POST",
          data: bodyData,
        };
      },
      invalidatesTags: (result, error, { chatRoomId }) => [
        { type: "ChatRoom", id: `MESSAGES_${chatRoomId}` },
        { type: "ChatRoom", id: "LIST" },
      ],
      async onQueryStarted({ chatRoomId }, { dispatch, queryFulfilled }) {
        try {
          const { data: newMessage } = await queryFulfilled;

          dispatch(
            chatRoomApi.util.updateQueryData(
              "fetchChatRooms",
              { page: 1, size: 50 },
              (draft) => {
                if (draft?.data?.result) {
                  const chatRoomIndex = draft.data.result.findIndex(
                    (room) => room.roomId === chatRoomId,
                  );

                  if (chatRoomIndex !== -1) {
                    const chatRoom = draft.data.result[chatRoomIndex];

                    chatRoom.lastMessagePreview = newMessage.content;
                    chatRoom.lastMessageTime = newMessage.createdAt;

                    if (chatRoomIndex !== 0) {
                      draft.data.result.splice(chatRoomIndex, 1);
                      draft.data.result.unshift(chatRoom);
                    }
                  }
                }
              },
            ),
          );
        } catch (error) {
          console.error("Failed to update cache after sending message:", error);
        }
      },
    }),

    // Send message to a new chat room
    sendMessageToNewChatRoom: builder.mutation<
      IBackendRes<ChatRoom>,
      SendMessageToNewChatRoomRequest
    >({
      query: ({ accountId, content, files }) => {
        const formData = new FormData();

        // Add files nếu có
        if (files && files.length > 0) {
          files.forEach((file) => {
            formData.append("files", file);
          });
        }

        const requestData: { accountId: number; content?: string } = {
          accountId,
        };
        if (content && content.trim()) {
          requestData.content = content;
        }

        // Add content nếu có (dưới dạng JSON part)
        const requestBlob = new Blob([JSON.stringify(requestData)], {
          type: "application/json",
        });
        formData.append("request", requestBlob);

        return {
          url: `/chatrooms/messages`,
          method: "POST",
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
              chatRoomApi.util.updateQueryData(
                "fetchChatRooms",
                { page: 1, size: 50 },
                (draft) => {
                  if (draft?.data?.result) {
                    // Check if chat room already exists
                    const exists = draft.data.result.some(
                      (room) => room.roomId === newChatRoom.roomId,
                    );

                    if (!exists) {
                      // Add new chat room at the top
                      draft.data.result.unshift(newChatRoom);
                    }
                  }
                },
              ),
            );
          }
        } catch (error) {
          console.error(
            "Failed to update cache after creating new chat room:",
            error,
          );
        }
      },
    }),

    // Check if chat room exists between two users, type of chat room is DIRECT
    checkExistingChatRoom: builder.query<IBackendRes<ChatRoom | null>, number>({
      query: (accountId) => ({
        url: `/chatrooms/direct/exists`,
        method: "GET",
        params: { accountId },
      }),
      providesTags: (_, __, accountId) => [
        { type: "ChatRoom", id: `EXISTS_${accountId}` },
      ],
    }),

    // revoke message
    revokeMessage: builder.mutation<
      any,
      { chatRoomId: number; messageId: string }
    >({
      query: ({ chatRoomId, messageId }) => ({
        url: `/chatrooms/${chatRoomId}/messages/${messageId}`,
        method: "DELETE",
      }),
    }),
    // delete permanently
    deleteMessagePermanent: builder.mutation<
      any,
      { chatRoomId: number; messageId: string }
    >({
      query: ({ chatRoomId, messageId }) => ({
        url: `/chatrooms/${chatRoomId}/messages/${messageId}/permanent`,
        method: "DELETE",
      }),
    }),
  }),
});

export const {
  useFetchChatRoomsQuery,
  useFetchChatRoomsByIdQuery,
  useFetchMessagesInChatRoomQuery,
  useFetchFilesInChatRoomQuery,
  useFetchMediaInChatRoomQuery,
  useSendMessageToChatRoomMutation,
  useSendMessageToNewChatRoomMutation,
  useLazyCheckExistingChatRoomQuery,
  useRevokeMessageMutation,
  useDeleteMessagePermanentMutation,
} = chatRoomApi;
