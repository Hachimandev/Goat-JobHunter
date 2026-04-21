import { IBackendRes } from '@/types/api';
import { CallSession } from '@/types/model';
import { CallTypeEnum } from '@/types/enum';

export type InitiateCallRequest = {
  chatRoomId: number;
  callType: CallTypeEnum;
  participantIds?: number[];
};

export type InitiateCallResponse = IBackendRes<CallSession>;

export type AcceptCallRequest = {
  chatRoomId: number;
  callId: string;
};

export type DeclineCallRequest = {
  chatRoomId: number;
  callId: string;
};

export type EndCallRequest = {
  chatRoomId: number;
  callId: string;
};

export type GetActiveCallRequest = {
  chatRoomId: number;
};

export type GetCallParticipantsRequest = {
  chatRoomId: number;
  callId: string;
};

export type CallParticipantsResponse = IBackendRes<CallSession['participants']>;
