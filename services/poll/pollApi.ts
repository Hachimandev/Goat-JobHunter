import { api } from "@/services/api";
import {
  AddOptionRequest,
  AddOptionResponse,
  ClosePollRequest,
  ClosePollResponse,
  CreatePollRequest,
  CreatePollResponse,
  FetchPollByIdInChatRoomRequest,
  FetchPollByIdInChatRoomResponse,
  FetchPollsInChatRoomRequest,
  FetchPollsInChatRoomResponse,
} from "./pollType";

export const pollApi = api.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    fetchPollsInChatRoom: builder.query<
      FetchPollsInChatRoomResponse,
      FetchPollsInChatRoomRequest
    >({
      query: ({ chatRoomId, page = 1, size = 10 }) => ({
        url: `/chatrooms/${chatRoomId}/polls`,
        method: "GET",
        params: { size, page },
      }),
      providesTags: (result, error, { chatRoomId }) => [
        { type: "ChatRoom", id: `POLLS_${chatRoomId}` },
      ],
    }),

    fetchPollByIdInChatRoom: builder.query<
      FetchPollByIdInChatRoomResponse,
      FetchPollByIdInChatRoomRequest
    >({
      query: ({ chatRoomId, pollId }) => ({
        url: `/chatrooms/${chatRoomId}/polls/${pollId}`,
        method: "GET",
      }),
      providesTags: (result, error, { pollId }) => [
        { type: "ChatRoom", id: `POLL_DETAIL_${pollId}` },
      ],
    }),

    createPoll: builder.mutation<CreatePollResponse, CreatePollRequest>({
      query: ({ chatRoomId, ...data }) => ({
        url: `/chatrooms/${chatRoomId}/polls`,
        method: "POST",
        data: data,
      }),
      invalidatesTags: (result, error, { chatRoomId }) => [
        { type: "ChatRoom", id: `MESSAGES_${chatRoomId}` },
      ],
    }),

    addOptions: builder.mutation<AddOptionResponse, AddOptionRequest>({
      query: ({ chatRoomId, pollId, ...data }) => ({
        url: `/chatrooms/${chatRoomId}/polls/${pollId}/options`,
        method: "POST",
        data: data,
      }),
      invalidatesTags: (result, error, { pollId }) => [
        { type: "ChatRoom", id: `POLL_DETAIL_${pollId}` },
      ],
    }),

    closePoll: builder.mutation<ClosePollResponse, ClosePollRequest>({
      query: ({ chatRoomId, pollId }) => ({
        url: `/chatrooms/${chatRoomId}/polls/${pollId}/close`,
        method: "POST",
      }),
      invalidatesTags: (result, error, { pollId }) => [
        { type: "ChatRoom", id: `POLL_DETAIL_${pollId}` },
      ],
    }),
  }),
});

export const {
  useFetchPollsInChatRoomQuery,
  useFetchPollByIdInChatRoomQuery,
  useCreatePollMutation,
  useAddOptionsMutation,
  useClosePollMutation,
} = pollApi;
