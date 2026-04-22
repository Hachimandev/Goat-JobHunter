'use client';

import AgoraRTC, { ICameraVideoTrack } from 'agora-rtc-sdk-ng';
import { CallTypeEnum } from '@/types/enum';
import {
  AgoraInternalState,
  JoinRtcCallConfig,
  mapConnectionState,
  RtcCallbacks,
  RtcClientState,
  RtcRemoteParticipantState,
} from '@/services/callRtc/callRtcType';

const CAMERA_IN_USE_WARNING = 'Không thể bật camera vì camera đang được thiết bị hoặc ứng dụng khác sử dụng.';
const CAMERA_JOIN_WARNING = 'Camera đang được thiết bị hoặc ứng dụng khác sử dụng. Cuộc gọi tiếp tục với âm thanh.';
const CAMERA_GENERIC_WARNING = 'Không thể bật camera lúc này. Cuộc gọi vẫn tiếp tục với âm thanh.';

class AgoraCallRtcClient {
  private state: AgoraInternalState = {
    client: null,
    localAudioTrack: null,
    localVideoTrack: null,
    remoteUsers: new Map(),
    sessionId: null,
    channelName: null,
    uid: null,
    localVideoContainer: null,
    remoteVideoContainers: new Map(),
  };

  private callbacks: RtcCallbacks = {};

  private connectionState: RtcClientState['connectionState'] = 'idle';

  private operationQueue: Promise<void> = Promise.resolve();

  getSnapshot = (): RtcClientState => {
    return {
      sessionId: this.state.sessionId,
      joined: Boolean(this.state.client && this.state.sessionId),
      localAudioEnabled: this.state.localAudioTrack?.enabled ?? true,
      localVideoEnabled: this.state.localVideoTrack?.enabled ?? false,
      remoteAudioActive: this.resolveRemoteParticipantsState().some((participant) => participant.audioActive),
      remoteVideoActive: this.resolveRemoteParticipantsState().some((participant) => participant.videoActive),
      connectionState: this.connectionState,
    };
  };

  configure = (callbacks: RtcCallbacks) => {
    this.callbacks = callbacks;
  };

  bindContainers = (params: {
    localVideoContainer?: HTMLElement | null;
    remoteVideoContainer?: HTMLElement | null;
  }) => {
    this.bindLocalVideoContainer(params.localVideoContainer ?? null);

    if (params.remoteVideoContainer === null || params.remoteVideoContainer === undefined) {
      this.state.remoteVideoContainers.clear();
      return;
    }

    const [firstRemoteUser] = this.state.remoteUsers.values();
    if (!firstRemoteUser?.uid) {
      return;
    }

    this.bindRemoteVideoContainer(firstRemoteUser.uid, params.remoteVideoContainer);
  };

  bindLocalVideoContainer = (container: HTMLElement | null) => {
    this.state.localVideoContainer = container;

    if (!container) {
      return;
    }

    if (this.state.localVideoTrack?.enabled) {
      this.state.localVideoTrack.play(container);
    }
  };

  bindRemoteVideoContainer = (uid: string | number, container: HTMLElement | null) => {
    const remoteKey = `${uid}`;

    if (!container) {
      this.state.remoteVideoContainers.delete(remoteKey);
      return;
    }

    this.state.remoteVideoContainers.set(remoteKey, container);
    const remoteUser = this.state.remoteUsers.get(remoteKey);
    if (remoteUser?.videoTrack) {
      remoteUser.videoTrack.play(container);
    }
  };

  joinAndPublish = async ({ sessionId, callType, appId, channelName, token = null, uid = null }: JoinRtcCallConfig) => {
    return this.enqueueOperation(async () => {
      await this.cleanupInternal();

      this.state.sessionId = sessionId;
      this.state.channelName = channelName;
      this.connectionState = 'connecting';
      this.emitConnectionState('connecting');

      const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
      this.state.client = client;
      this.registerClientEvents();

      try {
        if (!uid) {
          throw new Error('UID is required to join the RTC channel.');
        }

        const tokenLength = typeof token === 'string' ? token.length : 0;
        console.log('UID in client side what is used in join function: ', uid);
        console.log('Token length in client side what is used in join function: ', tokenLength);
        console.log('joinAndPublish info: ', { appId, channelName, uid, tokenLength });

        this.state.uid = await client.join(appId, channelName, token, uid);
        const audioTrack = await AgoraRTC.createMicrophoneAudioTrack({ encoderConfig: 'speech_standard' });
        this.state.localAudioTrack = audioTrack;
        await client.publish([audioTrack]);

        if (callType === CallTypeEnum.VIDEO) {
          await this.tryEnableVideoForCurrentSession(sessionId, true);
        }

        this.emitRemoteState();
      } catch (error) {
        this.connectionState = 'failed';
        this.emitConnectionState('failed');
        this.callbacks.onError?.('Không thể kết nối media cuộc gọi.', sessionId);
        await this.cleanupInternal();

        console.log('error in joinAndPublish in AgoraCallRtcClient :', error);

        throw error;
      }
    });
  };

