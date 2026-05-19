import {
  createAgoraRtcEngine,
  ConnectionStateType,
  ChannelProfileType,
  ClientRoleType,
} from "react-native-agora";
import { CallTypeEnum } from "@/types/enum";
import { agoraMobileRtcClient } from "@/services/callRtc/AgoraMobileRtcClient";

jest.mock("react-native-agora", () => ({
  createAgoraRtcEngine: jest.fn(),
  ConnectionStateType: {
    ConnectionStateConnecting: 1,
    ConnectionStateConnected: 2,
    ConnectionStateReconnecting: 3,
    ConnectionStateFailed: 5,
    ConnectionStateDisconnected: 4,
  },
  ChannelProfileType: { ChannelProfileCommunication: 0 },
  ClientRoleType: { ClientRoleBroadcaster: 1 },
}));

const mockEngine = {
  initialize: jest.fn(),
  enableAudio: jest.fn(),
  enableVideo: jest.fn(),
  startPreview: jest.fn(),
  stopPreview: jest.fn(),
  setEnableSpeakerphone: jest.fn(),
  registerEventHandler: jest.fn(),
  unregisterEventHandler: jest.fn(),
  joinChannel: jest.fn(),
  leaveChannel: jest.fn(),
  release: jest.fn(),
  muteLocalAudioStream: jest.fn(),
  muteLocalVideoStream: jest.fn(),
  renewToken: jest.fn(),
  switchCamera: jest.fn(),
};

const defaultParams = {
  sessionId: 1,
  callType: CallTypeEnum.VOICE,
  appId: "test-app-id",
  channelName: "test-channel",
  token: "test-token",
  uid: 100,
};

async function flushQueue() {
  await new Promise((resolve) => setTimeout(resolve, 0));
}

