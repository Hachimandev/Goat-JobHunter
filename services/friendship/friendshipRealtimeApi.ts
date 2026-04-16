import { WebSocketFriendshipService } from '@/services/socket/WebSocketFriendshipService';
import { api } from '@/services/api';

export const friendshipRealtimeApi = api.injectEndpoints({
  endpoints: (builder) => ({
    subscribeFriendshipEvents: builder.query<null, void>({
      queryFn: () => ({ data: null }),

      async onCacheEntryAdded(_, { cacheDataLoaded, cacheEntryRemoved, dispatch }) {
        let wsService: WebSocketFriendshipService | null = null;

        try {
          await cacheDataLoaded;
          wsService = new WebSocketFriendshipService(dispatch);
          wsService.connect();
        } catch (error) {
          console.error('❌ STOMP Friendship setup failed:', error);
        }

        await cacheEntryRemoved;
        wsService?.disconnect();
      },
    }),
  }),
});

export const { useSubscribeFriendshipEventsQuery } = friendshipRealtimeApi;
