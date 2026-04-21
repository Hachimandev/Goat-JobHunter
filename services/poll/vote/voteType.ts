import { IBackendRes } from '@/types/api';
import { Poll, PollVote } from '@/types/model';

export type VotePollRequest = {
  chatRoomId: number;
  pollId: string;
  optionIds: string[];
};
export type VotePollResponse = IBackendRes<Poll>;

export type FetchVotesForPollRequest = {
  chatRoomId: number;
  pollId: string;
};
export type FetchVotesForPollResponse = IBackendRes<PollVote[]>;
