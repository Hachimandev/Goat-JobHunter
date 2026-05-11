import { useCallback } from "react";
import { Alert, Platform, ToastAndroid } from "react-native";
import {
  useCreateFriendRequestMutation,
  useAcceptFriendRequestMutation,
  useCancelFriendRequestMutation,
  useRejectFriendRequestMutation,
  useBlockUserMutation,
  useUnblockUserMutation,
} from "@/services/friendship/friendshipApi";
import { useUser } from "@/hooks/useUser";

const notify = (message: string) => {
  if (Platform.OS === "android") {
    ToastAndroid.show(message, ToastAndroid.SHORT);
  } else {
    Alert.alert("Thông báo", message);
  }
};

const getErrorMessage = (error: unknown, fallback: string) => {
  if (typeof error === "object" && error !== null) {
    const apiError = error as { data?: any };
    if (typeof apiError.data?.message === "string") {
      return apiError.data.message;
    }
  }
  return fallback;
};

export function useFriendActions() {
  const { user, isSignedIn } = useUser();

  const [createFriendRequest, { isLoading: isSendingRequest }] =
    useCreateFriendRequestMutation();
  const [acceptFriendRequest, { isLoading: isAcceptingRequest }] =
    useAcceptFriendRequestMutation();
  const [rejectFriendRequest, { isLoading: isRejectingRequest }] =
    useRejectFriendRequestMutation();
  const [cancelFriendRequest, { isLoading: isCancelingRequest }] =
    useCancelFriendRequestMutation();
  const [blockUser, { isLoading: isBlockingUser }] = useBlockUserMutation();
  const [unblockUser, { isLoading: isUnblockingUser }] =
    useUnblockUserMutation();

  const ensureSignedIn = useCallback(() => {
    if (!isSignedIn || !user) {
      notify("Bạn cần đăng nhập để thực hiện thao tác này.");
      return false;
    }
    return true;
  }, [isSignedIn, user]);

  const handleSendFriendRequest = useCallback(
    async (recipientId: number) => {
      if (!ensureSignedIn() || !user) {
        return false;
      }

      if (recipientId === user.accountId) {
        notify("Bạn không thể tự gửi lời mời kết bạn cho chính mình.");
        return false;
      }

      try {
        await createFriendRequest({ targetUserId: recipientId }).unwrap();
        notify("Đã gửi lời mời kết bạn.");
        return true;
      } catch (error) {
        console.error("Failed to create friend request:", error);
        Alert.alert(
          "Lỗi",
          getErrorMessage(error, "Không thể gửi lời mời kết bạn."),
        );
        return false;
      }
    },
    [createFriendRequest, ensureSignedIn, user],
  );

  const handleAcceptFriendRequest = useCallback(
    async (requestId: number) => {
      if (!ensureSignedIn()) {
        return false;
      }

      try {
        await acceptFriendRequest({ requestId }).unwrap();
        notify("Đã chấp nhận lời mời kết bạn.");
        return true;
      } catch (error) {
        console.error("Failed to accept friend request:", error);
        Alert.alert(
          "Lỗi",
          getErrorMessage(error, "Không thể chấp nhận lời mời."),
        );
        return false;
      }
    },
    [acceptFriendRequest, ensureSignedIn],
  );

  const handleRejectFriendRequest = useCallback(
    async (requestId: number) => {
      if (!ensureSignedIn()) {
        return false;
      }

      try {
        await rejectFriendRequest({ requestId }).unwrap();
        notify("Đã từ chối lời mời kết bạn.");
        return true;
      } catch (error) {
        console.error("Failed to reject friend request:", error);
        Alert.alert(
          "Lỗi",
          getErrorMessage(error, "Không thể từ chối lời mời."),
        );
        return false;
      }
    },
    [rejectFriendRequest, ensureSignedIn],
  );

  const handleCancelFriendRequest = useCallback(
    async (requestId: number) => {
      if (!ensureSignedIn()) {
        return false;
      }

      try {
        await cancelFriendRequest({ requestId }).unwrap();
        notify("Đã hủy lời mời kết bạn.");
        return true;
      } catch (error) {
        console.error("Failed to cancel friend request:", error);
        Alert.alert("Lỗi", getErrorMessage(error, "Không thể hủy lời mời."));
        return false;
      }
    },
    [cancelFriendRequest, ensureSignedIn],
  );

  const handleBlockUser = useCallback(
    async (targetUserId: number) => {
      if (!ensureSignedIn() || !user) {
        return false;
      }

      if (targetUserId === user.accountId) {
        notify("Bạn không thể tự chặn chính mình.");
        return false;
      }

      try {
        await blockUser({ targetUserId }).unwrap();
        notify("Đã chặn người dùng.");
        return true;
      } catch (error) {
        console.error("Failed to block user:", error);
        Alert.alert(
          "Lỗi",
          getErrorMessage(error, "Không thể chặn người dùng."),
        );
        return false;
      }
    },
    [blockUser, ensureSignedIn, user],
  );

  const handleUnblockUser = useCallback(
    async (targetUserId: number) => {
      if (!ensureSignedIn() || !user) {
        return false;
      }

      if (targetUserId === user.accountId) {
        notify("Bạn không thể tự bỏ chặn chính mình.");
        return false;
      }

      try {
        await unblockUser({ targetUserId }).unwrap();
        notify("Đã bỏ chặn người dùng.");
        return true;
      } catch (error) {
        console.error("Failed to unblock user:", error);
        Alert.alert(
          "Lỗi",
          getErrorMessage(error, "Không thể bỏ chặn người dùng."),
        );
        return false;
      }
    },
    [ensureSignedIn, unblockUser, user],
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
}
