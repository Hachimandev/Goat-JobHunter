// Goat-JobHunter-Mobile-FE/services/callRtc/AgoraMobileRtcClient.ts
import {
  ChannelProfileType,
  ClientRoleType,
  ConnectionStateType,
  createAgoraRtcEngine,
  IRtcEngine,
  IRtcEngineEventHandler,
  RemoteVideoState,
} from "react-native-agora";
import { CallTypeEnum } from "@/types/enum";

type RtcConnectionState =
  | "idle"
  | "connecting"
  | "connected"
  | "reconnecting"
  | "disconnected"
  | "failed";

type RemoteParticipantState = {
  uid: number;
  audioActive: boolean;
  videoActive: boolean;
};

type JoinRtcParams = {
  sessionId: number;
  callType: CallTypeEnum;
  appId: string;
  channelName: string;
  token: string;
  uid: number;
};

type RtcCallbacks = {
  onConnectionStateChange?: (
    state: RtcConnectionState,
    sessionId: number,
  ) => void;
  onRemoteParticipantsStateChange?: (params: {
    sessionId: number;
    participants: RemoteParticipantState[];
  }) => void;
  onLocalMediaStateChange?: (params: {
    sessionId: number;
    localAudioEnabled?: boolean;
    localVideoEnabled?: boolean;
  }) => void;
  onTokenWillExpire?: (params: { sessionId: number }) => Promise<string | null>;
  onError?: (message: string, sessionId: number) => void;
};

class AgoraMobileRtcClient {
  private engine: IRtcEngine | null = null;
  private callbacks: RtcCallbacks = {};
  private sessionId: number | null = null;
  private currentCallType: CallTypeEnum = CallTypeEnum.VOICE;
  private localAudioEnabled = true;
  private localVideoEnabled = true;
  private speakerEnabled = true;
  private eventHandler: IRtcEngineEventHandler | null = null;
  private remoteParticipants = new Map<
    number,
    { audioActive: boolean; videoActive: boolean }
  >();
  private operationQueue: Promise<void> = Promise.resolve();

  configure(callbacks: RtcCallbacks) {
    this.callbacks = callbacks;
  }

  getJoinedSessionId(): number | null {
    return this.sessionId;
  }

  getSpeakerEnabled(): boolean {
    return this.speakerEnabled;
  }

  private mapConnectionState(
    state: ConnectionStateType,
  ): RtcConnectionState {
    switch (state) {
      case ConnectionStateType.ConnectionStateConnecting:
        return "connecting";
      case ConnectionStateType.ConnectionStateConnected:
        return "connected";
      case ConnectionStateType.ConnectionStateReconnecting:
        return "reconnecting";
      case ConnectionStateType.ConnectionStateFailed:
        return "failed";
      case ConnectionStateType.ConnectionStateDisconnected:
      default:
        return this.sessionId === null ? "idle" : "disconnected";
    }
  }

  private emitRemoteParticipants() {
    if (!this.sessionId) return;
    this.callbacks.onRemoteParticipantsStateChange?.({
      sessionId: this.sessionId,
      participants: Array.from(this.remoteParticipants.entries()).map(
        ([uid, state]) => ({ uid, audioActive: state.audioActive, videoActive: state.videoActive }),
      ),
    });
  }

  private createEventHandler(): IRtcEngineEventHandler {
    return {
      onJoinChannelSuccess: (connection) => {
        if (this.sessionId === null) return;
        this.callbacks.onConnectionStateChange?.("connected", this.sessionId);
        const localUid = typeof connection.localUid === "number" ? connection.localUid : 0;
        this.remoteParticipants.delete(localUid);
        this.emitRemoteParticipants();
      },
      onConnectionStateChanged: (_connection, state) => {
        if (this.sessionId === null) return;
        this.callbacks.onConnectionStateChange?.(
          this.mapConnectionState(state),
          this.sessionId,
        );
      },
      onUserJoined: (_connection, remoteUid) => {
        this.remoteParticipants.set(remoteUid, {
          audioActive: true,
          videoActive: false,
        });
        this.emitRemoteParticipants();
      },
      onRemoteVideoStateChanged: (_connection, remoteUid, state, _reason) => {
        const prev = this.remoteParticipants.get(remoteUid) ?? {
          audioActive: true,
          videoActive: false,
        };

        const videoActive =
          state === RemoteVideoState.RemoteVideoStateStarting ||
          state === RemoteVideoState.RemoteVideoStateDecoding;

        if (prev.videoActive !== videoActive) {
          this.remoteParticipants.set(remoteUid, { ...prev, videoActive });
          this.emitRemoteParticipants();
        }
      },
      onUserOffline: (_connection, remoteUid) => {
        this.remoteParticipants.delete(remoteUid);
        this.emitRemoteParticipants();
      },
      onUserMuteAudio: (_connection, remoteUid, muted) => {
        const prev = this.remoteParticipants.get(remoteUid) ?? {
          audioActive: true,
          videoActive: this.currentCallType === CallTypeEnum.VIDEO,
        };
        this.remoteParticipants.set(remoteUid, { ...prev, audioActive: !muted });
        this.emitRemoteParticipants();
      },
      onUserMuteVideo: (_connection, remoteUid, muted) => {
        const prev = this.remoteParticipants.get(remoteUid) ?? {
          audioActive: true,
          videoActive: this.currentCallType === CallTypeEnum.VIDEO,
        };
        this.remoteParticipants.set(remoteUid, { ...prev, videoActive: !muted });
        this.emitRemoteParticipants();
      },
      onTokenPrivilegeWillExpire: async () => {
        if (!this.engine || this.sessionId === null) return;
        const nextToken = await this.callbacks.onTokenWillExpire?.({
          sessionId: this.sessionId,
        });
        if (nextToken) {
          this.engine.renewToken(nextToken);
        }
      },
      onError: (errorCode, message) => {
        if (this.sessionId === null) return;
        const errorMessage = message || `Agora error ${String(errorCode)} xảy ra.`;
        this.callbacks.onError?.(errorMessage, this.sessionId);
      },
      onLeaveChannel: () => {
        if (this.sessionId === null) return;
        this.remoteParticipants.clear();
        this.emitRemoteParticipants();
        this.callbacks.onConnectionStateChange?.("disconnected", this.sessionId);
      },
    };
  }

