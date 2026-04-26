import { useCallback, useEffect, useEffectEvent, useMemo, useRef, useState } from 'react';
import AgoraRTC from 'agora-rtc-sdk-ng';
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
  selectParticipantMediaStates,
  selectRemoteAudioActive,
  selectRemoteVideoActive,
  selectRtcConnectionState,
  setCallError,
  setLocalAudioEnabled,
  setLocalVideoEnabled,
  setParticipantMediaStates,
  setRemoteMediaState,
  setCurrentCall,
  setOutgoingCallPending,
  setRtcConnectionState,
} from '@/lib/features/callSlice';
import {
  selectCallDevicePreferences,
  setCallDevicePreference,
  setCallDevicePreferences,
  type CallDevicePreferenceKey,
  type CallDevicePreferencesState,
} from '@/lib/features/callDevicePreferencesSlice';
import {
  useJoinCallMutation,
  useLeaveCallMutation,
  useDeclineCallMutation,
  useEndCallMutation,
  useIssueCallTokenMutation,
  useStartCallMutation,
} from '@/services/chatRoom/call/callApi';
import { useUser } from '@/hooks/useUser';
import { CallEndReasonEnum, CallStatusEnum, CallTypeEnum } from '@/types/enum';
import { callRtcClient } from '@/services/callRtc/AgoraCallRtcClient';
import { CallSession } from '@/types/model';
import type { UID } from 'agora-rtc-sdk-ng';
import { computeAgoraUid } from '@/services/callRtc/agoraUid';
import {
  CallDeviceInventory,
  CallDeviceKind,
  createEmptyCallDeviceInventory,
  listCallDevices,
  resolveCallDevicePreferences,
} from '@/services/callRtc/callDeviceUtils';

const CAMERA_WARNING_MESSAGES = new Set([
  'Không thể bật camera vì camera đang được thiết bị hoặc ứng dụng khác sử dụng.',
  'Camera đang được thiết bị hoặc ứng dụng khác sử dụng. Cuộc gọi tiếp tục với âm thanh.',
  'Không thể bật camera lúc này. Cuộc gọi vẫn tiếp tục với âm thanh.',
]);

const CALL_DEVICE_KEY_BY_KIND: Record<CallDeviceKind, CallDevicePreferenceKey> = {
  microphone: 'microphoneId',
  speaker: 'speakerId',
  camera: 'cameraId',
};

const CALL_DEVICE_LABEL_BY_KIND: Record<CallDeviceKind, string> = {
  microphone: 'Microphone',
  speaker: 'Loa',
  camera: 'Camera',
};

type SyncCallDevicesOptions = {
  overridePreferences?: CallDevicePreferencesState;
  applyToActiveRtc?: boolean;
  notifyFallback?: boolean;
};