describe("AgoraMobileRtcClient", () => {
  let eventHandler: Record<string, Function> | null = null;

  beforeEach(() => {
    jest.clearAllMocks();
    (createAgoraRtcEngine as jest.Mock).mockReturnValue(mockEngine);
    mockEngine.registerEventHandler.mockImplementation((handler) => {
      eventHandler = handler;
    });
  });

  afterEach(async () => {
    await agoraMobileRtcClient.cleanup();
    await flushQueue();
    eventHandler = null;
  });

  describe("joinAndPublish", () => {
    it("should call engine.initialize with correct params for VOICE call", async () => {
      await agoraMobileRtcClient.joinAndPublish(defaultParams);
      await flushQueue();

      expect(createAgoraRtcEngine).toHaveBeenCalled();
      expect(mockEngine.initialize).toHaveBeenCalledWith({
        appId: "test-app-id",
        channelProfile: ChannelProfileType.ChannelProfileCommunication,
      });
    });

    it("should call enableAudio on join", async () => {
      await agoraMobileRtcClient.joinAndPublish(defaultParams);
      await flushQueue();
      expect(mockEngine.enableAudio).toHaveBeenCalled();
    });

    it("should call registerEventHandler on join", async () => {
      await agoraMobileRtcClient.joinAndPublish(defaultParams);
      await flushQueue();
      expect(mockEngine.registerEventHandler).toHaveBeenCalled();
    });

    it("should call joinChannel with correct params for VOICE call", async () => {
      await agoraMobileRtcClient.joinAndPublish(defaultParams);
      await flushQueue();

      expect(mockEngine.joinChannel).toHaveBeenCalledWith(
        "test-token",
        "test-channel",
        100,
        {
          clientRoleType: ClientRoleType.ClientRoleBroadcaster,
          publishMicrophoneTrack: true,
          publishCameraTrack: false,
          autoSubscribeAudio: true,
          autoSubscribeVideo: false,
          enableAudioRecordingOrPlayout: true,
        },
      );
    });

    it("should call enableVideo and startPreview for VIDEO call", async () => {
      const videoParams = { ...defaultParams, callType: CallTypeEnum.VIDEO };
      await agoraMobileRtcClient.joinAndPublish(videoParams);
      await flushQueue();

      expect(mockEngine.enableVideo).toHaveBeenCalled();
      expect(mockEngine.startPreview).toHaveBeenCalled();
      expect(mockEngine.joinChannel).toHaveBeenCalledWith(
        "test-token",
        "test-channel",
        100,
        expect.objectContaining({
          publishCameraTrack: true,
          autoSubscribeVideo: true,
        }),
      );
    });

    it("should fire onConnectionStateChange with 'connecting' on join", async () => {
      const onConnectionStateChange = jest.fn();
      agoraMobileRtcClient.configure({ onConnectionStateChange });

      await agoraMobileRtcClient.joinAndPublish(defaultParams);
      await flushQueue();

      expect(onConnectionStateChange).toHaveBeenCalledWith(
        "connecting",
        1,
      );
    });

    it("should fire onLocalMediaStateChange on join", async () => {
      const onLocalMediaStateChange = jest.fn();
      agoraMobileRtcClient.configure({ onLocalMediaStateChange });

      await agoraMobileRtcClient.joinAndPublish(defaultParams);
      await flushQueue();

      expect(onLocalMediaStateChange).toHaveBeenCalledWith({
        sessionId: 1,
        localAudioEnabled: true,
        localVideoEnabled: false,
      });
    });
  });

  describe("toggleLocalAudio", () => {
    it("should call muteLocalAudioStream with correct value", async () => {
      await agoraMobileRtcClient.joinAndPublish(defaultParams);
      await flushQueue();
      await agoraMobileRtcClient.toggleLocalAudio();
      await flushQueue();

      expect(mockEngine.muteLocalAudioStream).toHaveBeenCalledWith(true);
    });

    it("should fire onLocalMediaStateChange with updated audio state", async () => {
      const onLocalMediaStateChange = jest.fn();
      agoraMobileRtcClient.configure({ onLocalMediaStateChange });

      await agoraMobileRtcClient.joinAndPublish(defaultParams);
      await flushQueue();
      mockEngine.muteLocalAudioStream.mockClear();
      await agoraMobileRtcClient.toggleLocalAudio();
      await flushQueue();

      expect(onLocalMediaStateChange).toHaveBeenCalledWith({
        sessionId: 1,
        localAudioEnabled: false,
      });
    });
  });

  describe("toggleLocalVideo", () => {
    it("should call muteLocalVideoStream and stopPreview", async () => {
      const videoParams = { ...defaultParams, callType: CallTypeEnum.VIDEO };
      await agoraMobileRtcClient.joinAndPublish(videoParams);
      await flushQueue();
      mockEngine.stopPreview.mockClear();
      mockEngine.muteLocalVideoStream.mockClear();

      await agoraMobileRtcClient.toggleLocalVideo();
      await flushQueue();

      expect(mockEngine.muteLocalVideoStream).toHaveBeenCalledWith(true);
      expect(mockEngine.stopPreview).toHaveBeenCalled();
    });

    it("should call startPreview and enableVideo when re-enabling", async () => {
      const videoParams = { ...defaultParams, callType: CallTypeEnum.VIDEO };
      await agoraMobileRtcClient.joinAndPublish(videoParams);
      await flushQueue();
      await agoraMobileRtcClient.toggleLocalVideo();
      await flushQueue();

      mockEngine.startPreview.mockClear();
      mockEngine.enableVideo.mockClear();
      mockEngine.muteLocalVideoStream.mockClear();

      await agoraMobileRtcClient.toggleLocalVideo();
      await flushQueue();

      expect(mockEngine.muteLocalVideoStream).toHaveBeenCalledWith(false);
      expect(mockEngine.enableVideo).toHaveBeenCalled();
      expect(mockEngine.startPreview).toHaveBeenCalled();
    });

    it("should fire onLocalMediaStateChange with updated video state", async () => {
      const onLocalMediaStateChange = jest.fn();
      agoraMobileRtcClient.configure({ onLocalMediaStateChange });

      const videoParams = { ...defaultParams, callType: CallTypeEnum.VIDEO };
      await agoraMobileRtcClient.joinAndPublish(videoParams);
      await flushQueue();
      mockEngine.muteLocalVideoStream.mockClear();
      await agoraMobileRtcClient.toggleLocalVideo();
      await flushQueue();

      expect(onLocalMediaStateChange).toHaveBeenCalledWith({
        sessionId: 1,
        localVideoEnabled: false,
      });
    });
  });

  describe("toggleSpeakerphone", () => {
    it("should call setEnableSpeakerphone with toggled value", async () => {
      await agoraMobileRtcClient.joinAndPublish(defaultParams);
      await flushQueue();

      const result = await agoraMobileRtcClient.toggleSpeakerphone();

      expect(mockEngine.setEnableSpeakerphone).toHaveBeenCalledWith(false);
      expect(result).toBe(false);
    });

    it("should return true when toggling back on", async () => {
      await agoraMobileRtcClient.joinAndPublish(defaultParams);
      await flushQueue();
      await agoraMobileRtcClient.toggleSpeakerphone();

      const result = await agoraMobileRtcClient.toggleSpeakerphone();

      expect(mockEngine.setEnableSpeakerphone).toHaveBeenCalledWith(true);
      expect(result).toBe(true);
    });
  });

  describe("switchCamera", () => {
    it("should call switchCamera on engine for VIDEO call", async () => {
      const videoParams = { ...defaultParams, callType: CallTypeEnum.VIDEO };
      await agoraMobileRtcClient.joinAndPublish(videoParams);
      await flushQueue();

      await agoraMobileRtcClient.switchCamera();

      expect(mockEngine.switchCamera).toHaveBeenCalled();
    });
  });

  describe("cleanup", () => {
    it("should call leaveChannel, unregisterEventHandler, and release", async () => {
      await agoraMobileRtcClient.joinAndPublish(defaultParams);
      await flushQueue();

      await agoraMobileRtcClient.cleanup();
      await flushQueue();

      expect(mockEngine.leaveChannel).toHaveBeenCalled();
      expect(mockEngine.unregisterEventHandler).toHaveBeenCalledWith(
        eventHandler,
      );
      expect(mockEngine.release).toHaveBeenCalled();
    });

    it("should clear sessionId after cleanup", async () => {
      await agoraMobileRtcClient.joinAndPublish(defaultParams);
      await flushQueue();
      expect(agoraMobileRtcClient.getJoinedSessionId()).toBe(1);

      await agoraMobileRtcClient.cleanup();
      await flushQueue();

      expect(agoraMobileRtcClient.getJoinedSessionId()).toBeNull();
    });
  });

  describe("onTokenPrivilegeWillExpire", () => {
    it("should call renewToken when onTokenWillExpire callback returns a token", async () => {
      const onTokenWillExpire = jest.fn().mockResolvedValue("new-token");
      agoraMobileRtcClient.configure({ onTokenWillExpire });

      await agoraMobileRtcClient.joinAndPublish(defaultParams);
      await flushQueue();

      expect(eventHandler).not.toBeNull();
      await eventHandler!["onTokenPrivilegeWillExpire"]?.();

      expect(onTokenWillExpire).toHaveBeenCalledWith({ sessionId: 1 });
      expect(mockEngine.renewToken).toHaveBeenCalledWith("new-token");
    });

    it("should not call renewToken when onTokenWillExpire returns null", async () => {
      const onTokenWillExpire = jest.fn().mockResolvedValue(null);
      agoraMobileRtcClient.configure({ onTokenWillExpire });

      await agoraMobileRtcClient.joinAndPublish(defaultParams);
      await flushQueue();

      await eventHandler!["onTokenPrivilegeWillExpire"]?.();

      expect(mockEngine.renewToken).not.toHaveBeenCalled();
    });
  });

  describe("operation queue", () => {
    it("should serialize operations", async () => {
      const order: string[] = [];

      await agoraMobileRtcClient.joinAndPublish(defaultParams);
      await flushQueue();

      const p1 = agoraMobileRtcClient.toggleLocalAudio().then(() => {
        order.push("toggleAudio");
      });
      const p2 = agoraMobileRtcClient.toggleLocalAudio().then(() => {
        order.push("toggleAudio2");
      });

      await Promise.all([p1, p2]);
      await flushQueue();

      expect(order).toEqual(["toggleAudio", "toggleAudio2"]);
    });
  });

  describe("getSpeakerEnabled", () => {
    it("should return true initially", () => {
      expect(agoraMobileRtcClient.getSpeakerEnabled()).toBe(true);
    });

    it("should return false after toggling off", async () => {
      await agoraMobileRtcClient.joinAndPublish(defaultParams);
      await flushQueue();
      await agoraMobileRtcClient.toggleSpeakerphone();

      expect(agoraMobileRtcClient.getSpeakerEnabled()).toBe(false);
    });
  });
});
