import useCallRoomActions from '@/hooks/useCallRoomActions';
import { useEffect, useRef } from 'react';
import { useFetchChatRoomsByIdQuery } from '@/services/chatRoom/chatRoomApi';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Loader2, PhoneIncoming, PhoneMissed } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ChatRoomType } from '@/types/enum';

const AUTO_DISMISS_TIMEOUT_MS = 60 * 1000;

export default function IncomingCallDialog() {
  const { incomingCall, handleAcceptIncomingCall, handleDeclineIncomingCall, isAcceptingCall, isDecliningCall } =
    useCallRoomActions();
  const isAcceptIntentRef = useRef(false);
  const { data: incomingChatRoomData } = useFetchChatRoomsByIdQuery(incomingCall?.chatRoomId ?? 0, {
    skip: !incomingCall?.chatRoomId,
  });

  const incomingChatRoom = incomingChatRoomData?.data;
  const roomLabel = incomingChatRoom
    ? incomingChatRoom.type === ChatRoomType.DIRECT
      ? incomingChatRoom.name
      : incomingChatRoom.name
    : null;
  const title = incomingCall
    ? roomLabel
      ? incomingChatRoom?.type === ChatRoomType.DIRECT
        ? `Cuộc gọi đến từ ${roomLabel}`
        : `Cuộc gọi đến từ nhóm ${roomLabel}`
      : `Bạn có cuộc gọi đến từ phòng #${incomingCall.chatRoomId}`
    : 'Bạn có cuộc gọi mới';

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
    if (isAcceptIntentRef.current || isAcceptingCall) {
      isAcceptIntentRef.current = false;
      return;
    }

    void handleDeclineIncomingCall();
  };

  return (
    <AlertDialog open={!!incomingCall} onOpenChange={handleOpenChange}>
      <AlertDialogContent className="max-w-sm! rounded-2xl bg-white p-6 shadow-2xl">
        <AlertDialogHeader className="items-center text-center space-y-3">
          <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
            <PhoneIncoming className="w-10 h-10 text-gray-500" />
          </div>

          <AlertDialogTitle className="text-xl text-center font-semibold">{title}</AlertDialogTitle>
        </AlertDialogHeader>

        <AlertDialogFooter className="flex justify-around!">
          <div className="flex flex-col items-center gap-2">
            <Button
              onClick={handleCancel}
              variant="destructive"
              // size="icon-lg"
              disabled={isAcceptingCall || isDecliningCall}
              className="rounded-full flex items-center justify-center h-12 w-12"
            >
              {isAcceptingCall || isDecliningCall ? (
                <Loader2 className="h-8 w-8 animate-spin text-white" />
              ) : (
                <PhoneMissed className="h-8 w-8 text-white" />
              )}
            </Button>
            <p className="text-muted-foreground text-sm">Từ chối</p>
          </div>

          <div className="flex flex-col items-center gap-2">
            <Button
              onClick={handleAccept}
              variant="default"
              // size="icon-lg"
              disabled={isAcceptingCall || isDecliningCall}
              className="rounded-full flex items-center justify-center h-12 w-12"
            >
              {isAcceptingCall || isDecliningCall ? (
                <Loader2 className="h-8 w-8 animate-spin text-white" />
              ) : (
                <PhoneIncoming className="h-8 w-8 text-white" />
              )}
            </Button>
            <p className="text-muted-foreground text-sm">Chấp nhận</p>
          </div>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
