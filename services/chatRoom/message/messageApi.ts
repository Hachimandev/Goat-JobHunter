import { api } from '@/services/api';
import { WebSocketMessageService } from '@/services/WebSocketMessageService';

let wsServiceInstance: WebSocketMessageService | null = null;
let isConnected = false;
const pendingSubscriptions: Set<number> = new Set();

export const messageApi = api.injectEndpoints({
  endpoints: (builder) => ({
    subscribeToMessages: builder.query<null, void>({
      queryFn: () => ({ data: null }),

      async onCacheEntryAdded(
        _,
        { cacheDataLoaded, cacheEntryRemoved, dispatch },
      ) {
        try {
          console.log("🔌 Setting up STOMP Message connection...");
          await cacheDataLoaded;

          wsServiceInstance = new WebSocketMessageService(dispatch, () => {
            // Callback khi connected
            isConnected = true;
            console.log(`📋 Processing ${pendingSubscriptions.size} pending subscriptions`);
            pendingSubscriptions.forEach((chatRoomId) => {
              wsServiceInstance?.subscribeToChatRoom(chatRoomId);
            });
            pendingSubscriptions.clear();
          });
          wsServiceInstance.connect();
        } catch (error) {
          console.error('❌ STOMP Message setup failed:', error);
        }

        await cacheEntryRemoved;
        isConnected = false;
        pendingSubscriptions.clear();
        wsServiceInstance?.disconnect();
        wsServiceInstance = null;
      },
    }),
  }),
});

export const {
  useSubscribeToMessagesQuery,
} = messageApi;

// Export functions để subscribe/unsubscribe từ component
export const subscribeToChatRoom = (chatRoomId: number) => {
  console.log(`📥 Request subscribe to chat room ${chatRoomId}, connected: ${isConnected}`);

  if (!isConnected || !wsServiceInstance) {
    console.log(`⏳ Adding chat room ${chatRoomId} to pending queue`);
    pendingSubscriptions.add(chatRoomId);
    return;
  }

  wsServiceInstance.subscribeToChatRoom(chatRoomId);
};

export const unsubscribeFromChatRoom = (chatRoomId: number) => {
  pendingSubscriptions.delete(chatRoomId);
  wsServiceInstance?.unsubscribeFromChatRoom(chatRoomId);
};