import { IBackendRes } from "@/types/api";
import { CallEndReasonEnum, CallTypeEnum } from "@/types/enum";
import { CallSession, CallTokenResponse } from "@/types/model";

export type StartCallRequest = {
  chatRoomId: number;
  publisher?: boolean;
  callType?: CallTypeEnum;
};

export type StartCallResponse = IBackendRes<CallSession>;

export type JoinCallRequest = {
  chatRoomId: number;
  sessionId: number;
  publisher?: boolean;
  callType?: CallTypeEnum;
};

export type JoinCallResponse = IBackendRes<CallSession>;

export type LeaveCallRequest = {
  chatRoomId: number;
  sessionId: number;
};

export type LeaveCallResponse = IBackendRes<CallSession>;

export type DeclineCallRequest = {
  chatRoomId: number;
  sessionId: number;
};

export type DeclineCallResponse = IBackendRes<CallSession>;

export type EndCallRequest = {
  chatRoomId: number;
  sessionId: number;
  reason: CallEndReasonEnum;
};

export type EndCallResponse = IBackendRes<CallSession>;

export type GetCurrentCallRequest = {
  chatRoomId: number;
};

export type GetCurrentCallResponse = IBackendRes<CallSession>;

export type IssueCallTokenRequest = {
  chatRoomId: number;
  publisher?: boolean;
  sessionId?: number;
};

export type IssueCallTokenResponse = IBackendRes<CallTokenResponse>;
