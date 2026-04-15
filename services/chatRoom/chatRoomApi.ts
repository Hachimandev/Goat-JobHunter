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
import { pinnedMessageApi } from "./pinned_message/pinnedMessageApi";

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

    // 1. THU HỒI TIN NHẮN (Recall/Revoke)
    revokeMessage: builder.mutation<
      IBackendRes<null>,
      { chatRoomId: number; messageId: string }
    >({
      query: ({ chatRoomId, messageId }) => ({
        url: `/chatrooms/${chatRoomId}/messages/${messageId}`,
        method: "DELETE",
      }),
      async onQueryStarted(
        { chatRoomId, messageId },
        { dispatch, queryFulfilled },
      ) {
        try {
          await queryFulfilled;
          // Cập nhật cache của tin nhắn trong phòng: Đổi content thành "Tin nhắn đã được thu hồi"
          dispatch(
            chatRoomApi.util.updateQueryData(
              "fetchMessagesInChatRoom",
              { chatRoomId, page: 0, size: 50 },
              (draft) => {
                const msg = draft?.data?.find((m) => m.messageId === messageId);
                if (msg) {
                  msg.isHidden = true;
                  msg.content = "Tin nhắn đã được thu hồi";
                }
              },
            ),
          );
          // Làm mới danh sách phòng chat bên ngoài
          dispatch(
            chatRoomApi.util.invalidateTags([{ type: "ChatRoom", id: "LIST" }]),
          );
        } catch (error) {
          console.error("Failed to recall message:", error);
        }
      },
    }),

    // 2. XÓA VĨNH VIỄN (Delete Permanently)
    deleteMessagePermanent: builder.mutation<
      IBackendRes<null>,
      { chatRoomId: number; messageId: string }
    >({
      query: ({ chatRoomId, messageId }) => ({
        url: `/chatrooms/${chatRoomId}/messages/${messageId}/permanent`,
        method: "DELETE",
      }),
      async onQueryStarted(
        { chatRoomId, messageId },
        { dispatch, queryFulfilled },
      ) {
        try {
          await queryFulfilled;
          // Xóa hẳn tin nhắn khỏi cache
          dispatch(
            chatRoomApi.util.updateQueryData(
              "fetchMessagesInChatRoom",
              { chatRoomId, page: 0, size: 50 },
              (draft) => {
                if (draft?.data) {
                  draft.data = draft.data.filter(
                    (m) => m.messageId !== messageId,
                  );
                }
              },
            ),
          );
          dispatch(
            chatRoomApi.util.invalidateTags([{ type: "ChatRoom", id: "LIST" }]),
          );
          // Nếu có ghim, cũng invalidate tag ghim
          dispatch(
            pinnedMessageApi.util.invalidateTags([
              { type: "PinnedMessage", id: `PINNED_MESSAGE_${chatRoomId}` },
            ]),
          );
        } catch (error) {
          console.error("Failed to delete message permanent:", error);
        }
      },
    }),

    // 3. CHUYỂN TIẾP TIN NHẮN (Forward Batch)
    forwardMessageBatch: builder.mutation<
      IBackendRes<any>,
      {
        sourceChatRoomId: number;
        messageId: string;
        targetChatRoomIds: number[];
      }
    >({
      query: ({ sourceChatRoomId, messageId, targetChatRoomIds }) => ({
        url: `/chatrooms/${sourceChatRoomId}/messages/${messageId}/forward`,
        method: "POST",
        data: { targetChatRoomIds },
      }),
      async onQueryStarted(
        { targetChatRoomIds },
        { dispatch, queryFulfilled },
      ) {
        try {
          await queryFulfilled;
          // Sau khi chuyển tiếp thành công, làm mới cache các phòng nhận được tin
          const messageTags = targetChatRoomIds.map((id) => ({
            type: "ChatRoom" as const,
            id: `MESSAGES_${id}`,
          }));
          dispatch(
            chatRoomApi.util.invalidateTags([
              ...messageTags,
              { type: "ChatRoom", id: "LIST" },
            ]),
          );
        } catch (error) {
          console.error("Failed to forward message batch:", error);
        }
      },
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
  useForwardMessageBatchMutation,
} = chatRoomApi;
