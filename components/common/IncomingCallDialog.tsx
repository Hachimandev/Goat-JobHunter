'use client';

import ConfirmDialog from '@/components/common/ConfirmDialog';
import useCallRoomActions from '@/hooks/useCallRoomActions';
import { useEffect } from 'react';

const AUTO_DISMISS_TIMEOUT_MS = 60 * 1000;

export default function IncomingCallDialog() {
  const { incomingCall, handleAcceptIncomingCall, handleDeclineIncomingCall, isAcceptingCall, isDecliningCall } =
    useCallRoomActions();

  useEffect(() => {
    if (!incomingCall) {
      return;
    }

    const timer = setTimeout(() => {
      void handleDeclineIncomingCall();
    }, AUTO_DISMISS_TIMEOUT_MS);

    return () => {
      clearTimeout(timer);
    };
  }, [handleDeclineIncomingCall, incomingCall]);

  return (
    <ConfirmDialog
      open={Boolean(incomingCall)}
      onOpenChange={(open) => {
        if (!open) {
          void handleDeclineIncomingCall();
        }
      }}
      title="Cuộc gọi đến"
      description={
        incomingCall
          ? `Tài khoản #${incomingCall.actorAccountId} đang gọi trong phòng #${incomingCall.chatRoomId}.`
          : 'Bạn có cuộc gọi mới.'
      }
      cancelText="Từ chối"
      confirmText="Nhận cuộc gọi"
      disableCancel={isAcceptingCall || isDecliningCall}
      disableConfirm={isAcceptingCall || isDecliningCall}
      isLoading={isAcceptingCall || isDecliningCall}
      onConfirm={() => {
        void handleAcceptIncomingCall();
      }}
    />
  );
}
