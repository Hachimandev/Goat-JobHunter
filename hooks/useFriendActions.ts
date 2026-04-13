import { useUser } from '@/hooks/useUser';
import { useAppSelector } from '@/lib/hooks';
import {
  useAcceptFriendRequestMutation,
  useBlockUserMutation,
  useCancelFriendRequestMutation,
  useCreateFriendRequestMutation,
  useRejectFriendRequestMutation,
  useUnblockUserMutation,
} from '@/services/friendship/friendshipApi';
import { extractApiErrorMessage, isBlockedInteractionError } from '@/utils/apiError';
import { useCallback } from 'react';
import { toast } from 'sonner';

const DEFAULT_SEND_ERROR_MESSAGE = 'Không thể gửi lời mời lúc này.';
const DEFAULT_ACCEPT_ERROR_MESSAGE = 'Không thể chấp nhận lời mời lúc này.';
const DEFAULT_REJECT_ERROR_MESSAGE = 'Không thể từ chối lời mời lúc này.';
const DEFAULT_CANCEL_ERROR_MESSAGE = 'Không thể hủy lời mời lúc này.';
const DEFAULT_BLOCK_ERROR_MESSAGE = 'Không thể chặn người dùng lúc này.';
const DEFAULT_UNBLOCK_ERROR_MESSAGE = 'Không thể bỏ chặn người dùng lúc này.';

type ApiErrorLike = {
  status?: number;
  data?: unknown;
};

const getApiErrorStatus = (error: unknown): number | null => {
  const apiError = error as ApiErrorLike;
  return typeof apiError?.status === 'number' ? apiError.status : null;
};

const mapErrorMessage = (error: unknown, fallbackMessage: string): string => {
  const status = getApiErrorStatus(error);

  if (isBlockedInteractionError(error)) {
    return 'Không thể thực hiện thao tác vì mối quan hệ hiện đang bị chặn.';
  }

  if (status === 403) {
    return 'Bạn không có quyền thực hiện thao tác này.';
  }

  if (status === 409) {
    return 'Không thể thực hiện thao tác này vì trạng thái quan hệ đã thay đổi.';
  }

  if (status === 400) {
    return 'Yêu cầu không hợp lệ. Vui lòng thử lại.';
  }

  if (status === 404) {
    return 'Không tìm thấy lời mời hoặc người dùng liên quan.';
  }

  return extractApiErrorMessage(error, fallbackMessage);
};

