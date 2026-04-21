import { api } from '@/services/api';
import { WebSocketCallService } from '@/services/socket/WebSocketCallService';

export const callRealtimeApi = api.injectEndpoints({
  endpoints: (builder) => ({
    subscribeCallEvents: builder.query<null, void>({
      queryFn: () => ({ data: null }),
      async onCacheEntryAdded(_, { cacheDataLoaded, cacheEntryRemoved, dispatch }) {
        let wsService: WebSocketCallService | null = null;

        try {
          await cacheDataLoaded;
          wsService = new WebSocketCallService(dispatch);
          wsService.connect();
        } catch (error) {
          console.error('❌ STOMP Call setup failed:', error);
        }

        await cacheEntryRemoved;
        wsService?.disconnect();
      },
    }),
  }),
});

export const { useSubscribeCallEventsQuery } = callRealtimeApi;
