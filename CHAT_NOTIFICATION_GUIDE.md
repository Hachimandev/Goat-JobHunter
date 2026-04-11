# 📱 Chat Notification System - Hướng dẫn triển khai

## Tổng quan chức năng

Hệ thống thông báo chat được xây dựng với các tính năng sau:

### ✅ Yêu cầu đã hoàn thành

1. **Khi người dùng ở Chat A** nhận tin nhắn từ Chat B:
   - ✅ Hiển thị toast notification với tên người gửi và preview tin nhắn
   - ✅ KHÔNG tự động chuyển sang Chat B
   - ✅ Cập nhật số lượng tin nhắn chưa đọc
   - ✅ Cập nhật danh sách cuộc trò chuyện với badge unread count

2. **Khi người dùng bấm vào notification**:
   - ✅ Tự động chuyển sang Chat B (navigate)

3. **Khi người dùng ở đúng cuộc trò chuyện**:
   - ✅ KHÔNG hiển thị notification
   - ✅ Hiển thị tin nhắn ngay lập tức (via polling interval 5s)
   - ✅ Tự động đánh dấu tin nhắn là đã đọc

---

## Kiến trúc hệ thống

### 1. **Redux State Management** (`lib/chatNotificationSlice.ts`)

Quản lý toàn bộ trạng thái thông báo:

- `unreadCounts`: Số tin nhắn chưa đọc của mỗi phòng chat
- `pendingNotifications`: Danh sách notification chưa được hiển thị
- `currentChatRoomId`: ID phòng chat hiện tại
- `showNotification`: Flag để show/hide toast

**Actions:**

```typescript
- setCurrentChatRoom(roomId)      // Set phòng chat đang mở
- receiveNewMessage(...)           // Nhận tin nhắn mới
- markChatRoomAsRead(roomId)       // Đánh dấu phòng là đã đọc
- removeNotification(roomId)       // Xóa notification
- hideNotification()               // Ẩn toast
- setUnreadCount({roomId, count})  // Cập nhật unread count
```

---

### 2. **Notification Toast Component** (`components/common/ChatNotificationToast.tsx`)

UI component animate slide-down từ top

**Props:**

```typescript
visible: boolean                    // Hiển thị hay ẩn
senderName: string                 // Tên người gửi
messagePreview: string             // Nội dung tin nhắn (preview)
senderAvatar?: string              // URL avatar (optional)
onPress: () => void                // Callback khi bấm
onDismiss: () => void              // Callback khi ẩn
duration?: number                  // Tự động ẩn sau N ms (default 5000ms)
```

**Tính năng:**

- Animate slide từ top khi appear
- Dismiss tự động sau 5 giây
- Có button close để dismiss thủ công
- Hiển thị avatar người gửi

---

### 3. **Notification Hook** (`hooks/useNotificationManager.ts`)

Hook quản lý logic chính

**API:**

```typescript
const {
  setActiveChatRoom, // Set phòng hiện tại (gọi khi vào/rời chat)
  handleNotificationPress, // Xử lý khi bấm notification
  dismissNotification, // Ẩn toast
  showNotification, // State showing or not
} = useNotificationManager({
  enabled: true, // Enable/disable
  checkInterval: 5000, // Polling interval (ms)
});
```

**Logic:**

- Kiểm tra chat list mỗi 5 giây
- So sánh `lastMessageTime` để detect tin nhắn mới
- Nếu `currentChatRoomId` !== `roomId` → hiển thị notification
- Nếu `currentChatRoomId` === `roomId` → không hiển thị (user đã thấy tin nhắn)
- Cache processed notifications để không spam

---

### 4. **Notification Provider** (`components/notification/NotificationProvider.tsx`)

Root level component để render toast

```typescript
<NotificationProvider />
```

Được đặt trong `app/_layout.tsx` để:

- Luôn active > toàn bộ app
- Render bên ngoài Stack navigation
- Auto trigger dựa vào Redux state

---

## Luồng dữ liệu