export const useFriendActions = () => {
  const { user, isSignedIn } = useUser();
  const pairs = useAppSelector((state) => state.friendship.pairs);

  const [createFriendRequest, { isLoading: isSendingRequest }] = useCreateFriendRequestMutation();
  const [acceptFriendRequest, { isLoading: isAcceptingRequest }] = useAcceptFriendRequestMutation();
  const [rejectFriendRequest, { isLoading: isRejectingRequest }] = useRejectFriendRequestMutation();
  const [cancelFriendRequest, { isLoading: isCancelingRequest }] = useCancelFriendRequestMutation();
  const [blockUser, { isLoading: isBlockingUser }] = useBlockUserMutation();
  const [unblockUser, { isLoading: isUnblockingUser }] = useUnblockUserMutation();

  const ensureSignedIn = useCallback((): boolean => {
    if (!isSignedIn || !user) {
      toast.error('Bạn cần đăng nhập để thực hiện thao tác này.');
      return false;
    }

    return true;
  }, [isSignedIn, user]);

  const handleSendFriendRequest = useCallback(
    async (recipientId: number): Promise<boolean> => {
      if (!ensureSignedIn() || !user) {
        return false;
      }

      if (recipientId === user.accountId) {
        toast.error('Bạn không thể tự gửi lời mời kết bạn cho chính mình.');
        return false;
      }

      try {
        await createFriendRequest({ targetUserId: recipientId }).unwrap();
        toast.success('Đã gửi lời mời kết bạn.');
        return true;
      } catch (error) {
        console.error('Failed to create friend request:', error);
        toast.error(mapErrorMessage(error, DEFAULT_SEND_ERROR_MESSAGE));
        return false;
      }
    },
    [createFriendRequest, ensureSignedIn, user],
  );

  const handleAcceptFriendRequest = useCallback(
    async (requestId: number): Promise<boolean> => {
      if (!ensureSignedIn()) {
        return false;
      }

      try {
        await acceptFriendRequest({ requestId }).unwrap();
        toast.success('Đã chấp nhận lời mời kết bạn.');
        return true;
      } catch (error) {
        console.error('Failed to accept friend request:', error);
        toast.error(mapErrorMessage(error, DEFAULT_ACCEPT_ERROR_MESSAGE));
        return false;
      }
    },
    [acceptFriendRequest, ensureSignedIn],
  );

  const handleRejectFriendRequest = useCallback(
    async (requestId: number): Promise<boolean> => {
      if (!ensureSignedIn()) {
        return false;
      }

      try {
        await rejectFriendRequest({ requestId }).unwrap();
        toast.success('Đã từ chối lời mời kết bạn.');
        return true;
      } catch (error) {
        console.error('Failed to reject friend request:', error);
        toast.error(mapErrorMessage(error, DEFAULT_REJECT_ERROR_MESSAGE));
        return false;
      }
    },
    [ensureSignedIn, rejectFriendRequest],
  );

  const handleCancelFriendRequest = useCallback(
    async (requestId: number): Promise<boolean> => {
      if (!ensureSignedIn()) {
        return false;
      }

      try {
        await cancelFriendRequest({ requestId }).unwrap();
        toast.success('Đã hủy lời mời kết bạn.');
        return true;
      } catch (error) {
        console.error('Failed to cancel friend request:', error);
        toast.error(mapErrorMessage(error, DEFAULT_CANCEL_ERROR_MESSAGE));
        return false;
      }
    },
    [cancelFriendRequest, ensureSignedIn],
  );

  const handleBlockUser = useCallback(
    async (targetUserId: number): Promise<boolean> => {
      if (!ensureSignedIn() || !user) {
        return false;
      }

      if (targetUserId === user.accountId) {
        toast.error('Bạn không thể tự chặn chính mình.');
        return false;
      }

      try {
        await blockUser({ targetUserId }).unwrap();
        toast.success('Đã chặn người dùng.');
        return true;
      } catch (error) {
        console.error('Failed to block user:', error);
        toast.error(mapErrorMessage(error, DEFAULT_BLOCK_ERROR_MESSAGE));
        return false;
      }
    },
    [blockUser, ensureSignedIn, user],
  );

  const handleUnblockUser = useCallback(
    async (targetUserId: number): Promise<boolean> => {
      if (!ensureSignedIn() || !user) {
        return false;
      }

      if (targetUserId === user.accountId) {
        toast.error('Bạn không thể tự bỏ chặn chính mình.');
        return false;
      }

      const pair = pairs[String(targetUserId)];

      if (!pair?.blockedByMe) {
        toast('Người dùng này hiện không nằm trong danh sách bạn đã chặn.');
        return true;
      }

      try {
        await unblockUser({ targetUserId }).unwrap();
        toast.success('Đã bỏ chặn người dùng.');
        return true;
      } catch (error) {
        console.error('Failed to unblock user:', error);
        toast.error(mapErrorMessage(error, DEFAULT_UNBLOCK_ERROR_MESSAGE));
        return false;
      }
    },
    [ensureSignedIn, pairs, unblockUser, user],
  );

  return {
    handleSendFriendRequest,
    handleAcceptFriendRequest,
    handleRejectFriendRequest,
    handleCancelFriendRequest,
    handleBlockUser,
    handleUnblockUser,
    isSendingRequest,
    isAcceptingRequest,
    isRejectingRequest,
    isCancelingRequest,
    isBlockingUser,
    isUnblockingUser,
    isMutating:
      isSendingRequest ||
      isAcceptingRequest ||
      isRejectingRequest ||
      isCancelingRequest ||
      isBlockingUser ||
      isUnblockingUser,
  };
};

export default useFriendActions;
