import { useAppSelector } from '@/lib/hooks';
import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '@/lib/store';
import { CallSession } from '@/types/model';
import { CallStatusEnum } from '@/types/enum';

type IncomingCallState = {
  callId: string;
  chatRoomId: number;
  fromAccountId: number;
  startedAt?: string;
  session?: CallSession;
};

type CallState = {
  currentCall: CallSession | null;
  incomingCall: IncomingCallState | null;
  callError: string | null;
  lastRealtimeEventAt: string | null;
};

const initialState: CallState = {
  currentCall: null,
  incomingCall: null,
  callError: null,
  lastRealtimeEventAt: null,
};

const resolveEventTimestamp = (value?: string | null): string => {
  if (typeof value === 'string' && value.trim().length > 0) {
    return value;
  }

  return new Date().toISOString();
};

const isMatchingCall = (stateCall: CallSession | null, callId: string): boolean => {
  return Boolean(stateCall && stateCall.callId === callId);
};

const callSlice = createSlice({
  name: 'call',
  initialState,
  reducers: {
    markCallRealtimeEvent: (state, action: PayloadAction<string | undefined>) => {
      state.lastRealtimeEventAt = resolveEventTimestamp(action.payload);
    },
    setOutgoingCallRinging: (state, action: PayloadAction<CallSession>) => {
      state.currentCall = {
        ...action.payload,
        status: CallStatusEnum.RINGING,
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

      if (state.incomingCall?.callId === action.payload.callId) {
        state.incomingCall = null;
      }
    },
    setCallStatus: (state, action: PayloadAction<{ callId: string; status: CallStatusEnum }>) => {
      if (!isMatchingCall(state.currentCall, action.payload.callId) || !state.currentCall) {
        return;
      }

      state.currentCall.status = action.payload.status;
    },
    setCallParticipants: (
      state,
      action: PayloadAction<{ callId: string; participants: CallSession['participants'] }>,
    ) => {
      if (!isMatchingCall(state.currentCall, action.payload.callId) || !state.currentCall) {
        return;
      }

      state.currentCall.participants = action.payload.participants;
    },
    endCurrentCall: (
      state,
      action: PayloadAction<{ callId?: string; endedAt?: string; finalStatus?: CallStatusEnum } | undefined>,
    ) => {
      const targetCallId = action.payload?.callId;

      if (targetCallId && !isMatchingCall(state.currentCall, targetCallId)) {
        return;
      }

      if (state.currentCall) {
        state.currentCall.status = action.payload?.finalStatus ?? CallStatusEnum.ENDED;
        state.currentCall.endedAt = action.payload?.endedAt ?? new Date().toISOString();
      }

      state.currentCall = null;
      state.incomingCall = null;
    },
    setCallError: (state, action: PayloadAction<string | null>) => {
      state.callError = action.payload;
    },
    clearCallState: () => initialState,
  },
});

export const {
  markCallRealtimeEvent,
  setOutgoingCallRinging,
  setIncomingCall,
  dismissIncomingCall,
  setCurrentCall,
  setCallStatus,
  setCallParticipants,
  endCurrentCall,
  setCallError,
  clearCallState,
} = callSlice.actions;

const selectCallState = (state: RootState) => state.call;

export const selectCurrentCall = createSelector(selectCallState, (state) => state.currentCall);
export const selectIncomingCall = createSelector(selectCallState, (state) => state.incomingCall);
export const selectCallError = createSelector(selectCallState, (state) => state.callError);
export const selectLastCallRealtimeEventAt = createSelector(selectCallState, (state) => state.lastRealtimeEventAt);
export const selectIsCallActive = createSelector(
  selectCurrentCall,
  (currentCall) => currentCall?.status === CallStatusEnum.ACTIVE || currentCall?.status === CallStatusEnum.CONNECTING,
);

export const useCallSlice = () => useAppSelector(selectCallState);

export default callSlice.reducer;
