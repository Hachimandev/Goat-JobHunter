import { api } from '@/services/api';
import {
  CreatePollRequest,
  CreatePollResponse,
  FetchPollByIdInChatRoomRequest,
  FetchPollByIdInChatRoomResponse,
  FetchPollsInChatRoomRequest,
  FetchPollsInChatRoomResponse,
} from './pollType';

export const pollApi = api.injectEndpoints({
  endpoints: (builder) => ({
    fetchPollsInChatRoom: builder.query<FetchPollsInChatRoomResponse, FetchPollsInChatRoomRequest>({
      query: ({ chatRoomId, page = 1, size = 10 }) => ({
        url: `/chatrooms/${chatRoomId}/polls`,
        method: 'GET',
        params: { size, page },
      }),
      providesTags: (_, __, { chatRoomId }) => [{ type: 'ChatRoom', id: `POLLS_${chatRoomId}` }],
    }),

    fetchPollByIdInChatRoom: builder.query<FetchPollByIdInChatRoomResponse, FetchPollByIdInChatRoomRequest>({
      query: ({ chatRoomId, pollId }) => ({
        url: `/chatrooms/${chatRoomId}/polls/${pollId}`,
        method: 'GET',
      }),
      providesTags: (_, __, { chatRoomId }) => [{ type: 'ChatRoom', id: `POLL_${chatRoomId}_${chatRoomId}` }],
    }),

    createPoll: builder.mutation<CreatePollResponse, CreatePollRequest>({
      query: ({ chatRoomId, ...data }) => {
        return {
          url: `/chatrooms/${chatRoomId}/polls`,
          method: 'POST',
          data: data,
        };
      },
      invalidatesTags: (_, __, { chatRoomId }) => [{ type: 'ChatRoom', id: `POLLS_${chatRoomId}` }],
    }),
  }),
});

export const { useFetchPollsInChatRoomQuery, useFetchPollByIdInChatRoomQuery, useCreatePollMutation } = pollApi;
