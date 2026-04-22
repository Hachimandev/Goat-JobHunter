import { IBackendRes } from '@/types/api';
import { Poll } from '@/types/model';

export type FetchPollsInChatRoomRequest = {
  chatRoomId: number;
  page?: number;
  size?: number;
};
export type FetchPollsInChatRoomResponse = IBackendRes<Poll[]>;

export type FetchPollByIdInChatRoomRequest = {
  chatRoomId: string;
  pollId: string;
};
export type FetchPollByIdInChatRoomResponse = IBackendRes<Poll>;

export type CreatePollRequest = {
  chatRoomId: number;
  question: string;
  options: string[];
  multipleChoice: boolean;
  allowAddOption: boolean;
  pinned: boolean;
  expiresAt: string;
};
export type CreatePollResponse = IBackendRes<Poll>;

export type ClosePollRequest = {
  chatRoomId: number;
  pollId: string;
};
export type ClosePollResponse = IBackendRes<Poll>;
