// Goat-JobHunter-Mobile-FE/hooks/useCallRoomActions.ts
import { useCallback, useEffect, useRef, useState } from "react";
import { Alert, Platform, PermissionsAndroid } from "react-native";
import { router } from "expo-router";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { store } from "@/lib/store";
import {
  dismissIncomingCall,
  endCurrentCall,
  selectCallError,
  selectCurrentCall,
  selectIncomingCall,
  selectLocalAudioEnabled,
  selectLocalVideoEnabled,
  selectParticipantMediaStates,
  selectRemoteAudioActive,
  selectRemoteVideoActive,
  selectRtcConnectionState,
  setCallError,
  setCurrentCall,
  setLocalAudioEnabled,
  setLocalVideoEnabled,
  setOutgoingCallPending,
  setParticipantMediaStates,
  setRemoteMediaState,
  setRtcConnectionState,
} from "@/lib/features/callSlice";
import {
  selectSpeakerEnabled,
  setSpeakerEnabled as setSpeakerPref,
} from "@/lib/features/callDevicePreferencesSlice";
import { useUser } from "@/hooks/useUser";
import { CallEndReasonEnum, CallStatusEnum, CallTypeEnum } from "@/types/enum";
import type { CallSession } from "@/types/model";
import {
  useDeclineCallMutation,
  useEndCallMutation,
  useIssueCallTokenMutation,
  useJoinCallMutation,
  useLeaveCallMutation,
  useStartCallMutation,
} from "@/services/chatRoom/call/callApi";
import { agoraMobileRtcClient } from "@/services/callRtc/AgoraMobileRtcClient";
import { computeAgoraUid } from "@/services/callRtc/agoraUid";
import { WebSocketCallService } from "@/services/socket/WebSocketCallService";

const ensureCallPermissions = async (callType: CallTypeEnum): Promise<boolean> => {
  if (Platform.OS !== "android") return true;
  const permissions = [PermissionsAndroid.PERMISSIONS.RECORD_AUDIO];
  if (callType === CallTypeEnum.VIDEO) {
    permissions.push(PermissionsAndroid.PERMISSIONS.CAMERA);
  }
  const result = await PermissionsAndroid.requestMultiple(permissions);
  return permissions.every(
    (p) => result[p] === PermissionsAndroid.RESULTS.GRANTED,
  );
};

