import { api } from "@/services/api";
import {
  FetchVotesForPollRequest,
  FetchVotesForPollResponse,
  VotePollRequest,
  VotePollResponse,
} from "./voteType";

export const voteApi = api.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    votePoll: builder.mutation<VotePollResponse, VotePollRequest>({
      query: ({ chatRoomId, ...data }) => ({
        url: `/chatrooms/${chatRoomId}/polls/vote`,
        method: "POST",
        data: data,
      }),
      invalidatesTags: (result, error, { chatRoomId, pollId }) => [
        { type: "ChatRoom", id: `POLL_DETAIL_${pollId}` },
        { type: "ChatRoom", id: `MESSAGES_${chatRoomId}` },
      ],
    }),

    fetchVotesForPoll: builder.query<
      FetchVotesForPollResponse,
      FetchVotesForPollRequest
    >({
      query: ({ chatRoomId, pollId }) => ({
        url: `/chatrooms/${chatRoomId}/polls/${pollId}/votes`,
        method: "GET",
      }),
      providesTags: (result, error, { pollId }) => [
        { type: "ChatRoom", id: `VOTES_${pollId}` },
      ],
    }),
  }),
});

export const { useVotePollMutation, useFetchVotesForPollQuery } = voteApi;
