import {
    markChatRoomAsRead,
    receiveNewMessage,
    setCurrentChatRoom,
    setLastSeenTimestamp,
} from "@/lib/chatNotificationSlice";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { useFetchChatRoomsQuery } from "@/services/chatRoom/chatRoomApi";
import { ChatRoom, MessageType } from "@/types/model";
import { useCallback, useEffect, useRef } from "react";

interface UseNotificationManagerProps {
  enabled?: boolean;
  checkInterval?: number;
}

export const useNotificationManager = ({
  enabled = true,
  checkInterval = 5000,
}: UseNotificationManagerProps = {}) => {
  const dispatch = useAppDispatch();
  const { currentChatRoomId, showNotification, pendingNotifications } =
    useAppSelector((state) => state.chatNotification);

  const { data: chatRoomsRes } = useFetchChatRoomsQuery(
    { page: 1, size: 50 },
    { skip: !enabled, pollingInterval: checkInterval }, // Add polling to detect new messages
  );

  const previousMessagesRef = useRef<Record<number, MessageType[]>>({});

  /**
   * Kiểm tra tin nhắn mới từ các phòng chat khác
   */
  const checkNewMessages = useCallback(
    (chatRooms: ChatRoom[]) => {
      if (!chatRooms || chatRooms.length === 0) return;

      // Lấy messages từ các phòng khác (không phải phòng hiện tại)
      chatRooms.forEach(async (room) => {
        try {
          // Skip nếu đang ở phòng này
          if (room.roomId === currentChatRoomId) return;

          // Check if notification already exists in Redux pending list
          const alreadyNotified = pendingNotifications.some(
            (n) =>
              n.roomId === room.roomId && n.timestamp === room.lastMessageTime,
          );

          // Nếu đã có notification cho tin này, skip
          if (alreadyNotified) return;

          // Nếu có tin nhắn mới và có preview
          if (
            room.lastMessagePreview &&
            room.lastMessageTime &&
            !room.currentUserSentLastMessage
          ) {
            // Dispatch action để nhận tin nhắn mới
            dispatch(
              receiveNewMessage({
                roomId: room.roomId,
                senderName: room.name || "Người dùng",
                messagePreview: room.lastMessagePreview,
                timestamp: room.lastMessageTime,
              }),
            );
          }
        } catch (err) {
          console.error("Error checking new messages:", err);
        }
      });
    },
    [currentChatRoomId, dispatch, pendingNotifications],
  );

  /**
   * Effect để kiểm tra tin nhắn mới mỗi khi chatRooms thay đổi
   */
  useEffect(() => {
    if (enabled && chatRoomsRes?.data?.result) {
      checkNewMessages(chatRoomsRes.data.result);
    }
  }, [chatRoomsRes?.data?.result, checkNewMessages, enabled]);

  /**
   * Đánh dấu phòng chat hiện tại
   */
  const setActiveChatRoom = useCallback(
    (roomId: number | null) => {
      if (roomId !== null) {
        // Khi vào một phòng chat, đánh dấu là đã đọc
        dispatch(setCurrentChatRoom(roomId));
        dispatch(markChatRoomAsRead(roomId));
        // Lưu timestamp hiện tại để tránh notification của tin cũ
        dispatch(
          setLastSeenTimestamp({ roomId, timestamp: new Date().toISOString() }),
        );
      } else {
        // Khi rời khỏi phòng chat
        if (currentChatRoomId !== null) {
          // markChatRoomAsRead sẽ auto-clear notification + auto-hide
          dispatch(markChatRoomAsRead(currentChatRoomId));
          // Update lastSeenTimestamp để tránh notification cũ được tạo lại
          dispatch(
            setLastSeenTimestamp({
              roomId: currentChatRoomId,
              timestamp: new Date().toISOString(),
            }),
          );
        }
        dispatch(setCurrentChatRoom(null));
      }
    },
    [dispatch, currentChatRoomId],
  );

  /**
   * Xử lý khi người dùng bấm vào notification
   */
  const handleNotificationPress = useCallback(
    (roomId: number, callback?: () => void) => {
      // Đánh dấu phòng là đã đọc (auto clear + auto hide)
      dispatch(markChatRoomAsRead(roomId));

      // Gọi callback nếu có (để navigate)
      callback?.();
    },
    [dispatch],
  );

  return {
    setActiveChatRoom,
    handleNotificationPress,
    showNotification,
  };
};
