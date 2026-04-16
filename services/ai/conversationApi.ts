import { api } from '@/services/api';
import {
  ChatAIRequest,
  CreateConversationRequest,
  DeleteConversationRequest,
  ConversationPinnedResponse,
  ConversationResponse,
  GetConversationMessagesParams,
  GetConversationsParams,
  GetConversationsResponse,
  GetMessageOfConversationResponse,
  RenameConversationRequest,
  UpdateConversationPinRequest,
} from '@/services/ai/conversationType';

export const conversationApi = api.injectEndpoints({
  endpoints: (builder) => ({
    aiChat: builder.mutation<string, ChatAIRequest>({
      query: ({ message, conversationId }) => ({
        url: '/ai/chat',
        method: 'POST',
        data: { message, conversationId },
      }),
      invalidatesTags: () => [{ type: 'AIConversation', id: 'LIST' }],
    }),
    // Get all conversations with filter
    getConversations: builder.query<GetConversationsResponse, GetConversationsParams>({
      query: (params) => ({
        url: '/ai/conversations',
        method: 'GET',
        params,
      }),
      serializeQueryArgs: ({ endpointName, queryArgs }) => {
        const normalizedTitle = queryArgs?.title?.trim().toLowerCase() || '';
        return `${endpointName}-${normalizedTitle}`;
      },
      merge: (currentCache, incomingCache, { arg }) => {
        const currentPage = arg?.page ?? 1;
        if (currentPage <= 1 || !currentCache.data) {
          currentCache.statusCode = incomingCache.statusCode;
          currentCache.message = incomingCache.message;
          currentCache.error = incomingCache.error;
          currentCache.data = incomingCache.data;
          return;
        }

        if (!incomingCache.data) {
          return;
        }

        const currentResult = currentCache.data.result || [];
        const incomingResult = incomingCache.data.result || [];

        const existingIds = new Set(currentResult.map((conversation) => conversation.conversationId));
        const uniqueIncoming = incomingResult.filter((conversation) => !existingIds.has(conversation.conversationId));

        currentCache.statusCode = incomingCache.statusCode;
        currentCache.message = incomingCache.message;
        currentCache.error = incomingCache.error;
        currentCache.data = {
          ...incomingCache.data,
          meta: incomingCache.data.meta,
          result: [...currentResult, ...uniqueIncoming],
        };
      },
      forceRefetch: ({ currentArg, previousArg }) => {
        return (
          currentArg?.page !== previousArg?.page ||
          currentArg?.size !== previousArg?.size ||
          currentArg?.title !== previousArg?.title
        );
      },
      providesTags: [{ type: 'AIConversation', id: 'LIST' }],
    }),

    // Get conversation by ID
    getConversationById: builder.query<ConversationResponse, number>({
      query: (id) => ({
        url: `/ai/conversations/${id}`,
      }),
      providesTags: (result, error, id) => [{ type: 'AIConversation', id }],
    }),

    // Create conversation
    createConversation: builder.mutation<ConversationResponse, CreateConversationRequest | void>({
      query: (body) => ({
        url: '/ai/conversations',
        method: 'POST',
        data: body,
      }),
      invalidatesTags: [{ type: 'AIConversation', id: 'LIST' }],
    }),

    // Rename conversation
    renameConversation: builder.mutation<ConversationResponse, RenameConversationRequest>({
      query: ({ conversationId, title }) => ({
        url: `/ai/conversations/${conversationId}/title`,
        method: 'PATCH',
        data: { title },
      }),
      invalidatesTags: (result, error, arg) => [
        { type: 'AIConversation', id: arg.conversationId },
        { type: 'AIConversation', id: 'LIST' },
      ],
    }),

    // Pin or unpin conversation
    updateConversationPin: builder.mutation<ConversationPinnedResponse, UpdateConversationPinRequest>({
      query: ({ conversationId, pinned }) => ({
        url: `/ai/conversations/${conversationId}/pin`,
        method: 'PATCH',
        data: { pinned },
      }),
      invalidatesTags: (result, error, arg) => [
        { type: 'AIConversation', id: arg.conversationId },
        { type: 'AIConversation', id: 'LIST' },
      ],
    }),

    // Delete conversation
    deleteConversation: builder.mutation<IBackendDeleteResponse, DeleteConversationRequest>({
      query: ({ conversationId }) => ({
        url: `/ai/conversations/${conversationId}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'AIConversation', id: 'LIST' }],
    }),

    // get message of a conversation by id
    getConversationMessages: builder.query<GetMessageOfConversationResponse, GetConversationMessagesParams>({
      query: ({ conversationId, page = 1, size = 20 }) => ({
        url: `/ai/conversations/${conversationId}/messages`,
        method: 'GET',
        params: {
          page,
          size,
        },
      }),
      providesTags: (result, error, { conversationId }) => [
        { type: 'AIConversation', id: conversationId },
        { type: 'AIMessage', id: conversationId },
      ],
    }),
  }),
});

type IBackendDeleteResponse = {
  statusCode: number;
  message: string;
  data?: null;
  error?: string | null;
};

export const {
  useAiChatMutation,
  useGetConversationsQuery,
  useLazyGetConversationsQuery,
  useGetConversationByIdQuery,
  useCreateConversationMutation,
  useRenameConversationMutation,
  useUpdateConversationPinMutation,
  useDeleteConversationMutation,

  useGetConversationMessagesQuery,
} = conversationApi;
