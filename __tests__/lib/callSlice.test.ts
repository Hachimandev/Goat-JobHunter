import callReducer, {
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
  setParticipantMediaStates,
  setCallError,
  clearCallState,
  selectCurrentCall,
  selectIncomingCall,
  selectCallError,
  selectLastCallRealtimeEvent,
  selectLastCallRealtimeEventAt,
  selectRtcConnectionState,
  selectLocalAudioEnabled,
  selectLocalVideoEnabled,
  selectRemoteAudioActive,
  selectRemoteVideoActive,
  selectParticipantMediaStates,
  selectIsCallActive,
} from "@/lib/features/callSlice";
import { CallStatusEnum, CallTypeEnum } from "@/types/enum";
import type { CallSession, CallParticipant } from "@/types/model";
import type { CallState } from "@/lib/features/callSlice";

type TestRootState = {
  call: CallState;
};

describe("callSlice", () => {
  const initialState: CallState = {
    currentCall: null,
    incomingCall: null,
    callError: null,
    lastRealtimeEvent: null,
    lastRealtimeEventAt: null,
    rtcConnectionState: "idle",
    localAudioEnabled: true,
    localVideoEnabled: true,
    remoteAudioActive: false,
    remoteVideoActive: false,
    participantMediaStates: {},
  };

  const mockCallSession: CallSession = {
    sessionId: 1,
    chatRoomId: 100,
    status: CallStatusEnum.PENDING,
    agoraChannelName: "test-channel",
    initiatorAccountId: 10,
    startedAt: "2024-01-01T00:00:00.000Z",
    participants: [],
    callType: CallTypeEnum.VOICE,
  };

  describe("initial state", () => {
    it("should have correct default values", () => {
      const state = callReducer(undefined, { type: "unknown" });
      expect(state.currentCall).toBeNull();
      expect(state.incomingCall).toBeNull();
      expect(state.callError).toBeNull();
      expect(state.lastRealtimeEvent).toBeNull();
      expect(state.lastRealtimeEventAt).toBeNull();
      expect(state.rtcConnectionState).toBe("idle");
      expect(state.localAudioEnabled).toBe(true);
      expect(state.localVideoEnabled).toBe(true);
      expect(state.remoteAudioActive).toBe(false);
      expect(state.remoteVideoActive).toBe(false);
      expect(state.participantMediaStates).toEqual({});
    });
  });

  describe("setOutgoingCallPending", () => {
    it("should set currentCall with PENDING status", () => {
      const state = callReducer(undefined, { type: "unknown" });
      const newState = callReducer(state, setOutgoingCallPending(mockCallSession));
      expect(newState.currentCall).toEqual({
        ...mockCallSession,
        status: CallStatusEnum.PENDING,
      });
      expect(newState.incomingCall).toBeNull();
      expect(newState.callError).toBeNull();
    });
  });

  describe("setCurrentCall", () => {
    it("should clear matching incoming call", () => {
      let state = callReducer(undefined, { type: "unknown" });
      state = callReducer(state, setIncomingCall({
        sessionId: 1,
        chatRoomId: 100,
        actorAccountId: 20,
      }));
      expect(state.incomingCall).not.toBeNull();

      const activeCall: CallSession = {
        ...mockCallSession,
        status: CallStatusEnum.ACTIVE,
      };
      const newState = callReducer(state, setCurrentCall(activeCall));
      expect(newState.currentCall).toEqual(activeCall);
      expect(newState.incomingCall).toBeNull();
    });
  });

  describe("endCurrentCall", () => {
    it("should reset RTC flags and null currentCall", () => {
      let state = callReducer(undefined, { type: "unknown" });
      state = callReducer(state, setOutgoingCallPending(mockCallSession));
      state = callReducer(state, setRtcConnectionState({ state: "connected" }));
      state = callReducer(state, setLocalAudioEnabled({ enabled: false }));
      state = callReducer(state, setLocalVideoEnabled({ enabled: false }));
      state = callReducer(state, setRemoteMediaState({ remoteAudioActive: true, remoteVideoActive: true }));

      expect(state.currentCall).not.toBeNull();
      expect(state.rtcConnectionState).toBe("connected");

      const newState = callReducer(state, endCurrentCall());
      expect(newState.currentCall).toBeNull();
      expect(newState.incomingCall).toBeNull();
      expect(newState.rtcConnectionState).toBe("idle");
      expect(newState.localAudioEnabled).toBe(true);
      expect(newState.localVideoEnabled).toBe(true);
      expect(newState.remoteAudioActive).toBe(false);
      expect(newState.remoteVideoActive).toBe(false);
      expect(newState.participantMediaStates).toEqual({});
    });
  });

  describe("setRtcConnectionState session mismatch guard", () => {
    it("should ignore state change when sessionId does not match current call", () => {
      let state = callReducer(undefined, { type: "unknown" });
      state = callReducer(state, setOutgoingCallPending(mockCallSession));
      state = callReducer(state, setRtcConnectionState({ sessionId: 999, state: "connected" }));

      expect(state.rtcConnectionState).toBe("idle");
    });

    it("should apply state change when sessionId matches current call", () => {
      let state = callReducer(undefined, { type: "unknown" });
      state = callReducer(state, setOutgoingCallPending(mockCallSession));
      state = callReducer(state, setRtcConnectionState({ sessionId: 1, state: "connected" }));

      expect(state.rtcConnectionState).toBe("connected");
    });
  });

  describe("setLocalAudioEnabled session mismatch guard", () => {
    it("should ignore change when sessionId does not match current call", () => {
      let state = callReducer(undefined, { type: "unknown" });
      state = callReducer(state, setOutgoingCallPending(mockCallSession));
      state = callReducer(state, setLocalAudioEnabled({ sessionId: 999, enabled: false }));

      expect(state.localAudioEnabled).toBe(true);
    });

    it("should apply change when sessionId matches current call", () => {
      let state = callReducer(undefined, { type: "unknown" });
      state = callReducer(state, setOutgoingCallPending(mockCallSession));
      state = callReducer(state, setLocalAudioEnabled({ sessionId: 1, enabled: false }));

      expect(state.localAudioEnabled).toBe(false);
    });
  });

  describe("dismissIncomingCall", () => {
    it("should clear incoming call", () => {
      let state = callReducer(undefined, { type: "unknown" });
      state = callReducer(state, setIncomingCall({
        sessionId: 1,
        chatRoomId: 100,
        actorAccountId: 20,
      }));
      expect(state.incomingCall).not.toBeNull();

      const newState = callReducer(state, dismissIncomingCall());
      expect(newState.incomingCall).toBeNull();
    });
  });

  describe("clearCallState", () => {
    it("should reset to initial state", () => {
      let state = callReducer(undefined, { type: "unknown" });
      state = callReducer(state, setOutgoingCallPending(mockCallSession));
      state = callReducer(state, setRtcConnectionState({ state: "failed" }));
      state = callReducer(state, setCallError("Test error"));

      const newState = callReducer(state, clearCallState());
      expect(newState.currentCall).toBeNull();
      expect(newState.rtcConnectionState).toBe("idle");
      expect(newState.callError).toBeNull();
      expect(newState.localAudioEnabled).toBe(true);
      expect(newState.localVideoEnabled).toBe(true);
    });
  });

  describe("setCallStatus", () => {
    it("updates status when sessionId matches", () => {
      const state = callReducer(initialState, setCurrentCall({
        ...mockCallSession,
        status: CallStatusEnum.ACTIVE,
      }));
      const nextState = callReducer(state, setCallStatus({
        sessionId: mockCallSession.sessionId,
        status: CallStatusEnum.ENDED,
      }));
      expect(nextState.currentCall?.status).toBe(CallStatusEnum.ENDED);
    });

    it("ignores status change when sessionId does not match", () => {
      const state = callReducer(initialState, setCurrentCall({
        ...mockCallSession,
        status: CallStatusEnum.ACTIVE,
      }));
      const nextState = callReducer(state, setCallStatus({
        sessionId: 999,
        status: CallStatusEnum.ENDED,
      }));
      expect(nextState.currentCall?.status).toBe(CallStatusEnum.ACTIVE);
    });
  });

  describe("setCallParticipants", () => {
    it("updates participants when sessionId matches", () => {
      const newParticipants: CallParticipant[] = [{
        account: { accountId: 200, username: 'user2', fullName: 'User Two', email: 'u2@test.com' },
        publisher: false,
        joinedAt: '2026-01-01T00:00:00Z',
      }];
      const state = callReducer(initialState, setCurrentCall({
        ...mockCallSession,
        participants: [],
      }));
      const nextState = callReducer(state, setCallParticipants({
        sessionId: mockCallSession.sessionId,
        participants: newParticipants,
      }));
      expect(nextState.currentCall?.participants).toEqual(newParticipants);
    });

    it("ignores participants change when sessionId does not match", () => {
      const state = callReducer(initialState, setCurrentCall({
        ...mockCallSession,
        participants: [],
      }));
      const nextState = callReducer(state, setCallParticipants({
        sessionId: 999,
        participants: [{
          account: { accountId: 200, username: 'user2', fullName: 'User Two', email: 'u2@test.com' },
          publisher: false,
          joinedAt: '2026-01-01T00:00:00Z',
        }],
      }));
      expect(nextState.currentCall?.participants).toEqual([]);
    });
  });

  describe("registerCallRealtimeEvent", () => {
    it("stores event with timestamp", () => {
      const state = callReducer(initialState, registerCallRealtimeEvent({
        eventType: 'CALL_STARTED',
        chatRoomId: 1,
        sessionId: 100,
        actorAccountId: 50,
        status: CallStatusEnum.ACTIVE,
      }));
      expect(state.lastRealtimeEvent?.eventType).toBe('CALL_STARTED');
      expect(state.lastRealtimeEventAt).toBeDefined();
    });
  });

  describe("setCallError", () => {
    it("sets error message", () => {
      const state = callReducer(initialState, setCallError('Test error'));
      expect(state.callError).toBe('Test error');
    });

    it("clears error message", () => {
      const state = callReducer(initialState, setCallError('Test error'));
      const nextState = callReducer(state, setCallError(null));
      expect(nextState.callError).toBeNull();
    });
  });

  describe("endCurrentCall with sessionId mismatch", () => {
    it("ignores end call when sessionId does not match currentCall", () => {
      const state = callReducer(initialState, setCurrentCall({
        ...mockCallSession,
        status: CallStatusEnum.ACTIVE,
      }));
      const nextState = callReducer(state, endCurrentCall({
        sessionId: 999,
        finalStatus: CallStatusEnum.ENDED,
      }));
      expect(nextState.currentCall).not.toBeNull();
      expect(nextState.currentCall?.status).toBe(CallStatusEnum.ACTIVE);
    });

    it("ignores end call when sessionId does not match incomingCall", () => {
      const state = callReducer(initialState, setIncomingCall({
        sessionId: 100,
        chatRoomId: 1,
        actorAccountId: 50,
      }));
      const nextState = callReducer(state, endCurrentCall({
        sessionId: 999,
      }));
      expect(nextState.incomingCall).not.toBeNull();
    });
  });

  describe("selectors", () => {
    const createMockRootState = (callState: ReturnType<typeof callReducer>) => ({
      call: callState,
    } as any);

    describe("selectIsCallActive", () => {
      it("should return true for PENDING status", () => {
        let state = callReducer(undefined, { type: "unknown" });
        state = callReducer(state, setOutgoingCallPending(mockCallSession));
        const rootState = createMockRootState(state);
        expect(selectIsCallActive(rootState)).toBe(true);
      });

      it("should return true for ACTIVE status", () => {
        let state = callReducer(undefined, { type: "unknown" });
        const activeCall: CallSession = { ...mockCallSession, status: CallStatusEnum.ACTIVE };
        state = callReducer(state, setCurrentCall(activeCall));
        const rootState = createMockRootState(state);
        expect(selectIsCallActive(rootState)).toBe(true);
      });

      it("should return false for ENDED status", () => {
        let state = callReducer(undefined, { type: "unknown" });
        const endedCall: CallSession = { ...mockCallSession, status: CallStatusEnum.ENDED };
        state = callReducer(state, setCurrentCall(endedCall));
        const rootState = createMockRootState(state);
        expect(selectIsCallActive(rootState)).toBe(false);
      });

      it("should return false when no call exists", () => {
        const state = callReducer(undefined, { type: "unknown" });
        const rootState = createMockRootState(state);
        expect(selectIsCallActive(rootState)).toBe(false);
      });
    });
  });
});
