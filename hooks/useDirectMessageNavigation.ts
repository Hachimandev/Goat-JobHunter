'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  useLazyCheckExistingChatRoomQuery,
  useSendMessageToNewChatRoomMutation,
} from '@/services/chatRoom/chatRoomApi';

const DEFAULT_MESSAGE_ERROR = 'Không thể tạo cuộc trò chuyện';

export function useDirectMessageNavigation() {
  const router = useRouter();
  const [checkExistingChatRoom, { isFetching: isCheckingExistingChatRoom }] = useLazyCheckExistingChatRoomQuery();
  const [sendMessageToNewChatRoom, { isLoading: isCreatingChatRoom }] = useSendMessageToNewChatRoomMutation();

  const navigateToDirectChat = useCallback(
    async (accountId: number): Promise<boolean> => {
      if (!Number.isFinite(accountId) || accountId <= 0) {
        toast.error(DEFAULT_MESSAGE_ERROR);
        return false;
      }

      try {
        const { data: existingChatRoom } = await checkExistingChatRoom(accountId).unwrap();

        if (existingChatRoom?.roomId) {
          router.push(`/messages/${existingChatRoom.roomId}`);
          return true;
        }

        const result = await sendMessageToNewChatRoom({ accountId }).unwrap();

        if (result.data?.roomId) {
          router.push(`/messages/${result.data.roomId}`);
          return true;
        }

        toast.error(DEFAULT_MESSAGE_ERROR);
        return false;
      } catch (error) {
        console.error(error);
        toast.error(DEFAULT_MESSAGE_ERROR);
        return false;
      }
    },
    [checkExistingChatRoom, router, sendMessageToNewChatRoom],
  );

  return {
    navigateToDirectChat,
    isLoading: isCheckingExistingChatRoom || isCreatingChatRoom,
  };
}
