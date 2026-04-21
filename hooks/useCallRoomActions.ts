import { useCallback } from 'react';
import { toast } from 'sonner';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import {
  dismissIncomingCall,
  endCurrentCall,
  selectCurrentCall,
  selectIncomingCall,
  setCallError,
  setCurrentCall,
  setOutgoingCallRinging,
} from '@/lib/features/callSlice';
import {
  useAcceptCallMutation,
  useDeclineCallMutation,
  useEndCallMutation,
  useInitiateCallMutation,
} from '@/services/chatRoom/call/callApi';
import { useUser } from '@/hooks/useUser';
import { CallTypeEnum } from '@/types/enum';

const useCallRoomActions = () => {
  const { isSignedIn } = useUser();
  const dispatch = useAppDispatch();
  const currentCall = useAppSelector(selectCurrentCall);
  const incomingCall = useAppSelector(selectIncomingCall);

  const [initiateCall, { isLoading: isInitiatingCall }] = useInitiateCallMutation();
  const [acceptCall, { isLoading: isAcceptingCall }] = useAcceptCallMutation();
  const [declineCall, { isLoading: isDecliningCall }] = useDeclineCallMutation();
  const [endCall, { isLoading: isEndingCall }] = useEndCallMutation();

  const handleStartCall = useCallback(
    async (chatRoomId: number, callType: CallTypeEnum) => {
      if (!isSignedIn) {
        toast.error('Vui lòng đăng nhập để bắt đầu cuộc gọi.');
        return null;
      }

      try {
        const response = await initiateCall({
          chatRoomId,
          callType,
        }).unwrap();

        if (response.data) {
          dispatch(setOutgoingCallRinging(response.data));
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
    [dispatch, initiateCall, isSignedIn],
  );

  const handleAcceptIncomingCall = useCallback(async () => {
    if (!incomingCall) {
      return null;
    }

    try {
      const response = await acceptCall({
        chatRoomId: incomingCall.chatRoomId,
        callId: incomingCall.callId,
      }).unwrap();

      if (response.data) {
        dispatch(setCurrentCall(response.data));
      }

      dispatch(dismissIncomingCall());
      toast.success('Bạn đã tham gia cuộc gọi.');
      return response.data ?? null;
    } catch (error) {
      console.error('Failed to accept call:', error);
      toast.error('Không thể tham gia cuộc gọi.');
      return null;
    }
  }, [acceptCall, dispatch, incomingCall]);

  const handleDeclineIncomingCall = useCallback(async () => {
    if (!incomingCall) {
      return;
    }

    try {
      await declineCall({
        chatRoomId: incomingCall.chatRoomId,
        callId: incomingCall.callId,
      }).unwrap();
      dispatch(dismissIncomingCall());
      toast('Đã từ chối cuộc gọi.');
    } catch (error) {
      console.error('Failed to decline call:', error);
      toast.error('Không thể từ chối cuộc gọi.');
    }
  }, [declineCall, dispatch, incomingCall]);

  const handleEndCall = useCallback(async () => {
    if (!currentCall) {
      return;
    }

    try {
      await endCall({
        chatRoomId: currentCall.chatRoomId,
        callId: currentCall.callId,
      }).unwrap();
    } catch (error) {
      console.error('Failed to end call:', error);
    } finally {
      dispatch(endCurrentCall({ callId: currentCall.callId }));
    }
  }, [currentCall, dispatch, endCall]);

  return {
    currentCall,
    incomingCall,
    isInitiatingCall,
    isAcceptingCall,
    isDecliningCall,
    isEndingCall,
    handleStartCall,
    handleAcceptIncomingCall,
    handleDeclineIncomingCall,
    handleEndCall,
  };
};

export default useCallRoomActions;
