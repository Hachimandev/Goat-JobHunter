import { useAppSelector } from '@/lib/hooks';
import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '@/lib/store';
import { CallSession } from '@/types/model';
import { CallStatusEnum, CallTypeEnum } from '@/types/enum';

type IncomingCallState = {
  sessionId: number;
  chatRoomId: number;
  actorAccountId: number;
  callType?: CallTypeEnum;
  startedAt?: string;
  session?: CallSession;
};

type CallState = {
  currentCall: CallSession | null;
  incomingCall: IncomingCallState | null;
  callError: string | null;
  lastRealtimeEvent: CallRealtimeEvent | null;
  lastRealtimeEventAt: string | null;
  rtcConnectionState: 'idle' | 'connecting' | 'connected' | 'reconnecting' | 'disconnected' | 'failed';
  localAudioEnabled: boolean;
  localVideoEnabled: boolean;
  remoteAudioActive: boolean;
  remoteVideoActive: boolean;
};

export type CallRealtimeEvent = {
  eventType: 'CALL_STARTED' | 'CALL_JOINED' | 'CALL_LEFT' | 'CALL_ENDED';
  chatRoomId: number;
  sessionId: number;
  actorAccountId: number;
  status: CallStatusEnum;
  callType?: CallTypeEnum;
  occurredAt: string;
};

const initialState: CallState = {
  currentCall: null,
  incomingCall: null,
  callError: null,
  lastRealtimeEvent: null,
  lastRealtimeEventAt: null,
  rtcConnectionState: 'idle',
  localAudioEnabled: true,
  localVideoEnabled: true,
  remoteAudioActive: false,
  remoteVideoActive: false,
};

const resolveEventTimestamp = (value?: string | null): string => {
  if (typeof value === 'string' && value.trim().length > 0) {
    return value;
  }

  return new Date().toISOString();
};

const isMatchingCall = (stateCall: CallSession | null, sessionId: number): boolean => {
  return Boolean(stateCall && stateCall.sessionId === sessionId);
};

const resetRtcFlags = (state: CallState) => {
  state.rtcConnectionState = 'idle';
  state.localAudioEnabled = true;
  state.localVideoEnabled = true;
  state.remoteAudioActive = false;
  state.remoteVideoActive = false;
};

