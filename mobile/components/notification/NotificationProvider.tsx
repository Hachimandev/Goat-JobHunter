import { ChatNotificationToast } from "@/components/common/ChatNotificationToast";
import {
  markChatRoomAsRead,
  removeNotification,
  setLastSeenTimestamp,
} from "@/lib/chatNotificationSlice";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { router } from "expo-router";
import React, { useCallback, useMemo } from "react";

/**
 * Notification Provider - Quản lý hiển thị notification toast
 * Render bên ngoài Stack để luôn visible across screens
 */
export const NotificationProvider = () => {
  const dispatch = useAppDispatch();
  const { pendingNotifications, showNotification } = useAppSelector(
    (state) => state.chatNotification,
  );

  // Get first notification
  const notification = useMemo(() => {
    return pendingNotifications.length > 0 ? pendingNotifications[0] : null;
  }, [pendingNotifications]);

  const handleNotificationPress = useCallback(() => {
    if (notification) {
      // Mark as read (auto-hides when no notifications left)
      dispatch(markChatRoomAsRead(notification.roomId));

      // Navigate to chat room
      router.push({
        pathname: "/chat/[id]",
        params: {
          id: notification.roomId.toString(),
          name: notification.senderName,
        },
      });
    }
  }, [notification, dispatch]);

  const handleDismiss = useCallback(() => {
    if (notification) {
      // Remove notification from queue (auto-hides toast)
      dispatch(removeNotification(notification.roomId));
      // Update lastSeenTimestamp to prevent re-notification on next poll
      dispatch(
        setLastSeenTimestamp({
          roomId: notification.roomId,
          timestamp: new Date().toISOString(),
        }),
      );
    }
  }, [notification, dispatch]);

  if (!notification) return null;

  return (
    <ChatNotificationToast
      visible={showNotification}
      senderName={notification.senderName}
      messagePreview={notification.messagePreview}
      senderAvatar={notification.senderAvatar}
      onPress={handleNotificationPress}
      onDismiss={handleDismiss}
      duration={5000}
    />
  );
};
