import { api } from "@/services/api";
import {
  CountUnreadMessagesRequest,
  CountUnreadMessagesResponse,
  FetchChatRoomsRequest,
  FetchChatRoomsResponse,
  FetchMessagesInChatRoomRequest,
  FetchMessagesInChatRoomResponse,
  SendMessageToChatRoomRequest,
  SendMessageToNewChatRoomRequest,
  TypingIndicatorRequest,
  TypingIndicatorResponse,
} from "@/services/chatRoom/chatRoomType";
import { IBackendRes } from "@/types/api";
import { ChatRoom, MessageType } from "@/types/model";
import { pinnedMessageApi } from "./pinned_message/pinnedMessageApi";

export const chatRoomApi = api.injectEndpoints({
  overrideExisting: true,
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
      async onQueryStarted(
        { chatRoomId, content, replyToMessageId },
        { dispatch, queryFulfilled, getState },
      ) {
        const tempId = `temp-${Date.now()}`;
        const state = getState() as any;

        const messagesCache =
          chatRoomApi.endpoints.fetchMessagesInChatRoom.select({
            chatRoomId,
            size: 50,
            page: 1,
          })(state);

        const originalMsg = messagesCache?.data?.data?.result?.find(
          (m: any) => m.messageId === replyToMessageId,
        );

        const patchResult = dispatch(
          chatRoomApi.util.updateQueryData(
            "fetchMessagesInChatRoom",
            { chatRoomId, size: 50, page: 1 },
            (draft) => {
              if (draft?.data?.result) {
                const optimisticMsg: any = {
                  messageId: tempId,
                  content: content || "",
                  sender: state.auth?.user || {},
                  createdAt: new Date().toISOString(),
                  sending: true,
                  replyContext: originalMsg
                    ? {
                        originalMessageId: originalMsg.messageId,
                        originalSender: originalMsg.sender,
                        contentPreview: originalMsg.content,
                      }
                    : null,
                };
                draft.data.result.unshift(optimisticMsg);
              }
            },
          ),
        );

        try {
          const { data: newMessage } = await queryFulfilled;
          dispatch(
            chatRoomApi.util.updateQueryData(
              "fetchMessagesInChatRoom",
              { chatRoomId, size: 50, page: 0 },
              (draft) => {
                if (draft?.data?.result) {
                  const index = draft.data.result.findIndex(
                    (m) => m.messageId === tempId,
                  );
                  if (index !== -1) draft.data.result[index] = newMessage;
                }
              },
            ),
          );
        } catch (error) {
          patchResult.undo();
          console.error("Gửi tin thất bại:", error);
        }
      },
    }),

    sendMessageToNewChatRoom: builder.mutation<
      IBackendRes<ChatRoom>,
      SendMessageToNewChatRoomRequest
    >({
      query: ({ accountId, content, files }) => {
        const formData = new FormData();

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

        formData.append("request", {
          string: JSON.stringify(requestData),
          type: "application/json",
        } as any);

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

            dispatch(
              chatRoomApi.util.updateQueryData(
                "fetchChatRooms",
                { page: 1, size: 50 },
                (draft) => {
                  if (draft?.data?.result) {
                    const exists = draft.data.result.some(
                      (room) => room.roomId === newChatRoom.roomId,
                    );

                    if (!exists) {
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
          dispatch(
            chatRoomApi.util.updateQueryData(
              "fetchMessagesInChatRoom",
              { chatRoomId, page: 0, size: 50 },
              (draft) => {
                if (draft?.data?.result) {
                  const msg = draft.data.result.find(
                    (m) => m.messageId === messageId,
                  );
                  if (msg) {
                    msg.isHidden = true;
                    msg.content = "Tin nhắn đã được thu hồi";
                  }
                }
              },
            ),
          );
          dispatch(
            chatRoomApi.util.invalidateTags([{ type: "ChatRoom", id: "LIST" }]),
          );
        } catch (error) {
          console.error("Failed to recall message:", error);
        }
      },
    }),

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
          dispatch(
            chatRoomApi.util.updateQueryData(
              "fetchMessagesInChatRoom",
              { chatRoomId, page: 0, size: 50 },
              (draft) => {
                if (draft?.data?.result) {
                  draft.data.result = draft.data.result.filter(
                    (m) => m.messageId !== messageId,
                  );
                }
              },
            ),
          );
          dispatch(
            chatRoomApi.util.invalidateTags([{ type: "ChatRoom", id: "LIST" }]),
          );
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

    countUnreadMessagesByCurrentAccount: builder.query<
      CountUnreadMessagesResponse,
      CountUnreadMessagesRequest
    >({
      query: ({ page = 1, size = 50 }) => ({
        url: "/chatrooms/me/unread-count",
        method: "GET",
        params: { page, size },
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ chatRoomId }) => ({
                type: "ChatRoom" as const,
                id: chatRoomId,
              })),
              { type: "ChatRoom", id: "LIST" },
            ]
          : [{ type: "ChatRoom", id: "LIST" }],
    }),

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

    setTypingIndicator: builder.mutation<
      TypingIndicatorResponse,
      TypingIndicatorRequest
    >({
      query: ({ chatRoomId, typing }) => ({
        url: `/chatrooms/${chatRoomId}/typing`,
        method: "PUT",
        data: { typing },
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
  useCountUnreadMessagesByCurrentAccountQuery,
  useForwardMessageBatchMutation,
  useSetTypingIndicatorMutation,
} = chatRoomApi;
