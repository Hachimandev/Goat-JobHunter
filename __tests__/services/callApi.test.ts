import {
  useStartCallMutation,
  useJoinCallMutation,
  useLeaveCallMutation,
  useDeclineCallMutation,
  useEndCallMutation,
  useGetCurrentCallQuery,
  useIssueCallTokenMutation,
} from "@/services/chatRoom/call/callApi";
import type {
  StartCallRequest,
  JoinCallRequest,
  LeaveCallRequest,
  DeclineCallRequest,
  EndCallRequest,
  GetCurrentCallRequest,
  IssueCallTokenRequest,
} from "@/services/chatRoom/call/callType";
import { CallTypeEnum, CallEndReasonEnum } from "@/types/enum";

describe("callApi exports", () => {
  it("should export useStartCallMutation hook", () => {
    expect(typeof useStartCallMutation).toBe("function");
  });

  it("should export useJoinCallMutation hook", () => {
    expect(typeof useJoinCallMutation).toBe("function");
  });

  it("should export useLeaveCallMutation hook", () => {
    expect(typeof useLeaveCallMutation).toBe("function");
  });

  it("should export useDeclineCallMutation hook", () => {
    expect(typeof useDeclineCallMutation).toBe("function");
  });

  it("should export useEndCallMutation hook", () => {
    expect(typeof useEndCallMutation).toBe("function");
  });

  it("should export useGetCurrentCallQuery hook", () => {
    expect(typeof useGetCurrentCallQuery).toBe("function");
  });

  it("should export useIssueCallTokenMutation hook", () => {
    expect(typeof useIssueCallTokenMutation).toBe("function");
  });
});

describe("callType types", () => {
  it("StartCallRequest should require chatRoomId as number", () => {
    const req: StartCallRequest = {
      chatRoomId: 1,
      publisher: true,
      callType: CallTypeEnum.VIDEO,
    };
    expect(req.chatRoomId).toBe(1);
  });

  it("JoinCallRequest should require chatRoomId and sessionId", () => {
    const req: JoinCallRequest = {
      chatRoomId: 1,
      sessionId: 10,
      publisher: false,
      callType: CallTypeEnum.VOICE,
    };
    expect(req.chatRoomId).toBe(1);
    expect(req.sessionId).toBe(10);
  });

  it("LeaveCallRequest should require chatRoomId and sessionId", () => {
    const req: LeaveCallRequest = {
      chatRoomId: 1,
      sessionId: 10,
    };
    expect(req.chatRoomId).toBe(1);
    expect(req.sessionId).toBe(10);
  });

  it("DeclineCallRequest should require chatRoomId and sessionId", () => {
    const req: DeclineCallRequest = {
      chatRoomId: 1,
      sessionId: 10,
    };
    expect(req.chatRoomId).toBe(1);
    expect(req.sessionId).toBe(10);
  });

  it("EndCallRequest should require chatRoomId, sessionId, and reason", () => {
    const req: EndCallRequest = {
      chatRoomId: 1,
      sessionId: 10,
      reason: CallEndReasonEnum.HANGUP,
    };
    expect(req.chatRoomId).toBe(1);
    expect(req.sessionId).toBe(10);
    expect(req.reason).toBe("HANGUP");
  });

  it("GetCurrentCallRequest should require chatRoomId", () => {
    const req: GetCurrentCallRequest = {
      chatRoomId: 1,
    };
    expect(req.chatRoomId).toBe(1);
  });

  it("IssueCallTokenRequest should require chatRoomId", () => {
    const req: IssueCallTokenRequest = {
      chatRoomId: 1,
      publisher: true,
      sessionId: 10,
    };
    expect(req.chatRoomId).toBe(1);
  });
});