### Scenario 1: User ở Chat A, nhận tin nhắn từ Chat B

```
┌─────────────────────────────────────────────────────────────┐
│ 1. useFetchChatRoomsQuery polling mỗi 5s                    │
│    → Backend return chat list với lastMessageTime cập nhật   │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. useNotificationManager.checkNewMessages()                │
│    → Phát hiện lastMessageTime Chat B khác                  │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. dispatch(receiveNewMessage({roomId, senderName, ...}))  │
│    → Redux action só lưu vào pendingNotifications[]          │
│    → unreadCounts[roomB]++                                   │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. NotificationProvider nhận state change                    │
│    → Render <ChatNotificationToast visible={true} />        │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. ChatListScreen nhận unreadCounts[roomB] > 0              │
│    → Render red badge với số unread                         │
└─────────────────────────────────────────────────────────────┘
```

### Scenario 2: User bấm vào Toast Notification

```
┌─────────────────────────────────────────────────────────────┐
│ User bấm vào toast                                          │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ NotificationProvider.handleNotificationPress()             │
│ → router.push("/chat/[id]", {id: roomB, name: ...})       │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ ChatDetail(roomB) mount                                     │
│ → useNotificationManager().setActiveChatRoom(roomB)         │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ dispatch(setCurrentChatRoom(roomB))                         │
│ dispatch(markChatRoomAsRead(roomB))                         │
│ → unreadCounts[roomB] = 0                                   │
│ → toast ẩn                                                  │
│ → badge remove từ list                                      │
└─────────────────────────────────────────────────────────────┘
```

### Scenario 3: User ở Chat A (currentChatRoomId = A), tin nhắn mới từ Chat A

```
┌─────────────────────────────────────────────────────────────┐
│ checkNewMessages() phát hiện tin nhắn mới từ Chat A         │
│ NHƯNG currentChatRoomId === A (user đang ở đó)             │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ Condition check trong useNotificationManager:               │
│ if (room.roomId === currentChatRoomId) return; // SKIP      │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ ✅ Toast NOT rendered                                       │
│ ✅ tin nhắn vẫn hiển thị real-time via polling              │
│ ✅ FlatList auto-update mỗi 5s                              │
└─────────────────────────────────────────────────────────────┘
```

---

## File thay đổi / Tạo mới

### ✅ Files Created:

```
lib/chatNotificationSlice.ts                    // Redux slice
components/common/ChatNotificationToast.tsx     // Toast UI
hooks/useNotificationManager.ts                 // Hook logic
components/notification/NotificationProvider.tsx // Provider
```

### ✅ Files Modified:

```
lib/store.ts                    // Add chatNotification reducer
app/_layout.tsx                 // Add NotificationProvider + hook
app/chat/[id].tsx              // Add setActiveChatRoom on mount
app/(tabs)/chat.tsx            // Add unread badge display
```

---

## Cách dùng

### Trong Chat Detail Screen

```typescript
import { useNotificationManager } from "@/hooks/useNotificationManager";

export default function ChatDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const chatRoomId = Number(id);
  const { setActiveChatRoom } = useNotificationManager();

  // Set khi mở chat
  useEffect(() => {
    setActiveChatRoom(chatRoomId);
    return () => setActiveChatRoom(null); // Clean khi rời
  }, [chatRoomId, setActiveChatRoom]);
}
```

### Trong Other Screens (nếu cần)

```typescript
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { removeNotification } from "@/lib/chatNotificationSlice";

export default function MyScreen() {
  const dispatch = useAppDispatch();
  const { unreadCounts } = useAppSelector((s) => s.chatNotification);

  // Access unread count
  const totalUnread = Object.values(unreadCounts).reduce((a, b) => a + b, 0);

  // Manually remove notification
  const handleRemoveNotif = (roomId: number) => {
    dispatch(removeNotification(roomId));
  };
}
```

---

## Debug Tips

### 1. Kiểm tra Redux State

