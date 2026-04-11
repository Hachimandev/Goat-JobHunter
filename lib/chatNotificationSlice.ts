import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface UnreadMessage {
  roomId: number;
  senderName: string;
  messagePreview: string;
  timestamp: string;
  senderAvatar?: string;
}

export interface ChatNotificationState {
  unreadCounts: Record<number, number>; // roomId -> unread count
  pendingNotifications: UnreadMessage[]; // Thông báo chưa được đọc
  currentChatRoomId: number | null; // Phòng chat hiện tại đang mở
  showNotification: boolean;
  lastSeenTimestamps: Record<number, string>; // roomId -> lastSeenTime (để tránh notification cũ)
}

const initialState: ChatNotificationState = {
  unreadCounts: {},
  pendingNotifications: [],
  currentChatRoomId: null,
  showNotification: false,
  lastSeenTimestamps: {},
};

const chatNotificationSlice = createSlice({
  name: "chatNotification",
  initialState,
  reducers: {
    // Set phòng chat hiện tại
    setCurrentChatRoom: (state, action: PayloadAction<number | null>) => {
      state.currentChatRoomId = action.payload;
    },

    // Nhận tin nhắn mới
    receiveNewMessage: (
      state,
      action: PayloadAction<{
        roomId: number;
        senderName: string;
        messagePreview: string;
        timestamp: string;
        senderAvatar?: string;
      }>,
    ) => {
      const { roomId, senderName, messagePreview, timestamp, senderAvatar } =
        action.payload;

      // Kiểm tra xem tin này là cũ hay mới so với lần cuối user xem
      const lastSeenTime = state.lastSeenTimestamps[roomId];
      if (lastSeenTime && new Date(timestamp) <= new Date(lastSeenTime)) {
        // Đây là tin cũ, không tạo notification
        return;
      }

      // Nếu đang ở phòng này, không tăng unread count
      if (state.currentChatRoomId !== roomId) {
        state.unreadCounts[roomId] = (state.unreadCounts[roomId] || 0) + 1;

        // Thêm notification
        state.pendingNotifications.push({
          roomId,
          senderName,
          messagePreview,
          timestamp,
          senderAvatar,
        });

        state.showNotification = true;
      }
    },

    // Đánh dấu tin nhắn trong phòng là đã đọc
    markChatRoomAsRead: (state, action: PayloadAction<number>) => {
      const roomId = action.payload;
      state.unreadCounts[roomId] = 0;
      state.pendingNotifications = state.pendingNotifications.filter(
        (n) => n.roomId !== roomId,
      );
      // Nếu không còn notification nào, ẩn toast
      if (state.pendingNotifications.length === 0) {
        state.showNotification = false;
      }
    },

    // Xóa một notification
    removeNotification: (state, action: PayloadAction<number>) => {
      const roomId = action.payload;
      state.pendingNotifications = state.pendingNotifications.filter(
        (n) => n.roomId !== roomId,
      );
      // Nếu không còn notification nào, ẩn toast
      if (state.pendingNotifications.length === 0) {
        state.showNotification = false;
      }
    },

    // Ẩn notification
    hideNotification: (state) => {
      state.showNotification = false;
    },

    // Reset toàn bộ
    resetChatNotifications: (state) => {
      state.unreadCounts = {};
      state.pendingNotifications = [];
      state.currentChatRoomId = null;
      state.showNotification = false;
    },

    // Cập nhật unread count cho một phòng
    setUnreadCount: (
      state,
      action: PayloadAction<{ roomId: number; count: number }>,
    ) => {
      const { roomId, count } = action.payload;
      state.unreadCounts[roomId] = count;
    },

    // Lưu timestamp cuối cùng của phòng mà user đã xem
    setLastSeenTimestamp: (
      state,
      action: PayloadAction<{ roomId: number; timestamp: string }>,
    ) => {
      const { roomId, timestamp } = action.payload;
      state.lastSeenTimestamps[roomId] = timestamp;
    },

    // Xóa badge unread count nhưng giữ lại notification toast
    // (call khi notification hiển thị để badge biến mất ngay)
    clearUnreadCountOnly: (state, action: PayloadAction<number>) => {
      const roomId = action.payload;
      state.unreadCounts[roomId] = 0;
    },
  },
});

export const {
  setCurrentChatRoom,
  receiveNewMessage,
  markChatRoomAsRead,
  removeNotification,
  hideNotification,
  resetChatNotifications,
  setUnreadCount,
  setLastSeenTimestamp,
  clearUnreadCountOnly,
} = chatNotificationSlice.actions;

export default chatNotificationSlice.reducer;
