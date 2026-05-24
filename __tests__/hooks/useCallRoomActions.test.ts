import { CallEndReasonEnum, CallStatusEnum, CallTypeEnum } from "@/types/enum";

describe("useCallRoomActions", () => {
  const fs = require("fs");
  const path = require("path");
  const hookPath = path.join(__dirname, "../../hooks/useCallRoomActions.ts");
  const content = fs.readFileSync(hookPath, "utf-8");

  it("should export useCallRoomActions as a named function", () => {
    expect(content).toContain("export function useCallRoomActions");
  });

  it("should have correct imports", () => {
    expect(content).toContain("from \"@/lib/features/callSlice\"");
    expect(content).toContain("from \"@/lib/features/callDevicePreferencesSlice\"");
    expect(content).toContain("from \"@/services/chatRoom/call/callApi\"");
    expect(content).toContain("from \"@/services/callRtc/AgoraMobileRtcClient\"");
    expect(content).toContain("from \"@/services/callRtc/agoraUid\"");
  });

  it("should export all required action handlers", () => {
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
  });

  it("should use RTK Query mutations", () => {
    expect(content).toContain("useStartCallMutation");
    expect(content).toContain("useJoinCallMutation");
    expect(content).toContain("useLeaveCallMutation");
    expect(content).toContain("useDeclineCallMutation");
    expect(content).toContain("useEndCallMutation");
    expect(content).toContain("useIssueCallTokenMutation");
  });

  it("should configure RTC callbacks", () => {
    expect(content).toContain("agoraMobileRtcClient.configure");
    expect(content).toContain("onConnectionStateChange");
    expect(content).toContain("onRemoteParticipantsStateChange");
    expect(content).toContain("onLocalMediaStateChange");
    expect(content).toContain("onTokenWillExpire");
    expect(content).toContain("onError");
  });

  it("should handle permissions for Android", () => {
    expect(content).toContain("PermissionsAndroid.requestMultiple");
    expect(content).toContain("RECORD_AUDIO");
    expect(content).toContain("CAMERA");
  });

  it("should return all expected values", () => {
    expect(content).toContain("isRtcReady");
    expect(content).toContain("currentCall");
    expect(content).toContain("incomingCall");
    expect(content).toContain("callError");
    expect(content).toContain("rtcConnectionState");
    expect(content).toContain("localAudioEnabled");
    expect(content).toContain("localVideoEnabled");
    expect(content).toContain("remoteAudioActive");
    expect(content).toContain("remoteVideoActive");
    expect(content).toContain("participantMediaStates");
    expect(content).toContain("speakerEnabled");
  });
});