  toggleLocalAudio = async (enabled?: boolean) => {
    if (!this.state.localAudioTrack || !this.state.sessionId) return;
    const nextEnabled = typeof enabled === 'boolean' ? enabled : !this.state.localAudioTrack.enabled;
    await this.state.localAudioTrack.setEnabled(nextEnabled);
    this.callbacks.onLocalMediaStateChange?.({
      sessionId: this.state.sessionId,
      localAudioEnabled: nextEnabled,
    });
  };

  toggleLocalVideo = async (enabled?: boolean) => {
    if (!this.state.sessionId) return;

    if (!this.state.localVideoTrack) {
      const nextEnabled = typeof enabled === 'boolean' ? enabled : true;
      if (!nextEnabled) {
        this.emitLocalState();
        return;
      }

      await this.tryEnableVideoForCurrentSession(this.state.sessionId, false);
      return;
    }

    const nextEnabled = typeof enabled === 'boolean' ? enabled : !this.state.localVideoTrack.enabled;

    try {
      await this.state.localVideoTrack.setEnabled(nextEnabled);

      if (!nextEnabled && this.state.localVideoContainer) {
        this.state.localVideoContainer.innerHTML = '';
      }

      if (nextEnabled && this.state.localVideoContainer) {
        this.state.localVideoTrack.play(this.state.localVideoContainer);
      }

      this.emitLocalState();
    } catch (error) {
      if (nextEnabled && this.isCameraInUseError(error)) {
        console.warn('Camera busy while enabling local video track:', error);
        this.callbacks.onWarning?.(CAMERA_IN_USE_WARNING, this.state.sessionId);
        this.emitLocalState();
        return;
      }

      if (nextEnabled) {
        console.warn('Unable to enable local video track, continue audio only:', error);
        this.callbacks.onWarning?.(CAMERA_GENERIC_WARNING, this.state.sessionId);
        this.emitLocalState();
        return;
      }

      throw error;
    }
  };

  renewToken = async (token: string | null) => {
    if (!this.state.client || !token) return;
    await this.state.client.renewToken(token);
  };

  cleanup = async () => {
    return this.enqueueOperation(async () => {
      await this.cleanupInternal();
    });
  };

  private cleanupInternal = async () => {
    const { client, localAudioTrack, localVideoTrack } = this.state;

    if (localAudioTrack) {
      localAudioTrack.stop();
      localAudioTrack.close();
    }

    if (localVideoTrack) {
      localVideoTrack.stop();
      localVideoTrack.close();
    }

    if (client) {
      client.removeAllListeners();
      await client.leave();
    }

      this.state = {
        client: null,
        localAudioTrack: null,
        localVideoTrack: null,
        remoteUsers: new Map(),
        sessionId: null,
        channelName: null,
        uid: null,
        localVideoContainer: null,
        remoteVideoContainers: new Map(),
      };
    this.connectionState = 'idle';
  };

  private enqueueOperation = async <T>(operation: () => Promise<T>): Promise<T> => {
    const previousOperation = this.operationQueue;
    let releaseCurrentOperation: (() => void) | null = null;

    this.operationQueue = new Promise<void>((resolve) => {
      releaseCurrentOperation = resolve;
    });

    await previousOperation;

    try {
      return await operation();
    } finally {
      (releaseCurrentOperation as unknown as () => void)?.();
    }
  };

  private tryEnableVideoForCurrentSession = async (sessionId: number, joiningCall: boolean) => {
    if (!this.state.client) {
      return false;
    }

    let videoTrack: ICameraVideoTrack | null = null;

    try {
      videoTrack = await AgoraRTC.createCameraVideoTrack({
        encoderConfig: '720p_1',
      });

      await this.state.client.publish([videoTrack]);
      this.state.localVideoTrack = videoTrack;

      if (this.state.localVideoContainer) {
        videoTrack.play(this.state.localVideoContainer);
      }

      this.emitLocalState();
      return true;
    } catch (error) {
      if (videoTrack) {
        videoTrack.stop();
        videoTrack.close();
      }

      this.state.localVideoTrack = null;

      if (this.isCameraInUseError(error)) {
        console.warn('Camera busy, continue without video:', error);
        this.callbacks.onWarning?.(joiningCall ? CAMERA_JOIN_WARNING : CAMERA_IN_USE_WARNING, sessionId);
        this.emitLocalState();
        return false;
      }

      console.warn('Unable to enable local video, continue audio only:', error);
      this.callbacks.onWarning?.(CAMERA_GENERIC_WARNING, sessionId);
      this.emitLocalState();
      return false;
    }
  };

