import type {
  ConnectionState,
  IAgoraRTCClient,
  IAgoraRTCRemoteUser,
  ICameraVideoTrack,
  IMicrophoneAudioTrack,
  UID,
} from 'agora-rtc-sdk-ng';
import { CallTypeEnum } from '@/types/enum';
import type { CallDevicePreferencesState } from '@/lib/features/callDevicePreferencesSlice';

export type RtcConnectionState = 'idle' | 'connecting' | 'connected' | 'reconnecting' | 'disconnected' | 'failed';

export type JoinRtcCallConfig = {
  sessionId: number;
  callType: CallTypeEnum;
  appId: string;
  channelName: string;
  token?: string | null;
  uid?: UID | null;
};

export type RtcClientState = {
  sessionId: number | null;
  joined: boolean;
  localAudioEnabled: boolean;
  localVideoEnabled: boolean;
  remoteAudioActive: boolean;
  remoteVideoActive: boolean;
  connectionState: RtcConnectionState;
};

export type RtcRemoteParticipantState = {
  uid: UID;
  audioActive: boolean;
  videoActive: boolean;
};

export type AgoraInternalState = {
  client: IAgoraRTCClient | null;
  localAudioTrack: IMicrophoneAudioTrack | null;
  localVideoTrack: ICameraVideoTrack | null;
  remoteUsers: Map<string, IAgoraRTCRemoteUser>;
  sessionId: number | null;
  channelName: string | null;
  uid: UID | null;
  localVideoContainer: HTMLElement | null;
  remoteVideoContainers: Map<string, HTMLElement>;
  preferredDevices: CallDevicePreferencesState;
};

export type RtcCallbacks = {
  onConnectionStateChange?: (state: RtcConnectionState, sessionId: number) => void;
  onRemoteMediaStateChange?: (payload: {
    sessionId: number;
    remoteAudioActive?: boolean;
    remoteVideoActive?: boolean;
  }) => void;
  onRemoteParticipantsStateChange?: (payload: {
    sessionId: number;
    participants: RtcRemoteParticipantState[];
  }) => void;
  onLocalMediaStateChange?: (payload: {
    sessionId: number;
    localAudioEnabled?: boolean;
    localVideoEnabled?: boolean;
  }) => void;
  onWarning?: (message: string, sessionId: number) => void;
  onError?: (message: string, sessionId: number) => void;
  onTokenWillExpire?: (params: { sessionId: number; channelName: string; uid: UID | null }) => Promise<string | null>;
};

export const mapConnectionState = (state: ConnectionState): RtcConnectionState => {
  if (state === 'CONNECTED') return 'connected';
  if (state === 'CONNECTING') return 'connecting';
  if (state === 'RECONNECTING') return 'reconnecting';
  if (state === 'DISCONNECTED') return 'disconnected';
  return 'failed';
};
