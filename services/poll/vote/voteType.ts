import { IBackendRes } from '@/types/api';
import { Poll } from '@/types/model';

export type VotePollRequest = {
  chatRoomId: number;
  pollId: string;
  optionIds: string[];
};
export type VotePollResponse = IBackendRes<Poll>;
