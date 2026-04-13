'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  useLazyCheckExistingChatRoomQuery,
  useSendMessageToNewChatRoomMutation,
} from '@/services/chatRoom/chatRoomApi';
import { Visibility } from '@/types/enum';
import { RelationshipState } from '@/services/friendship/friendshipType';
import { extractApiErrorMessage, isAccountPrivateError, isBlockedInteractionError } from '@/utils/apiError';
import { useAppSelector } from '@/lib/hooks';

const DEFAULT_MESSAGE_ERROR = 'Không thể tạo cuộc trò chuyện';
const ACCOUNT_PRIVATE_MESSAGE = 'Tài khoản này đang ở chế độ riêng tư. Bạn không thể bắt đầu cuộc trò chuyện mới.';

export function useDirectMessageNavigation() {
  const router = useRouter();
  const friendshipPairs = useAppSelector((state) => state.friendship.pairs);
  const [checkExistingChatRoom, { isFetching: isCheckingExistingChatRoom }] = useLazyCheckExistingChatRoomQuery();
  const [sendMessageToNewChatRoom, { isLoading: isCreatingChatRoom }] = useSendMessageToNewChatRoomMutation();

  const navigateToDirectChat = useCallback(
    async (
      accountId: number,
      options?: {
        visibility?: Visibility | string | null;
      },
    ): Promise<boolean> => {
      if (!Number.isFinite(accountId) || accountId <= 0) {
        toast.error(DEFAULT_MESSAGE_ERROR);
        return false;
      }

      const pair = friendshipPairs[String(accountId)];
      const isBlocked =
        pair?.blockedByMe || pair?.blockedByOther || pair?.relationshipState === RelationshipState.BLOCKED;

      if (isBlocked) {
        toast.error('Không thể mở cuộc trò chuyện khi đang ở trạng thái chặn.');
        return false;
      }

      if (options?.visibility === Visibility.PRIVATE) {
        toast.error(ACCOUNT_PRIVATE_MESSAGE);
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

        if (isAccountPrivateError(error)) {
          toast.error(ACCOUNT_PRIVATE_MESSAGE);
          return false;
        }

        if (isBlockedInteractionError(error)) {
          toast.error('Không thể mở cuộc trò chuyện khi đang ở trạng thái chặn.');
          return false;
        }

        toast.error(extractApiErrorMessage(error, DEFAULT_MESSAGE_ERROR));
        return false;
      }
    },
    [checkExistingChatRoom, friendshipPairs, router, sendMessageToNewChatRoom],
  );

  return {
    navigateToDirectChat,
    isLoading: isCheckingExistingChatRoom || isCreatingChatRoom,
  };
}
