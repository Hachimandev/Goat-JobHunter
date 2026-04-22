import { api } from '@/services/api';
import {
  ClosePollRequest,
  ClosePollResponse,
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
      providesTags: (_, __, { chatRoomId }) => [{ type: 'Poll', id: `POLLS_${chatRoomId}` }],
    }),

    fetchPollByIdInChatRoom: builder.query<FetchPollByIdInChatRoomResponse, FetchPollByIdInChatRoomRequest>({
      query: ({ chatRoomId, pollId }) => ({
        url: `/chatrooms/${chatRoomId}/polls/${pollId}`,
        method: 'GET',
      }),
      providesTags: (_, __, { chatRoomId, pollId }) => [
        { type: 'ChatRoom', id: `POLL_${chatRoomId}_${chatRoomId}` },
        { type: 'Poll', id: `POLL_${pollId}` },
      ],
    }),

    createPoll: builder.mutation<CreatePollResponse, CreatePollRequest>({
      query: ({ chatRoomId, ...data }) => {
        return {
          url: `/chatrooms/${chatRoomId}/polls`,
          method: 'POST',
          data: data,
        };
      },
      invalidatesTags: (_, __, { chatRoomId }) => [{ type: 'ChatRoom', id: `POLL_${chatRoomId}_${chatRoomId}` }],
    }),

    closePoll: builder.mutation<ClosePollResponse, ClosePollRequest>({
      query: ({ chatRoomId, ...data }) => {
        return {
          url: `/chatrooms/${chatRoomId}/polls/close`,
          method: 'POST',
          data: data,
        };
      },
      invalidatesTags: (_, __, { chatRoomId, pollId }) => [
        { type: 'ChatRoom', id: `POLL_${chatRoomId}_${chatRoomId}` },
        { type: 'Poll', id: `POLL_${pollId}` },
      ],
    }),
  }),
});

export const {
  useFetchPollsInChatRoomQuery,
  useFetchPollByIdInChatRoomQuery,
  useCreatePollMutation,
  useClosePollMutation,
} = pollApi;