  private isCameraInUseError = (error: unknown) => {
    const candidate = error as { code?: string; name?: string; message?: string } | null;
    const raw = [candidate?.code, candidate?.name, candidate?.message].filter(Boolean).join(' ').toUpperCase();

    return (
      raw.includes('NOT_READABLE') ||
      raw.includes('NOTREADABLEERROR') ||
      raw.includes('DEVICE IN USE') ||
      raw.includes('SOURCE UNAVAILABLE')
    );
  };

  private registerClientEvents = () => {
    if (!this.state.client || !this.state.sessionId) return;

    const sessionId = this.state.sessionId;
    const client = this.state.client;

    client.on('connection-state-change', (currentState) => {
      const mapped = mapConnectionState(currentState);
      this.connectionState = mapped;
      this.emitConnectionState(mapped);
    });

    client.on('user-published', async (user, mediaType) => {
      try {
        await client.subscribe(user, mediaType);
        this.state.remoteUsers.set(`${user.uid}`, user);

        if (mediaType === 'audio' && user.audioTrack) {
          user.audioTrack.play();
        }

        if (mediaType === 'video' && user.videoTrack) {
          const container = this.state.remoteVideoContainers.get(`${user.uid}`);
          if (container) {
            user.videoTrack.play(container);
          }
        }

        this.emitRemoteState();
      } catch (error) {
        console.error('Error occurred while subscribing to user media:', error);
        this.callbacks.onError?.('Không thể subscribe media từ người tham gia khác.', sessionId);
      }
    });

    client.on('user-unpublished', (user, mediaType) => {
      const remoteKey = `${user.uid}`;

      if (mediaType === 'video') {
        const container = this.state.remoteVideoContainers.get(remoteKey);
        if (container) {
          container.innerHTML = '';
        }
      }

      this.emitRemoteState();
    });

    client.on('user-left', (user) => {
      const remoteKey = `${user.uid}`;
      const container = this.state.remoteVideoContainers.get(remoteKey);
      if (container) {
        container.innerHTML = '';
      }
      this.state.remoteUsers.delete(remoteKey);
      this.state.remoteVideoContainers.delete(remoteKey);
      this.emitRemoteState();
    });

    client.on('token-privilege-will-expire', async () => {
      if (!this.state.channelName || !this.callbacks.onTokenWillExpire) return;

      try {
        const refreshedToken = await this.callbacks.onTokenWillExpire({
          sessionId,
          channelName: this.state.channelName,
          uid: this.state.uid,
        });
        await this.renewToken(refreshedToken);
      } catch {
        this.callbacks.onError?.('Không thể gia hạn token cuộc gọi.', sessionId);
      }
    });

    client.on('token-privilege-did-expire', () => {
      this.callbacks.onError?.('Token cuộc gọi đã hết hạn.', sessionId);
      this.connectionState = 'failed';
      this.emitConnectionState('failed');
    });
  };

  private emitConnectionState = (state: RtcClientState['connectionState']) => {
    if (!this.state.sessionId) return;
    this.callbacks.onConnectionStateChange?.(state, this.state.sessionId);
  };

  private emitRemoteState = () => {
    if (!this.state.sessionId) return;
    const participants = this.resolveRemoteParticipantsState();

    this.callbacks.onRemoteMediaStateChange?.({
      sessionId: this.state.sessionId,
      remoteAudioActive: participants.some((participant) => participant.audioActive),
      remoteVideoActive: participants.some((participant) => participant.videoActive),
    });
    this.callbacks.onRemoteParticipantsStateChange?.({
      sessionId: this.state.sessionId,
      participants,
    });
  };

  private emitLocalState = () => {
    if (!this.state.sessionId) return;
    this.callbacks.onLocalMediaStateChange?.({
      sessionId: this.state.sessionId,
      localAudioEnabled: this.state.localAudioTrack?.enabled ?? true,
      localVideoEnabled: this.state.localVideoTrack?.enabled ?? false,
    });
  };

  private resolveRemoteParticipantsState = (): RtcRemoteParticipantState[] => {
    return [...this.state.remoteUsers.values()].map((remoteUser) => ({
      uid: remoteUser.uid,
      audioActive: Boolean(remoteUser.audioTrack),
      videoActive: Boolean(remoteUser.videoTrack),
    }));
  };
}

export const callRtcClient = new AgoraCallRtcClient();