const callSlice = createSlice({
  name: 'call',
  initialState,
  reducers: {
    markCallRealtimeEvent: (state, action: PayloadAction<string | undefined>) => {
      state.lastRealtimeEventAt = resolveEventTimestamp(action.payload);
    },
    registerCallRealtimeEvent: (
      state,
      action: PayloadAction<Omit<CallRealtimeEvent, 'occurredAt'> & { occurredAt?: string }>,
    ) => {
      const occurredAt = resolveEventTimestamp(action.payload.occurredAt);
      state.lastRealtimeEvent = {
        ...action.payload,
        occurredAt,
      };
      state.lastRealtimeEventAt = occurredAt;
    },
    setOutgoingCallPending: (state, action: PayloadAction<CallSession>) => {
      state.currentCall = {
        ...action.payload,
        status: CallStatusEnum.PENDING,
      };
      state.incomingCall = null;
      state.callError = null;
    },
    setIncomingCall: (state, action: PayloadAction<IncomingCallState>) => {
      state.incomingCall = action.payload;
      state.callError = null;
    },
    dismissIncomingCall: (state) => {
      state.incomingCall = null;
    },
    setCurrentCall: (state, action: PayloadAction<CallSession>) => {
      state.currentCall = action.payload;
      state.callError = null;

      if (state.incomingCall?.sessionId === action.payload.sessionId) {
        state.incomingCall = null;
      }

      state.localVideoEnabled = action.payload.callType === CallTypeEnum.VIDEO;
    },
    setCallStatus: (state, action: PayloadAction<{ sessionId: number; status: CallStatusEnum }>) => {
      if (!isMatchingCall(state.currentCall, action.payload.sessionId) || !state.currentCall) {
        return;
      }

      state.currentCall.status = action.payload.status;
    },
    setCallParticipants: (
      state,
      action: PayloadAction<{ sessionId: number; participants: CallSession['participants'] }>,
    ) => {
      if (!isMatchingCall(state.currentCall, action.payload.sessionId) || !state.currentCall) {
        return;
      }

      state.currentCall.participants = action.payload.participants;
    },
    endCurrentCall: (
      state,
      action: PayloadAction<{ sessionId?: number; endedAt?: string; finalStatus?: CallStatusEnum } | undefined>,
    ) => {
      const targetSessionId = action.payload?.sessionId;

      if (targetSessionId) {
        const isCurrentCallTarget = isMatchingCall(state.currentCall, targetSessionId);
        const isIncomingCallTarget = state.incomingCall?.sessionId === targetSessionId;

        if (!isCurrentCallTarget && !isIncomingCallTarget) {
          return;
        }
      }

      if (state.currentCall) {
        state.currentCall.status = action.payload?.finalStatus ?? CallStatusEnum.ENDED;
        state.currentCall.endedAt = action.payload?.endedAt ?? new Date().toISOString();
      }

      state.currentCall = null;
      state.incomingCall = null;
      resetRtcFlags(state);
    },
    setRtcConnectionState: (
      state,
      action: PayloadAction<{
        sessionId?: number;
        state: CallState['rtcConnectionState'];
      }>,
    ) => {
      if (action.payload.sessionId && !isMatchingCall(state.currentCall, action.payload.sessionId)) {
        return;
      }

      state.rtcConnectionState = action.payload.state;
    },
    setLocalAudioEnabled: (state, action: PayloadAction<{ sessionId?: number; enabled: boolean }>) => {
      if (action.payload.sessionId && !isMatchingCall(state.currentCall, action.payload.sessionId)) {
        return;
      }

      state.localAudioEnabled = action.payload.enabled;
    },
    setLocalVideoEnabled: (state, action: PayloadAction<{ sessionId?: number; enabled: boolean }>) => {
      if (action.payload.sessionId && !isMatchingCall(state.currentCall, action.payload.sessionId)) {
        return;
      }

      state.localVideoEnabled = action.payload.enabled;
    },
    setRemoteMediaState: (
      state,
      action: PayloadAction<{
        sessionId?: number;
        remoteAudioActive?: boolean;
        remoteVideoActive?: boolean;
      }>,
    ) => {
      if (action.payload.sessionId && !isMatchingCall(state.currentCall, action.payload.sessionId)) {
        return;
      }

      if (typeof action.payload.remoteAudioActive === 'boolean') {
        state.remoteAudioActive = action.payload.remoteAudioActive;
      }

      if (typeof action.payload.remoteVideoActive === 'boolean') {
        state.remoteVideoActive = action.payload.remoteVideoActive;
      }
    },
    setCallError: (state, action: PayloadAction<string | null>) => {
      state.callError = action.payload;
    },
    clearCallState: () => initialState,
  },
});

export const {
  markCallRealtimeEvent,
  registerCallRealtimeEvent,
  setOutgoingCallPending,
  setIncomingCall,
  dismissIncomingCall,
  setCurrentCall,
  setCallStatus,
  setCallParticipants,
  endCurrentCall,
  setRtcConnectionState,
  setLocalAudioEnabled,
  setLocalVideoEnabled,
  setRemoteMediaState,
  setCallError,
  clearCallState,
} = callSlice.actions;

const selectCallState = (state: RootState) => state.call;

export const selectCurrentCall = createSelector(selectCallState, (state) => state.currentCall);
export const selectIncomingCall = createSelector(selectCallState, (state) => state.incomingCall);
export const selectCallError = createSelector(selectCallState, (state) => state.callError);
export const selectLastCallRealtimeEvent = createSelector(selectCallState, (state) => state.lastRealtimeEvent);
export const selectLastCallRealtimeEventAt = createSelector(selectCallState, (state) => state.lastRealtimeEventAt);
export const selectRtcConnectionState = createSelector(selectCallState, (state) => state.rtcConnectionState);
export const selectLocalAudioEnabled = createSelector(selectCallState, (state) => state.localAudioEnabled);
export const selectLocalVideoEnabled = createSelector(selectCallState, (state) => state.localVideoEnabled);
export const selectRemoteAudioActive = createSelector(selectCallState, (state) => state.remoteAudioActive);
export const selectRemoteVideoActive = createSelector(selectCallState, (state) => state.remoteVideoActive);
export const selectIsCallActive = createSelector(
  selectCurrentCall,
  (currentCall) => currentCall?.status === CallStatusEnum.ACTIVE || currentCall?.status === CallStatusEnum.PENDING,
);

export const useCallSlice = () => useAppSelector(selectCallState);

export default callSlice.reducer;
