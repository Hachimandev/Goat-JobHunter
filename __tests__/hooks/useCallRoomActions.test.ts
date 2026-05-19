import { CallEndReasonEnum, CallStatusEnum, CallTypeEnum } from "@/types/enum";

describe("useCallRoomActions", () => {
  it("should exist and be a function", () => {
    const { useCallRoomActions } = require("@/hooks/useCallRoomActions");
    expect(typeof useCallRoomActions).toBe("function");
  });

  it("should export the hook from the correct file path", () => {
    const module = require("@/hooks/useCallRoomActions");
    expect(module.useCallRoomActions).toBeDefined();
  });

  it("should have correct imports in the source file", () => {
    const fs = require("fs");
    const path = require("path");
    const hookPath = path.join(__dirname, "../../hooks/useCallRoomActions.ts");
    const content = fs.readFileSync(hookPath, "utf-8");

    expect(content).toContain("export function useCallRoomActions");
    expect(content).toContain("handleStartCall");
    expect(content).toContain("handleJoinCallSession");
    expect(content).toContain("handleAcceptIncomingCall");
    expect(content).toContain("handleDeclineIncomingCall");
    expect(content).toContain("handleEndCall");
    expect(content).toContain("handleLeaveCall");
    expect(content).toContain("handleToggleLocalAudio");
    expect(content).toContain("handleToggleLocalVideo");
    expect(content).toContain("handleToggleSpeaker");
    expect(content).toContain("handleSwitchCamera");
    expect(content).toContain("watchChatRoom");
  });
});