export function useCallRoomActions() {
  const dispatch = useAppDispatch();
  const { user } = useUser();
  const currentCall = useAppSelector(selectCurrentCall);
  const incomingCall = useAppSelector(selectIncomingCall);
  const callError = useAppSelector(selectCallError);
  const rtcConnectionState = useAppSelector(selectRtcConnectionState);
  const localAudioEnabled = useAppSelector(selectLocalAudioEnabled);
  const localVideoEnabled = useAppSelector(selectLocalVideoEnabled);
  const remoteAudioActive = useAppSelector(selectRemoteAudioActive);
  const remoteVideoActive = useAppSelector(selectRemoteVideoActive);
  const participantMediaStates = useAppSelector(selectParticipantMediaStates);
  const speakerEnabled = useAppSelector(selectSpeakerEnabled);

  const [startCall] = useStartCallMutation();
  const [joinCall] = useJoinCallMutation();
  const [leaveCall] = useLeaveCallMutation();
  const [declineCall] = useDeclineCallMutation();
  const [endCall] = useEndCallMutation();
  const [issueCallToken] = useIssueCallTokenMutation();

  const [watchedChatRoomId, setWatchedChatRoomId] = useState<number | null>(null);

  const currentCallRef = useRef<CallSession | null>(currentCall);
  const tokenHydratingSessionIdRef = useRef<number | null>(null);
  const webSocketCallServiceRef = useRef<WebSocketCallService | null>(null);

  useEffect(() => {
    currentCallRef.current = currentCall;
  }, [currentCall]);

  // Configure RTC callbacks
  useEffect(() => {
    agoraMobileRtcClient.configure({
      onConnectionStateChange: (state, sessionId) => {
        dispatch(setRtcConnectionState({ sessionId, state }));
      },
      onRemoteParticipantsStateChange: ({ sessionId, participants }) => {
        const activeCall = currentCallRef.current;
        if (!activeCall || activeCall.sessionId !== sessionId) return;

        const channelName = activeCall.rtc?.channelName ?? activeCall.agoraChannelName;
        const nextParticipantMediaStates: Record<number, { audioActive: boolean; videoActive: boolean }> = {};

        for (const participant of activeCall.participants) {
          if (participant.leftAt || participant.account.accountId === user?.accountId) continue;
          const uid = computeAgoraUid(participant.account.accountId, activeCall.sessionId, channelName);
          if (uid === null) continue;
          const remote = participants.find((p) => p.uid === uid);
          if (remote) {
            nextParticipantMediaStates[participant.account.accountId] = {
              audioActive: remote.audioActive,
              videoActive: remote.videoActive,
            };
          }
        }

        dispatch(
          setParticipantMediaStates({
            sessionId,
            participantMediaStates: nextParticipantMediaStates,
          }),
        );

        const activeRemoteStates = Object.values(nextParticipantMediaStates);
        dispatch(
          setRemoteMediaState({
            sessionId,
            remoteAudioActive: activeRemoteStates.some((s) => s.audioActive),
            remoteVideoActive: activeRemoteStates.some((s) => s.videoActive),
          }),
        );
      },
      onLocalMediaStateChange: ({ sessionId, localAudioEnabled: audio, localVideoEnabled: video }) => {
        if (typeof audio === "boolean") {
          dispatch(setLocalAudioEnabled({ sessionId, enabled: audio }));
        }
        if (typeof video === "boolean") {
          dispatch(setLocalVideoEnabled({ sessionId, enabled: video }));
        }
      },
      onTokenWillExpire: async ({ sessionId }) => {
        const activeCall = currentCallRef.current;
        if (!activeCall || activeCall.sessionId !== sessionId) return null;
        try {
          const tokenResponse = await issueCallToken({
            chatRoomId: activeCall.chatRoomId,
            sessionId: activeCall.sessionId,
            publisher: true,
          }).unwrap();
          return tokenResponse.data?.token ?? null;
        } catch {
          return null;
        }
      },
      onError: (message, sessionId) => {
        dispatch(setCallError(message));
        dispatch(setRtcConnectionState({ sessionId, state: "failed" }));
      },
    });
    return () => {
      agoraMobileRtcClient.configure({});
    };
  }, [dispatch, issueCallToken, user?.accountId]);

  // WebSocket lifecycle
  useEffect(() => {
    if (webSocketCallServiceRef.current) {
      webSocketCallServiceRef.current.disconnect();
      webSocketCallServiceRef.current = null;
    }
    if (!watchedChatRoomId) return;

    const nextService = new WebSocketCallService(
      store.dispatch as typeof store.dispatch,
      watchedChatRoomId,
    );
    webSocketCallServiceRef.current = nextService;
    nextService.connect();
    return () => {
      nextService.disconnect();
    };
  }, [watchedChatRoomId]);

  // Auto RTC connection when currentCall changes
  useEffect(() => {
    if (!currentCall) {
      if (agoraMobileRtcClient.getJoinedSessionId() !== null) {
        void agoraMobileRtcClient.cleanup();
      }
      return;
    }

    const isCurrentUserParticipant =
      typeof user?.accountId === "number" &&
      currentCall.participants.some(
        (p) => p.account.accountId === user!.accountId && !p.leftAt,
      );

    const shouldConnectRtc =
      (currentCall.status === CallStatusEnum.PENDING ||
        currentCall.status === CallStatusEnum.ACTIVE) &&
      isCurrentUserParticipant;

    if (!shouldConnectRtc) return;
    if (agoraMobileRtcClient.getJoinedSessionId() === currentCall.sessionId) return;

    const joinParams =
      currentCall.rtc?.appId &&
      currentCall.rtc.channelName &&
      currentCall.rtc.token &&
      typeof currentCall.rtc.uid === "number"
        ? {
            sessionId: currentCall.sessionId,
            callType: currentCall.callType ?? CallTypeEnum.VOICE,
            appId: currentCall.rtc.appId,
            channelName: currentCall.rtc.channelName,
            token: currentCall.rtc.token,
            uid: currentCall.rtc.uid,
          }
        : null;

    if (!joinParams) {
      if (tokenHydratingSessionIdRef.current === currentCall.sessionId) return;
      tokenHydratingSessionIdRef.current = currentCall.sessionId;
      void (async () => {
        try {
          const tokenResponse = await issueCallToken({
            chatRoomId: currentCall.chatRoomId,
            sessionId: currentCall.sessionId,
            publisher: true,
          }).unwrap();
          if (tokenResponse.data) {
            dispatch(setCurrentCall({ ...currentCall, rtc: tokenResponse.data }));
          }
        } catch {
          dispatch(setCallError("Không thể cấp token cuộc gọi."));
          dispatch(setRtcConnectionState({ sessionId: currentCall.sessionId, state: "failed" }));
        } finally {
          tokenHydratingSessionIdRef.current = null;
        }
      })();
      return;
    }

    void agoraMobileRtcClient.joinAndPublish(joinParams);
    dispatch(setSpeakerPref(agoraMobileRtcClient.getSpeakerEnabled()));
  }, [currentCall, dispatch, issueCallToken, user?.accountId]);

  const hydrateCallWithToken = useCallback(
    async (targetCall: CallSession, callType: CallTypeEnum): Promise<CallSession> => {
      const tokenResponse = await issueCallToken({
        chatRoomId: targetCall.chatRoomId,
        sessionId: targetCall.sessionId,
        publisher: true,
      }).unwrap();
      return { ...targetCall, callType, rtc: tokenResponse.data };
    },
    [issueCallToken],
  );

  const handleStartCall = useCallback(
    async (chatRoomId: number, callType: CallTypeEnum): Promise<CallSession | null> => {
      const hasPermissions = await ensureCallPermissions(callType);
      if (!hasPermissions) {
        Alert.alert("Thiếu quyền", "Cần cấp quyền micro/camera để bắt đầu cuộc gọi.");
        return null;
      }
      try {
        const response = await startCall({ chatRoomId, publisher: true, callType }).unwrap();
        if (response.data) {
          const hydratedCall = await hydrateCallWithToken(response.data, callType);
          dispatch(setOutgoingCallPending(hydratedCall));
          dispatch(setCurrentCall(hydratedCall));
          router.push("/(call)/active-call");
        }
        return response.data ?? null;
      } catch (error: any) {
        const msg = error?.data?.message || "Không thể bắt đầu cuộc gọi lúc này.";
        dispatch(setCallError(msg));
        Alert.alert("Lỗi", msg);
        return null;
      }
    },
    [dispatch, hydrateCallWithToken, startCall],
  );

  const handleJoinCallSession = useCallback(
    async (
      chatRoomId: number,
      sessionId: number,
      callType: CallTypeEnum = CallTypeEnum.VOICE,
    ): Promise<CallSession | null> => {
      const hasPermissions = await ensureCallPermissions(callType);
      if (!hasPermissions) {
        Alert.alert("Thiếu quyền", "Cần cấp quyền micro/camera để tham gia cuộc gọi.");
        return null;
      }
      try {
        const response = await joinCall({ chatRoomId, sessionId, publisher: true, callType }).unwrap();
        if (response.data) {
          const hydratedCall = await hydrateCallWithToken(response.data, callType);
          dispatch(setCurrentCall(hydratedCall));
          dispatch(dismissIncomingCall());
          router.push("/(call)/active-call");
        }
        return response.data ?? null;
      } catch (error: any) {
        const msg = error?.data?.message || "Không thể tham gia cuộc gọi lúc này.";
        dispatch(setCallError(msg));
        Alert.alert("Lỗi", msg);
        return null;
      }
    },
    [dispatch, hydrateCallWithToken, joinCall],
  );

  const handleAcceptIncomingCall = useCallback(async (): Promise<CallSession | null> => {
    if (!incomingCall) return null;
    return handleJoinCallSession(
      incomingCall.chatRoomId,
      incomingCall.sessionId,
      incomingCall.callType ?? CallTypeEnum.VOICE,
    );
  }, [handleJoinCallSession, incomingCall]);

  const handleDeclineIncomingCall = useCallback(async () => {
    if (!incomingCall) return;
    try {
      await declineCall({
        chatRoomId: incomingCall.chatRoomId,
        sessionId: incomingCall.sessionId,
      }).unwrap();
    } catch (error) {
      console.error("Decline call error:", error);
    } finally {
      dispatch(dismissIncomingCall());
    }
  }, [declineCall, dispatch, incomingCall]);

  const handleEndCall = useCallback(async () => {
    if (!currentCall) return;
    try {
      const response = await endCall({
        chatRoomId: currentCall.chatRoomId,
        sessionId: currentCall.sessionId,
        reason: CallEndReasonEnum.HANGUP,
      }).unwrap();
      await agoraMobileRtcClient.cleanup();
      dispatch(
        endCurrentCall({
          sessionId: currentCall.sessionId,
          endedAt: response.data?.endedAt ?? undefined,
          finalStatus: response.data?.status ?? CallStatusEnum.ENDED,
        }),
      );
      if (router.canGoBack()) router.back();
      else router.replace("/(tabs)/chat");
    } catch (error: any) {
      const msg = error?.data?.message || "Không thể kết thúc cuộc gọi lúc này.";
      dispatch(setCallError(msg));
      Alert.alert("Lỗi", msg);
    }
  }, [currentCall, dispatch, endCall]);

  const handleLeaveCall = useCallback(async () => {
    if (!currentCall) return;
    try {
      const response = await leaveCall({
        chatRoomId: currentCall.chatRoomId,
        sessionId: currentCall.sessionId,
      }).unwrap();
      await agoraMobileRtcClient.cleanup();
      dispatch(
        endCurrentCall({
          sessionId: currentCall.sessionId,
          endedAt: response.data?.endedAt ?? undefined,
          finalStatus: response.data?.status ?? undefined,
        }),
      );
      if (router.canGoBack()) router.back();
      else router.replace("/(tabs)/chat");
    } catch (error: any) {
      const msg = error?.data?.message || "Không thể rời cuộc gọi.";
      dispatch(setCallError(msg));
      Alert.alert("Lỗi", msg);
    }
  }, [currentCall, dispatch, leaveCall]);

  const handleToggleLocalAudio = useCallback(async () => {
    await agoraMobileRtcClient.toggleLocalAudio();
  }, []);

  const handleToggleLocalVideo = useCallback(async () => {
    await agoraMobileRtcClient.toggleLocalVideo();
  }, []);

  const handleToggleSpeaker = useCallback(async () => {
    const nextSpeakerState = await agoraMobileRtcClient.toggleSpeakerphone();
    dispatch(setSpeakerPref(nextSpeakerState));
  }, [dispatch]);

  const handleSwitchCamera = useCallback(async () => {
    await agoraMobileRtcClient.switchCamera();
  }, []);

  return {
    currentCall,
    incomingCall,
    callError,
    rtcConnectionState,
    localAudioEnabled,
    localVideoEnabled,
    remoteAudioActive,
    remoteVideoActive,
    participantMediaStates,
    speakerEnabled,
    isRtcReady: rtcConnectionState === "connected" || rtcConnectionState === "reconnecting",
    watchChatRoom: setWatchedChatRoomId,
    handleStartCall,
    handleJoinCallSession,
    handleAcceptIncomingCall,
    handleDeclineIncomingCall,
    handleEndCall,
    handleLeaveCall,
    handleToggleLocalAudio,
    handleToggleLocalVideo,
    handleToggleSpeaker,
    handleSwitchCamera,
  };
}
