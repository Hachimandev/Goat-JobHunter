'use client';

import useCallRoomActions from '@/hooks/useCallRoomActions';
import { useEffect, useRef } from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Loader2, PhoneIncoming, PhoneMissed } from 'lucide-react';
import { Button } from '@/components/ui/button';

const AUTO_DISMISS_TIMEOUT_MS = 60 * 1000;

export default function IncomingCallDialog() {
  const { incomingCall, handleAcceptIncomingCall, handleDeclineIncomingCall, isAcceptingCall, isDecliningCall } =
    useCallRoomActions();
  const isAcceptIntentRef = useRef(false);

  useEffect(() => {
    if (!incomingCall) {
      isAcceptIntentRef.current = false;
    }
  }, [incomingCall]);

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

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      if (isAcceptIntentRef.current || isAcceptingCall) {
        isAcceptIntentRef.current = false;
        return;
      }

      void handleDeclineIncomingCall();
    }
  };

  const handleAccept = () => {
    isAcceptIntentRef.current = true;
    void handleAcceptIncomingCall();
  };

  const handleCancel = () => {
    if (!open) {
      if (isAcceptIntentRef.current || isAcceptingCall) {
        isAcceptIntentRef.current = false;
        return;
      }

      void handleDeclineIncomingCall();
    }
  };

  return (
    <AlertDialog open={!!incomingCall} onOpenChange={handleOpenChange}>
      <AlertDialogContent className="rounded-xl">
        <AlertDialogHeader>
          <AlertDialogTitle>Cuộc gọi đến</AlertDialogTitle>
          <AlertDialogDescription>
            {incomingCall ? 'Bạn có cuộc gọi đến từ cuộc trò chuyện hiện tại.' : 'Bạn có cuộc gọi mới.'}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button
            variant="destructive"
            onClick={handleCancel}
            disabled={isAcceptingCall || isDecliningCall}
            className="rounded-xl"
          >
            {isAcceptingCall || isDecliningCall ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang xử lý...
              </>
            ) : (
              <>
                <PhoneMissed className="mr-2 h-4 w-4" />
                Từ chối
              </>
            )}
          </Button>
          <Button onClick={handleAccept} disabled={isAcceptingCall || isDecliningCall} className="rounded-xl">
            {isAcceptingCall || isDecliningCall ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang xử lý...
              </>
            ) : (
              <>
                <PhoneIncoming className="mr-2 h-4 w-4" />
                Nhận cuộc gọi
              </>
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
