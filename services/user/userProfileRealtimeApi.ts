import { WebSocketUserProfileService } from '@/services/WebSocketUserProfileService';
import { api } from '@/services/api';

export const userProfileRealtimeApi = api.injectEndpoints({
  endpoints: (builder) => ({
    subscribeUserProfileUpdates: builder.query<null, void>({
      queryFn: () => ({ data: null }),

      async onCacheEntryAdded(_, { cacheDataLoaded, cacheEntryRemoved, dispatch }) {
        let wsService: WebSocketUserProfileService | null = null;

        try {
          await cacheDataLoaded;
          wsService = new WebSocketUserProfileService(dispatch);
          wsService.connect();
        } catch (error) {
          console.error('❌ STOMP Profile setup failed:', error);
        }

        await cacheEntryRemoved;
        wsService?.disconnect();
      },
    }),
  }),
});

export const { useSubscribeUserProfileUpdatesQuery } = userProfileRealtimeApi;
