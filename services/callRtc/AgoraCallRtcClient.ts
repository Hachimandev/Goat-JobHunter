'use client';

import AgoraRTC, {
  ICameraVideoTrack,
  IRemoteAudioTrack,
} from 'agora-rtc-sdk-ng';
import { CallTypeEnum } from '@/types/enum';
import type { CallDevicePreferencesState } from '@/lib/features/callDevicePreferencesSlice';
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
    preferredDevices: {
      microphoneId: null,
      speakerId: null,
      cameraId: null,
    },
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

  setPreferredDevices = (preferences: CallDevicePreferencesState) => {
    this.state.preferredDevices = {
      microphoneId: preferences.microphoneId ?? null,
      speakerId: preferences.speakerId ?? null,
      cameraId: preferences.cameraId ?? null,
    };
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
      const preferredDevices = { ...this.state.preferredDevices };
      await this.cleanupInternal();
      this.state.preferredDevices = preferredDevices;

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

        await this.cleanupLocalTracks();
        this.state.uid = await client.join(appId, channelName, token, uid);

        const audioTrack = await this.createLocalAudioTrack();
        this.state.localAudioTrack = audioTrack;
        await client.publish([audioTrack]);

        if (callType === CallTypeEnum.VIDEO) {
          await this.tryEnableVideoForCurrentSession(sessionId, true);
        }

        this.emitLocalState();
        this.emitRemoteState();
      } catch (error) {
        this.connectionState = 'failed';
        this.emitConnectionState('failed');
        this.callbacks.onError?.('Không thể kết nối media cuộc gọi.', sessionId);
        await this.cleanupLocalTracks();
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

  switchMicrophone = async (deviceId: string | null) => {
    this.state.preferredDevices.microphoneId = deviceId;

    if (!this.state.client || !this.state.sessionId) {
      return;
    }

    if (!this.state.localAudioTrack) {
      return;
    }

    if (deviceId) {
      await this.state.localAudioTrack.setDevice(deviceId);
      return;
    }

    await this.replaceLocalAudioTrack();
  };

  switchCamera = async (deviceId: string | null) => {
    this.state.preferredDevices.cameraId = deviceId;

    if (!this.state.client || !this.state.sessionId || !this.state.localVideoTrack) {
      return;
    }

    if (deviceId) {
      await this.state.localVideoTrack.setDevice(deviceId);
      if (this.state.localVideoTrack.enabled && this.state.localVideoContainer) {
        this.state.localVideoTrack.play(this.state.localVideoContainer);
      }
      return;
    }

    await this.replaceLocalVideoTrack();
  };

  switchSpeaker = async (deviceId: string | null) => {
    this.state.preferredDevices.speakerId = deviceId;

    const remoteAudioTracks = [...this.state.remoteUsers.values()]
      .map((remoteUser) => remoteUser.audioTrack)
      .filter((track): track is IRemoteAudioTrack => Boolean(track));

    await Promise.all(remoteAudioTracks.map((track) => this.applySpeakerPreferenceToTrack(track)));
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
    const { client, preferredDevices } = this.state;

    await this.cleanupLocalTracks();

    if (client) {
      client.removeAllListeners();
      try {
        await client.leave();
      } catch (error) {
        console.warn('Unable to leave Agora client cleanly during cleanup:', error);
      }
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
      preferredDevices,
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

  private createLocalAudioTrack = async () => {
    return await AgoraRTC.createMicrophoneAudioTrack({
      encoderConfig: 'speech_standard',
      AEC: true,
      ANS: true,
      AGC: true,
      ...(this.state.preferredDevices.microphoneId ? { microphoneId: this.state.preferredDevices.microphoneId } : {}),
    });
  };

  private cleanupLocalTracks = async () => {
    const { localAudioTrack, localVideoTrack } = this.state;

    if (localVideoTrack) {
      try {
        localVideoTrack.stop();
      } catch (error) {
        console.warn('Unable to stop local video track during cleanup:', error);
      }

      try {
        localVideoTrack.close();
      } catch (error) {
        console.warn('Unable to close local video track during cleanup:', error);
      }

      this.state.localVideoTrack = null;
    }

    if (localAudioTrack) {
      try {
        localAudioTrack.stop();
      } catch (error) {
        console.warn('Unable to stop local audio track during cleanup:', error);
      }

      try {
        localAudioTrack.close();
      } catch (error) {
        console.warn('Unable to close local audio track during cleanup:', error);
      }

      this.state.localAudioTrack = null;
    }
  };

  private createLocalVideoTrack = async () => {
    return await AgoraRTC.createCameraVideoTrack({
      encoderConfig: '720p_1',
      ...(this.state.preferredDevices.cameraId ? { cameraId: this.state.preferredDevices.cameraId } : {}),
    });
  };

  private replaceLocalAudioTrack = async () => {
    if (!this.state.client) {
      return;
    }

    const previousTrack = this.state.localAudioTrack;
    const previousEnabled = previousTrack?.enabled ?? true;
    const nextTrack = await this.createLocalAudioTrack();

    try {
      if (previousTrack) {
        await this.state.client.unpublish([previousTrack]);
      }

      await this.state.client.publish([nextTrack]);

      if (!previousEnabled) {
        await nextTrack.setEnabled(false);
      }

      previousTrack?.stop();
      previousTrack?.close();
      this.state.localAudioTrack = nextTrack;
      this.emitLocalState();
    } catch (error) {
      nextTrack.stop();
      nextTrack.close();
      throw error;
    }
  };

  private replaceLocalVideoTrack = async () => {
    if (!this.state.client || !this.state.localVideoTrack) {
      return;
    }

    const previousTrack = this.state.localVideoTrack;
    const previousEnabled = previousTrack.enabled;
    const nextTrack = await this.createLocalVideoTrack();

    try {
      await this.state.client.unpublish([previousTrack]);
      await this.state.client.publish([nextTrack]);

      if (!previousEnabled) {
        await nextTrack.setEnabled(false);
      }

      if (previousEnabled && this.state.localVideoContainer) {
        nextTrack.play(this.state.localVideoContainer);
      }

      if (!previousEnabled && this.state.localVideoContainer) {
        this.state.localVideoContainer.innerHTML = '';
      }

      previousTrack.stop();
      previousTrack.close();
      this.state.localVideoTrack = nextTrack;
      this.emitLocalState();
    } catch (error) {
      nextTrack.stop();
      nextTrack.close();
      throw error;
    }
  };

  private tryEnableVideoForCurrentSession = async (sessionId: number, joiningCall: boolean) => {
    if (!this.state.client) {
      return false;
    }

    let videoTrack: ICameraVideoTrack | null = null;

    try {
      videoTrack = await this.createLocalVideoTrack();

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

  private applySpeakerPreferenceToTrack = async (track: IRemoteAudioTrack) => {
    if (!this.state.preferredDevices.speakerId) {
      return;
    }

    try {
      await track.setPlaybackDevice(this.state.preferredDevices.speakerId);
    } catch (error) {
      if (this.isSpeakerSelectionUnsupportedError(error)) {
        console.warn('Speaker selection is not supported in this browser:', error);
        return;
      }

      throw error;
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

  private isSpeakerSelectionUnsupportedError = (error: unknown) => {
    const candidate = error as { code?: string; name?: string; message?: string } | null;
    const raw = [candidate?.code, candidate?.name, candidate?.message].filter(Boolean).join(' ').toUpperCase();
    return raw.includes('NOT_SUPPORTED') || raw.includes('SETSINKID');
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
          await this.applySpeakerPreferenceToTrack(user.audioTrack);
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
