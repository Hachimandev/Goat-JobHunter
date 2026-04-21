import { useCallback, useEffect, useMemo, useRef } from 'react';
import { toast } from 'sonner';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import {
  dismissIncomingCall,
  endCurrentCall,
  selectCallError,
  selectCurrentCall,
  selectIncomingCall,
  selectLocalAudioEnabled,
  selectLocalVideoEnabled,
  selectRemoteAudioActive,
  selectRemoteVideoActive,
  selectRtcConnectionState,
  setCallError,
  setLocalAudioEnabled,
  setLocalVideoEnabled,
  setRemoteMediaState,
  setCurrentCall,
  setOutgoingCallPending,
  setRtcConnectionState,
} from '@/lib/features/callSlice';
import {
  useJoinCallMutation,
  useLeaveCallMutation,
  useEndCallMutation,
  useIssueCallTokenMutation,
  useStartCallMutation,
} from '@/services/chatRoom/call/callApi';
import { useUser } from '@/hooks/useUser';
import { CallEndReasonEnum, CallStatusEnum, CallTypeEnum } from '@/types/enum';
import { callRtcClient } from '@/services/callRtc/AgoraCallRtcClient';
import { CallSession } from '@/types/model';

const useCallRoomActions = () => {
  const { isSignedIn, user } = useUser();
  const dispatch = useAppDispatch();
  const currentCall = useAppSelector(selectCurrentCall);
  const incomingCall = useAppSelector(selectIncomingCall);
  const callError = useAppSelector(selectCallError);
  const rtcConnectionState = useAppSelector(selectRtcConnectionState);
  const localAudioEnabled = useAppSelector(selectLocalAudioEnabled);
  const localVideoEnabled = useAppSelector(selectLocalVideoEnabled);
  const remoteAudioActive = useAppSelector(selectRemoteAudioActive);
  const remoteVideoActive = useAppSelector(selectRemoteVideoActive);

  const [startCall, { isLoading: isInitiatingCall }] = useStartCallMutation();
  const [joinCall, { isLoading: isAcceptingCall }] = useJoinCallMutation();
  const [leaveCall, { isLoading: isLeavingCall }] = useLeaveCallMutation();
  const [endCall, { isLoading: isEndingCall }] = useEndCallMutation();
  const [issueCallToken] = useIssueCallTokenMutation();

  const currentCallRef = useRef(currentCall);
  const activeRtcSessionIdRef = useRef<number | null>(null);

  useEffect(() => {
    currentCallRef.current = currentCall;
  }, [currentCall]);

  const resolvePublisherFlag = useCallback((callType: CallTypeEnum) => {
    return callType === CallTypeEnum.VIDEO || callType === CallTypeEnum.VOICE;
  }, []);

  const hydrateCallWithToken = useCallback(
    async (targetCall: CallSession, callType: CallTypeEnum): Promise<CallSession> => {
      const tokenResponse = await issueCallToken({
        chatRoomId: targetCall.chatRoomId,
        sessionId: targetCall.sessionId,
        publisher: resolvePublisherFlag(callType),
      }).unwrap();

      return {
        ...targetCall,
        callType,
        rtc: tokenResponse.data,
      };
    },
    [issueCallToken, resolvePublisherFlag],
  );

  useEffect(() => {
    callRtcClient.configure({
      onConnectionStateChange: (state, sessionId) => {
        dispatch(
          setRtcConnectionState({
            sessionId,
            state,
          }),
        );
      },
      onRemoteMediaStateChange: ({ sessionId, remoteAudioActive: remoteAudio, remoteVideoActive: remoteVideo }) => {
        dispatch(
          setRemoteMediaState({
            sessionId,
            remoteAudioActive: remoteAudio,
            remoteVideoActive: remoteVideo,
          }),
        );
      },
      onLocalMediaStateChange: ({ sessionId, localAudioEnabled: audioEnabled, localVideoEnabled: videoEnabled }) => {
        if (typeof audioEnabled === 'boolean') {
          dispatch(
            setLocalAudioEnabled({
              sessionId,
              enabled: audioEnabled,
            }),
          );
        }

        if (typeof videoEnabled === 'boolean') {
          dispatch(
            setLocalVideoEnabled({
              sessionId,
              enabled: videoEnabled,
            }),
          );
        }
      },
      onError: (message, sessionId) => {
        dispatch(setCallError(message));
        dispatch(
          setRtcConnectionState({
            sessionId,
            state: 'failed',
          }),
        );
      },
      onTokenWillExpire: async ({ sessionId }) => {
        const activeCall = currentCallRef.current;
        if (!activeCall || activeCall.sessionId !== sessionId) {
          return null;
        }

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
    });

    return () => {
      callRtcClient.configure({});
    };
  }, [dispatch, issueCallToken]);

  const resolveRtcJoinParams = useCallback(
    (targetCall: NonNullable<typeof currentCall>) => {
      const appId = targetCall.rtc?.appId ?? process.env.NEXT_PUBLIC_AGORA_APP_ID;
      const channelName = targetCall.rtc?.channelName ?? targetCall.agoraChannelName;
      const token = targetCall.rtc?.token ?? null;
      const uid = targetCall.rtc?.uid ?? user?.accountId ?? null;

      if (!appId) {
        return null;
      }

      return {
        sessionId: targetCall.sessionId,
        callType: targetCall.callType ?? CallTypeEnum.VOICE,
        appId,
        channelName,
        token,
        uid,
      };
    },
    [user?.accountId],
  );

  const cleanupRtcSession = useCallback(async () => {
    await callRtcClient.cleanup();
    activeRtcSessionIdRef.current = null;
  }, []);

  useEffect(() => {
    if (!currentCall) {
      if (activeRtcSessionIdRef.current) {
        void cleanupRtcSession();
      }
      return;
    }

    const shouldConnectRtc =
      currentCall.status === CallStatusEnum.PENDING || currentCall.status === CallStatusEnum.ACTIVE;

    if (!shouldConnectRtc) {
      return;
    }

    if (activeRtcSessionIdRef.current === currentCall.sessionId) {
      return;
    }

    const joinParams = resolveRtcJoinParams(currentCall);
    if (!joinParams) {
      dispatch(setCallError('Thiếu NEXT_PUBLIC_AGORA_APP_ID để khởi tạo cuộc gọi.'));
      dispatch(
        setRtcConnectionState({
          sessionId: currentCall.sessionId,
          state: 'failed',
        }),
      );
      return;
    }

    activeRtcSessionIdRef.current = currentCall.sessionId;

    void (async () => {
      try {
        await callRtcClient.joinAndPublish(joinParams);
      } catch {
        activeRtcSessionIdRef.current = null;
      }
    })();
  }, [cleanupRtcSession, currentCall, dispatch, resolveRtcJoinParams]);

  useEffect(() => {
    return () => {
      void cleanupRtcSession();
    };
  }, [cleanupRtcSession]);

  const handleStartCall = useCallback(
    async (chatRoomId: number, callType: CallTypeEnum) => {
      if (!isSignedIn) {
        toast.error('Vui lòng đăng nhập để bắt đầu cuộc gọi.');
        return null;
      }

      try {
        const response = await startCall({
          chatRoomId,
          publisher: resolvePublisherFlag(callType),
          callType,
        }).unwrap();

        if (response.data) {
          const hydratedCall = await hydrateCallWithToken(response.data, callType);
          dispatch(setOutgoingCallPending(hydratedCall));
          dispatch(setCurrentCall(hydratedCall));
        }

        toast.success(
          callType === CallTypeEnum.VIDEO ? 'Đang bắt đầu cuộc gọi video...' : 'Đang bắt đầu cuộc gọi thoại...',
        );
        return response.data ?? null;
      } catch (error) {
        console.error('Failed to initiate call:', error);
        dispatch(setCallError('Không thể bắt đầu cuộc gọi.'));
        toast.error('Không thể bắt đầu cuộc gọi. Vui lòng thử lại.');
        return null;
      }
    },
    [dispatch, hydrateCallWithToken, isSignedIn, resolvePublisherFlag, startCall],
  );

  const handleAcceptIncomingCall = useCallback(async () => {
    if (!incomingCall) {
      return null;
    }

    try {
      const response = await joinCall({
        chatRoomId: incomingCall.chatRoomId,
        sessionId: incomingCall.sessionId,
        publisher: true,
        callType: incomingCall.session?.callType,
      }).unwrap();

      if (response.data) {
        const hydratedCall = await hydrateCallWithToken(
          response.data,
          incomingCall.session?.callType ?? CallTypeEnum.VOICE,
        );
        dispatch(setCurrentCall(hydratedCall));
      }

      dispatch(dismissIncomingCall());
      toast.success('Bạn đã tham gia cuộc gọi.');
      return response.data ?? null;
    } catch (error) {
      console.error('Failed to accept call:', error);
      toast.error('Không thể tham gia cuộc gọi.');
      return null;
    }
  }, [dispatch, hydrateCallWithToken, incomingCall, joinCall]);

  const handleDeclineIncomingCall = useCallback(async () => {
    if (!incomingCall) {
      return;
    }

    try {
      await cleanupRtcSession();
      dispatch(dismissIncomingCall());
      toast('Đã từ chối cuộc gọi.');
    } catch (error) {
      console.error('Failed to decline call:', error);
      toast.error('Không thể từ chối cuộc gọi.');
    }
  }, [cleanupRtcSession, dispatch, incomingCall]);

  const handleEndCall = useCallback(async () => {
    if (!currentCall) {
      return;
    }

    try {
      await endCall({
        chatRoomId: currentCall.chatRoomId,
        sessionId: currentCall.sessionId,
        reason: CallEndReasonEnum.HANGUP,
      }).unwrap();
    } catch (error) {
      console.error('Failed to end call:', error);
    } finally {
      await cleanupRtcSession();
      dispatch(endCurrentCall({ sessionId: currentCall.sessionId }));
    }
  }, [cleanupRtcSession, currentCall, dispatch, endCall]);

  const handleLeaveCall = useCallback(async () => {
    if (!currentCall) {
      return;
    }

    try {
      await leaveCall({
        chatRoomId: currentCall.chatRoomId,
        sessionId: currentCall.sessionId,
      }).unwrap();
    } catch (error) {
      console.error('Failed to leave call:', error);
    } finally {
      await cleanupRtcSession();
      dispatch(endCurrentCall({ sessionId: currentCall.sessionId }));
    }
  }, [cleanupRtcSession, currentCall, dispatch, leaveCall]);

  const bindRtcContainers = useCallback(
    (params: { localVideoContainer?: HTMLElement | null; remoteVideoContainer?: HTMLElement | null }) => {
      callRtcClient.bindContainers(params);
    },
    [],
  );

  const handleToggleLocalAudio = useCallback(async () => {
    await callRtcClient.toggleLocalAudio();
  }, []);

  const handleToggleLocalVideo = useCallback(async () => {
    if (currentCall?.callType !== CallTypeEnum.VIDEO) {
      return;
    }

    await callRtcClient.toggleLocalVideo();
  }, [currentCall?.callType]);

  const isRtcReady = useMemo(() => {
    return rtcConnectionState === 'connected' || rtcConnectionState === 'reconnecting';
  }, [rtcConnectionState]);

  return {
    currentCall,
    incomingCall,
    callError,
    rtcConnectionState,
    localAudioEnabled,
    localVideoEnabled,
    remoteAudioActive,
    remoteVideoActive,
    isRtcReady,
    isInitiatingCall,
    isAcceptingCall,
    isDecliningCall: isLeavingCall,
    isEndingCall,
    handleStartCall,
    handleAcceptIncomingCall,
    handleDeclineIncomingCall,
    handleEndCall,
    handleLeaveCall,
    bindRtcContainers,
    handleToggleLocalAudio,
    handleToggleLocalVideo,
  };
};

export default useCallRoomActions;