```typescript
import { useAppSelector } from "@/lib/hooks";

export default function DebugScreen() {
  const state = useAppSelector(s => s.chatNotification);
  console.log("Chat Notification State:", state);

  return <Text>{JSON.stringify(state, null, 2)}</Text>;
}
```

### 2. Kiểm tra Polling

```typescript
// Trong ChatDetail, xem console
const { data: messagesData } = useFetchMessagesInChatRoomQuery(
  { chatRoomId, size: 50, page: 0 },
  { skip: !chatRoomId, pollingInterval: 5000 },
);

console.log("Messages poll:", messagesData?.data);
```

### 3. Kiểm tra Toast Render

- Thêm `console.log` trong `NotificationProvider`
- Kiểm tra Redux `showNotification` flag
- Kiểm tra `pendingNotifications` array

---

## Tối ưu hóa (Optional)

### 1. WebSocket Real-time (improve latency)

Thay vì polling 5s, có thể thêm Socket.IO:

```typescript
// Thêm socket listener vào useNotificationManager
socket.on("message:new", (data) => {
  dispatch(receiveNewMessage(data));
});
```

### 2. Read Receipts

Thêm API call khi user đọc tin nhắn:

```typescript
await markMessagesAsReadMutation({ chatRoomId, messageIds: [...] });
```

### 3. Badge Count trên App Icon

Dùng `react-native-badge-notification` package

### 4. Sound + Vibration

```typescript
import { Audio } from "expo-av";
import ReactNativeHapticFeedback from "react-native-haptic-feedback";

// Trong ChatNotificationToast
useEffect(() => {
  // Play sound
  const sound = new Audio.Sound();
  await sound.loadAsync(require("..."));
  await sound.playAsync();

  // Vibrate
  ReactNativeHapticFeedback.trigger("impactHeavy");
}, [visible]);
```

---

## Troubleshooting

### Toast không hiển thị

- ✅ Kiểm tra `NotificationProvider` có render trong `app/_layout.tsx`
- ✅ Kiểm tra Redux state có `showNotification: true`
- ✅ Kiểm tra `currentChatRoomId` khác với tin nhắn từ roomId

### Unread badge không update

- ✅ Kiểm tra `useFetchChatRoomsQuery` có polling
- ✅ Kiểm tra Redux `unreadCounts` có được update
- ✅ Kiểm tra `useAppSelector` có connect đúng selector

### Notification spam

- ✅ Cache mechanism `processedNotificationsRef` phải work
- ✅ Notification key (`${roomId}_${lastMessageTime}`) phải unique

---

## Test Plan

### Manual Test Steps

**Test 1: Notification Toast**

1. Mở App trên Device A (tài khoản A)
2. Vào Chat 1
3. Trên Device B (tài khoản B), gửi tin nhắn tới A trong Chat 2
4. ✅ Kiểm tra toast hiển thị trên Device A
5. ✅ Kiểm tra badge số 1 trên Chat 2 trong danh sách
6. ✅ Kiểm tra toast auto-dismiss sau 5s

**Test 2: Notification Click**

1. Bấm vào toast notification
2. ✅ Auto navigate tới Chat 2
3. ✅ Toast ẩn
4. ✅ Badge remove

**Test 3: Same Chat Room**

1. Mở Chat 1
2. Device B gửi tin nhắn tới Chat 1
3. ✅ Toast KHÔNG hiển thị
4. ✅ Tin nhắn hiển thị realtime sau 5s (polling)
5. ✅ KHÔNG có badge

**Test 4: Multiple Chats**

1. Nhận tin nhắn từ 3-5 Chat khác nhau
2. ✅ Mỗi Chat có badge riêng
3. ✅ Total unread count cộng lại đúng

---

## Support & Questions

Các tính năng này được xây dựng dựa trên:

- Redux Toolkit (state management)
- React Query + RTK Query (data fetching + polling)
- Expo Router (navigation)
- React Native (UI)

Hãy cho feedback nếu có vấn đề! 🚀