const useCallRoomActions = () => {
  const { isSignedIn, user } = useUser();
  const dispatch = useAppDispatch();
  const currentCall = useAppSelector(selectCurrentCall);
  const incomingCall = useAppSelector(selectIncomingCall);
  const callError = useAppSelector(selectCallError);
  const rtcConnectionState = useAppSelector(selectRtcConnectionState);
  const localAudioEnabled = useAppSelector(selectLocalAudioEnabled);
  const localVideoEnabled = useAppSelector(selectLocalVideoEnabled);
  const participantMediaStates = useAppSelector(selectParticipantMediaStates);
  const remoteAudioActive = useAppSelector(selectRemoteAudioActive);
  const remoteVideoActive = useAppSelector(selectRemoteVideoActive);
  const callDevicePreferences = useAppSelector(selectCallDevicePreferences);

  const [startCall, { isLoading: isInitiatingCall }] = useStartCallMutation();
  const [joinCall, { isLoading: isAcceptingCall }] = useJoinCallMutation();
  const [leaveCall, { isLoading: isLeavingCall }] = useLeaveCallMutation();
  const [declineCall, { isLoading: isDecliningCallMutation }] = useDeclineCallMutation();
  const [endCall, { isLoading: isEndingCall }] = useEndCallMutation();
  const [issueCallToken] = useIssueCallTokenMutation();

  const [availableCallDevices, setAvailableCallDevices] = useState<CallDeviceInventory>(
    createEmptyCallDeviceInventory(),
  );
  const [isLoadingCallDevices, setIsLoadingCallDevices] = useState(false);
  const [updatingCallDeviceKind, setUpdatingCallDeviceKind] = useState<CallDeviceKind | null>(null);

  const currentCallRef = useRef(currentCall);
  const activeRtcSessionIdRef = useRef<number | null>(null);
  const tokenHydratingSessionIdRef = useRef<number | null>(null);
  const appliedCallDevicePreferencesRef = useRef<CallDevicePreferencesState>({
    microphoneId: null,
    speakerId: null,
    cameraId: null,
  });

  useEffect(() => {
    currentCallRef.current = currentCall;
  }, [currentCall]);

  const resolvePublisherFlag = useCallback((callType: CallTypeEnum) => {
    return callType === CallTypeEnum.VIDEO || callType === CallTypeEnum.VOICE;
  }, []);

  const resolveCurrentParticipantPublisher = useCallback(
    (callSession: CallSession | null) => {
      if (!callSession) {
        return true;
      }

      const participantPublisher =
        typeof user?.accountId === 'number'
          ? callSession.participants.find(
              (participant) => participant.account.accountId === user.accountId && !participant.leftAt,
            )?.publisher
          : undefined;

      return participantPublisher ?? callSession.rtc?.publisher ?? true;
    },
    [user?.accountId],
  );

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

  const applyResolvedCallDevicesToActiveRtc = useCallback(async (preferences: CallDevicePreferencesState) => {
    const previousPreferences = appliedCallDevicePreferencesRef.current;
    const activeCall = currentCallRef.current;

    callRtcClient.setPreferredDevices(preferences);

    if (!activeCall) {
      appliedCallDevicePreferencesRef.current = preferences;
      return;
    }

    if (previousPreferences.microphoneId !== preferences.microphoneId) {
      await callRtcClient.switchMicrophone(preferences.microphoneId);
    }

    if (previousPreferences.speakerId !== preferences.speakerId) {
      await callRtcClient.switchSpeaker(preferences.speakerId);
    }

    if ((activeCall.callType ?? CallTypeEnum.VOICE) === CallTypeEnum.VIDEO) {
      if (previousPreferences.cameraId !== preferences.cameraId) {
        await callRtcClient.switchCamera(preferences.cameraId);
      }
    }

    appliedCallDevicePreferencesRef.current = preferences;
  }, []);

  const syncCallDevices = useCallback(
    async ({ overridePreferences, applyToActiveRtc = false, notifyFallback = false }: SyncCallDevicesOptions = {}) => {
      setIsLoadingCallDevices(true);

      try {
        const inventory = await listCallDevices();
        setAvailableCallDevices(inventory);

        const nextPreferences = overridePreferences ?? callDevicePreferences;
        const resolution = resolveCallDevicePreferences(nextPreferences, inventory);

        if (
          resolution.persisted.microphoneId !== nextPreferences.microphoneId ||
          resolution.persisted.speakerId !== nextPreferences.speakerId ||
          resolution.persisted.cameraId !== nextPreferences.cameraId
        ) {
          dispatch(setCallDevicePreferences(resolution.persisted));
        }

        if (applyToActiveRtc) {
          await applyResolvedCallDevicesToActiveRtc(resolution.applied);
        } else {
          callRtcClient.setPreferredDevices(resolution.applied);
          appliedCallDevicePreferencesRef.current = resolution.applied;
        }

        if (notifyFallback && resolution.fallbackKinds.length > 0) {
          const fallbackLabel = resolution.fallbackKinds
            .map((kind) => CALL_DEVICE_LABEL_BY_KIND[kind].toLowerCase())
            .join(', ');
          toast.info(`${fallbackLabel} đã lưu không còn sẵn. Đang dùng thiết bị mặc định hệ thống.`);
        }

        return {
          inventory,
          resolution,
        };
      } finally {
        setIsLoadingCallDevices(false);
      }
    },
    [applyResolvedCallDevicesToActiveRtc, callDevicePreferences, dispatch],
  );

  const handleDeviceEnvironmentChange = useEffectEvent(() => {
    void syncCallDevices({
      applyToActiveRtc: Boolean(currentCallRef.current),
      notifyFallback: true,
    });
  });

  useEffect(() => {
    void syncCallDevices();
  }, [syncCallDevices]);

  useEffect(() => {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.addEventListener) {
      return;
    }

    const previousCameraChanged = AgoraRTC.onCameraChanged;
    const previousMicrophoneChanged = AgoraRTC.onMicrophoneChanged;
    const previousPlaybackDeviceChanged = AgoraRTC.onPlaybackDeviceChanged;

    const handleNativeDeviceChange = () => {
      handleDeviceEnvironmentChange();
    };

    navigator.mediaDevices.addEventListener('devicechange', handleNativeDeviceChange);
    AgoraRTC.onCameraChanged = (info) => {
      previousCameraChanged?.(info);
      handleDeviceEnvironmentChange();
    };
    AgoraRTC.onMicrophoneChanged = (info) => {
      previousMicrophoneChanged?.(info);
      handleDeviceEnvironmentChange();
    };
    AgoraRTC.onPlaybackDeviceChanged = (info) => {
      previousPlaybackDeviceChanged?.(info);
      handleDeviceEnvironmentChange();
    };

    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', handleNativeDeviceChange);
      AgoraRTC.onCameraChanged = previousCameraChanged;
      AgoraRTC.onMicrophoneChanged = previousMicrophoneChanged;
      AgoraRTC.onPlaybackDeviceChanged = previousPlaybackDeviceChanged;
    };
  }, []);

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
      onRemoteParticipantsStateChange: ({ sessionId, participants }) => {
        const activeCall = currentCallRef.current;
        const nextParticipantMediaStates =
          activeCall && activeCall.sessionId === sessionId
            ? activeCall.participants.reduce<Record<number, { audioActive: boolean; videoActive: boolean }>>(
                (accumulator, participant) => {
                  if (participant.leftAt) {
                    return accumulator;
                  }

                  const uid = computeAgoraUid(
                    participant.account.accountId,
                    activeCall.sessionId,
                    activeCall.rtc?.channelName ?? activeCall.agoraChannelName,
                  );

                  if (uid === null) {
                    return accumulator;
                  }

                  const remoteParticipant = participants.find((candidate) => `${candidate.uid}` === `${uid}`);
                  if (!remoteParticipant) {
                    return accumulator;
                  }

                  accumulator[participant.account.accountId] = {
                    audioActive: remoteParticipant.audioActive,
                    videoActive: remoteParticipant.videoActive,
                  };
                  return accumulator;
                },
                {},
              )
            : {};

        dispatch(
          setParticipantMediaStates({
            sessionId,
            participantMediaStates: nextParticipantMediaStates,
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
      onWarning: (message, sessionId) => {
        if (CAMERA_WARNING_MESSAGES.has(message)) {
          dispatch(
            setLocalVideoEnabled({
              sessionId,
              enabled: false,
            }),
          );
        }

        toast.info(message);
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
            publisher: resolveCurrentParticipantPublisher(activeCall),
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
  }, [dispatch, issueCallToken, resolveCurrentParticipantPublisher]);

  const resolveRtcJoinParams = useCallback((targetCall: NonNullable<typeof currentCall>) => {
    const appId = targetCall.rtc?.appId;
    const channelName = targetCall.rtc?.channelName ?? targetCall.agoraChannelName;
    const token = targetCall.rtc?.token ?? null;
    const uid = targetCall.rtc?.uid ?? null;

    if (!appId || !channelName || !token || uid === null || uid === undefined) {
      return null;
    }

    return {
      sessionId: targetCall.sessionId,
      callType: targetCall.callType ?? CallTypeEnum.VOICE,
      appId,
      channelName,
      token,
      uid: uid as UID,
    };
  }, []);

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

    const isCurrentUserParticipant =
      typeof user?.accountId === 'number' &&
      currentCall.participants.some(
        (participant) => participant.account.accountId === user.accountId && !participant.leftAt,
      );

    const shouldConnectRtc =
      (currentCall.status === CallStatusEnum.PENDING || currentCall.status === CallStatusEnum.ACTIVE) &&
      isCurrentUserParticipant;

    if (!shouldConnectRtc) {
      return;
    }

    if (activeRtcSessionIdRef.current === currentCall.sessionId) {
      return;
    }

    const joinParams = resolveRtcJoinParams(currentCall);
    console.log('joinParams: ', joinParams);

    if (!joinParams) {
      if (tokenHydratingSessionIdRef.current === currentCall.sessionId) {
        return;
      }

      tokenHydratingSessionIdRef.current = currentCall.sessionId;
      void (async () => {
        try {
          const tokenResponse = await issueCallToken({
            chatRoomId: currentCall.chatRoomId,
            sessionId: currentCall.sessionId,
            publisher: resolveCurrentParticipantPublisher(currentCall),
          }).unwrap();

          if (tokenResponse.data) {
            dispatch(
              setCurrentCall({
                ...currentCall,
                rtc: tokenResponse.data,
              }),
            );
          }
        } catch {
          dispatch(setCallError('Không thể cấp token RTC để tham gia cuộc gọi.'));
          dispatch(
            setRtcConnectionState({
              sessionId: currentCall.sessionId,
              state: 'failed',
            }),
          );
        } finally {
          tokenHydratingSessionIdRef.current = null;
        }
      })();
      return;
    }

    activeRtcSessionIdRef.current = currentCall.sessionId;

    void (async () => {
      try {
        await syncCallDevices();
        await callRtcClient.joinAndPublish(joinParams);
      } catch {
        activeRtcSessionIdRef.current = null;
      }
    })();
  }, [
    cleanupRtcSession,
    currentCall,
    dispatch,
    issueCallToken,
    resolveCurrentParticipantPublisher,
    resolveRtcJoinParams,
    syncCallDevices,
    user?.accountId,
  ]);

  useEffect(() => {
    return () => {
      void cleanupRtcSession();
    };
  }, [cleanupRtcSession]);

  const handleSelectCallDevice = useCallback(
    async (kind: CallDeviceKind, deviceId: string | null) => {
      const key = CALL_DEVICE_KEY_BY_KIND[kind];
      const previousValue = callDevicePreferences[key];
      const nextPreferences: CallDevicePreferencesState = {
        ...callDevicePreferences,
        [key]: deviceId,
      };

      dispatch(
        setCallDevicePreference({
          key,
          deviceId,
        }),
      );
      setUpdatingCallDeviceKind(kind);

      try {
        await syncCallDevices({
          overridePreferences: nextPreferences,
          applyToActiveRtc: Boolean(currentCallRef.current),
        });
      } catch (error) {
        console.error(`Failed to switch ${kind}:`, error);
        dispatch(
          setCallDevicePreference({
            key,
            deviceId: previousValue,
          }),
        );
        await syncCallDevices({
          overridePreferences: {
            ...callDevicePreferences,
            [key]: previousValue,
          },
          applyToActiveRtc: Boolean(currentCallRef.current),
        });
        toast.error(`Không thể đổi ${CALL_DEVICE_LABEL_BY_KIND[kind].toLowerCase()} lúc này.`);
      } finally {
        setUpdatingCallDeviceKind(null);
      }
    },
    [callDevicePreferences, dispatch, syncCallDevices],
  );

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

  const handleJoinCallSession = useCallback(
    async (chatRoomId: number, sessionId: number, callType: CallTypeEnum = CallTypeEnum.VOICE) => {
      try {
        const response = await joinCall({
          chatRoomId,
          sessionId,
          publisher: true,
          callType,
        }).unwrap();

        if (response.data) {
          const hydratedCall = await hydrateCallWithToken(response.data, callType);
          dispatch(setCurrentCall(hydratedCall));
        }

        dispatch(dismissIncomingCall());
        toast.success('Bạn đã tham gia cuộc gọi.');
        return response.data ?? null;
      } catch (error) {
        console.error('Failed to join call session:', error);
        toast.error('Không thể tham gia cuộc gọi.');
        return null;
      }
    },
    [dispatch, hydrateCallWithToken, joinCall],
  );

  const handleAcceptIncomingCall = useCallback(async () => {
    if (!incomingCall) {
      return null;
    }

    return await handleJoinCallSession(
      incomingCall.chatRoomId,
      incomingCall.sessionId,
      incomingCall.callType ?? incomingCall.session?.callType ?? CallTypeEnum.VOICE,
    );
  }, [handleJoinCallSession, incomingCall]);

  const handleDeclineIncomingCall = useCallback(async () => {
    if (!incomingCall) {
      return;
    }

    try {
      await declineCall({
        chatRoomId: incomingCall.chatRoomId,
        sessionId: incomingCall.sessionId,
      }).unwrap();

      await cleanupRtcSession();
      dispatch(dismissIncomingCall());
      toast('Đã từ chối cuộc gọi.');
    } catch (error) {
      console.error('Failed to decline call:', error);
      toast.error('Không thể từ chối cuộc gọi.');
    }
  }, [cleanupRtcSession, declineCall, dispatch, incomingCall]);

  const handleEndCall = useCallback(async () => {
    if (!currentCall) {
      return;
    }

    try {
      const response = await endCall({
        chatRoomId: currentCall.chatRoomId,
        sessionId: currentCall.sessionId,
        reason: CallEndReasonEnum.HANGUP,
      }).unwrap();

      await cleanupRtcSession();
      dispatch(
        endCurrentCall({
          sessionId: currentCall.sessionId,
          endedAt: response.data?.endedAt ?? undefined,
          finalStatus: response.data?.status ?? CallStatusEnum.ENDED,
        }),
      );
    } catch (error) {
      console.error('Failed to end call:', error);
      dispatch(setCallError('Không thể kết thúc cuộc gọi.'));
      toast.error('Không thể kết thúc cuộc gọi. Vui lòng thử lại.');
    }
  }, [cleanupRtcSession, currentCall, dispatch, endCall]);

  const handleLeaveCall = useCallback(async () => {
    if (!currentCall) {
      return;
    }

    try {
      const response = await leaveCall({
        chatRoomId: currentCall.chatRoomId,
        sessionId: currentCall.sessionId,
      }).unwrap();

      await cleanupRtcSession();
      dispatch(
        endCurrentCall({
          sessionId: currentCall.sessionId,
          endedAt: response.data?.endedAt ?? undefined,
          finalStatus: response.data?.status ?? undefined,
        }),
      );
    } catch (error) {
      console.error('Failed to leave call:', error);
      dispatch(setCallError('Không thể rời cuộc gọi.'));
      toast.error('Không thể rời cuộc gọi.');
    }
  }, [cleanupRtcSession, currentCall, dispatch, leaveCall]);

  const bindRtcContainers = useCallback(
    (params: { localVideoContainer?: HTMLElement | null; remoteVideoContainer?: HTMLElement | null }) => {
      callRtcClient.bindContainers(params);
    },
    [],
  );

  const bindParticipantVideoContainer = useCallback(
    (params: { accountId: number; container: HTMLElement | null }) => {
      if (!currentCallRef.current || !user?.accountId) {
        return;
      }

      if (params.accountId === user.accountId) {
        callRtcClient.bindLocalVideoContainer(params.container);
        return;
      }

      const uid = computeAgoraUid(
        params.accountId,
        currentCallRef.current.sessionId,
        currentCallRef.current.rtc?.channelName ?? currentCallRef.current.agoraChannelName,
      );

      if (uid === null) {
        return;
      }

      callRtcClient.bindRemoteVideoContainer(uid, params.container);
    },
    [user?.accountId],
  );

  const handleToggleLocalAudio = useCallback(async () => {
    await callRtcClient.toggleLocalAudio();
  }, []);

  const handleToggleLocalVideo = useCallback(async () => {
    if (currentCall?.callType !== CallTypeEnum.VIDEO) {
      return;
    }

    try {
      await callRtcClient.toggleLocalVideo();
    } catch (error) {
      console.error('Failed to toggle local video:', error);
      toast.error('Không thể thay đổi trạng thái camera lúc này.');
    }
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
    participantMediaStates,
    remoteAudioActive,
    remoteVideoActive,
    isRtcReady,
    isInitiatingCall,
    isAcceptingCall,
    isDecliningCall: isDecliningCallMutation,
    isLeavingCall,
    isEndingCall,
    availableCallDevices,
    selectedCallDevices: callDevicePreferences,
    isLoadingCallDevices,
    updatingCallDeviceKind,
    handleStartCall,
    handleAcceptIncomingCall,
    handleJoinCallSession,
    handleDeclineIncomingCall,
    handleEndCall,
    handleLeaveCall,
    handleSelectCallDevice,
    bindRtcContainers,
    bindParticipantVideoContainer,
    handleToggleLocalAudio,
    handleToggleLocalVideo,
  };
};

export default useCallRoomActions;