  private enqueueOperation<T = void>(operation: () => Promise<T>): Promise<T> {
    const promise = this.operationQueue.then(operation).catch((err) => {
      console.error("[AgoraMobileRtcClient] Operation error:", err);
      return undefined as T;
    });
    this.operationQueue = promise.then(() => {});
    return promise;
  }

  async joinAndPublish(params: JoinRtcParams): Promise<void> {
    return this.enqueueOperation(async () => {
      if (this.sessionId === params.sessionId && this.engine) return;
      await this.cleanupInternal();

      this.engine = createAgoraRtcEngine();
      this.sessionId = params.sessionId;
      this.currentCallType = params.callType;
      this.localAudioEnabled = true;
      this.localVideoEnabled = params.callType === CallTypeEnum.VIDEO;
      this.speakerEnabled = true;
      this.remoteParticipants.clear();

      this.engine.initialize({
        appId: params.appId,
        channelProfile: ChannelProfileType.ChannelProfileCommunication,
      });
      this.engine.enableAudio();

      if (params.callType === CallTypeEnum.VIDEO) {
        this.engine.enableVideo();
        this.engine.startPreview();
      }

      this.engine.setEnableSpeakerphone(true);

      this.eventHandler = this.createEventHandler();
      this.engine.registerEventHandler(this.eventHandler);

      this.callbacks.onConnectionStateChange?.("connecting", params.sessionId);
      this.callbacks.onLocalMediaStateChange?.({
        sessionId: params.sessionId,
        localAudioEnabled: this.localAudioEnabled,
        localVideoEnabled: this.localVideoEnabled,
      });

      this.engine.joinChannel(params.token, params.channelName, params.uid, {
        clientRoleType: ClientRoleType.ClientRoleBroadcaster,
        publishMicrophoneTrack: true,
        publishCameraTrack: params.callType === CallTypeEnum.VIDEO,
        autoSubscribeAudio: true,
        autoSubscribeVideo: params.callType === CallTypeEnum.VIDEO,
        enableAudioRecordingOrPlayout: true,
      });
    });
  }

  async toggleLocalAudio(): Promise<void> {
    return this.enqueueOperation(async () => {
      if (!this.engine || this.sessionId === null) return;
      this.localAudioEnabled = !this.localAudioEnabled;
      this.engine.muteLocalAudioStream(!this.localAudioEnabled);
      this.callbacks.onLocalMediaStateChange?.({
        sessionId: this.sessionId,
        localAudioEnabled: this.localAudioEnabled,
      });
    });
  }

  async toggleLocalVideo(): Promise<void> {
    return this.enqueueOperation(async () => {
      if (!this.engine || this.sessionId === null || this.currentCallType !== CallTypeEnum.VIDEO) return;
      this.localVideoEnabled = !this.localVideoEnabled;
      this.engine.muteLocalVideoStream(!this.localVideoEnabled);
      if (this.localVideoEnabled) {
        this.engine.enableVideo();
        this.engine.startPreview();
      } else {
        this.engine.stopPreview();
      }
      this.callbacks.onLocalMediaStateChange?.({
        sessionId: this.sessionId,
        localVideoEnabled: this.localVideoEnabled,
      });
    });
  }

  async toggleSpeakerphone(): Promise<boolean> {
    return this.enqueueOperation(async () => {
      if (!this.engine) return this.speakerEnabled;
      this.speakerEnabled = !this.speakerEnabled;
      this.engine.setEnableSpeakerphone(this.speakerEnabled);
      return this.speakerEnabled;
    });
  }

  async switchCamera(): Promise<void> {
    return this.enqueueOperation(async () => {
      if (!this.engine || this.currentCallType !== CallTypeEnum.VIDEO) return;
      this.engine.switchCamera();
    });
  }

  async renewToken(token: string): Promise<void> {
    return this.enqueueOperation(async () => {
      if (!this.engine) return;
      this.engine.renewToken(token);
    });
  }

  async cleanup(): Promise<void> {
    return this.enqueueOperation(async () => {
      await this.cleanupInternal();
    });
  }

  private async cleanupInternal(): Promise<void> {
    const previousEngine = this.engine;
    if (previousEngine) {
      try { previousEngine.leaveChannel(); } catch {}
      try { previousEngine.stopPreview(); } catch {}
      if (this.eventHandler) {
        try { previousEngine.unregisterEventHandler(this.eventHandler); } catch {}
      }
      try { previousEngine.release(); } catch {}
    }
    this.engine = null;
    this.eventHandler = null;
    this.sessionId = null;
    this.remoteParticipants.clear();
  }
}

export const agoraMobileRtcClient = new AgoraMobileRtcClient();
