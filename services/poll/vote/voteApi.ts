import { api } from '@/services/api';
import { VotePollRequest, VotePollResponse } from './voteType';

export const voteApi = api.injectEndpoints({
  endpoints: (builder) => ({
    votePoll: builder.mutation<VotePollResponse, VotePollRequest>({
      query: ({ chatRoomId, ...data }) => {
        return {
          url: `/chatrooms/${chatRoomId}/polls/vote`,
          method: 'POST',
          data: data,
        };
      },
      invalidatesTags: (_, __, { chatRoomId }) => [
        { type: 'ChatRoom', id: `POLLS_${chatRoomId}` },
        { type: 'ChatRoom', id: `POLL_${chatRoomId}_${chatRoomId}` },
      ],
    }),
  }),
});

export const { useVotePollMutation } = voteApi;
