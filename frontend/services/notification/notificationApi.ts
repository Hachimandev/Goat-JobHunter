import { api } from "@/services/api";
import { buildSpringQuery } from "@/utils/buildSpringQuery";
import {
  LatestNotificationsResponse,
  MarkNotificationsAsSeenResponse,
  NotificationPaginationRequest,
  NotificationPaginationResponse
} from "@/services/notification/notificationType";
import { WebSocketNotificationService } from "@/services/socket/WebSocketNotificationService";

export const notificationApi = api.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getUsersNotifications: builder.query<
      NotificationPaginationResponse,
      NotificationPaginationRequest
    >({
      query: (params) => {
        const { params: queryParams } = buildSpringQuery({
          params,
          filterFields: [],
          textSearchFields: [],
          nestedArrayFields: {},
          defaultSort: "createdAt,desc"
        });

        return {
          url: "/users/me/notifications",
          method: "GET",
          params: queryParams
        };
      },
      providesTags: ["Notifications"]
    }),

    getLatestNotifications: builder.query<LatestNotificationsResponse, void>({
      query: () => ({
        url: "/users/me/notifications/latest",
        method: "GET"
      }),
      providesTags: ["Notifications"]
    }),

    markNotificationsAsSeen: builder.mutation<
      MarkNotificationsAsSeenResponse,
      number[]
    >({
      query: (data) => ({
        url: "/users/me/notifications",
        method: "PUT",
        data
      }),
      invalidatesTags: ["Notifications"]
    }),

    subscribeNotifications: builder.query<null, void>({
      queryFn: () => ({ data: null }),

      async onCacheEntryAdded(
        _,
        { cacheDataLoaded, cacheEntryRemoved, dispatch }
      ) {
        let wsService: WebSocketNotificationService | null = null;

        try {
          await cacheDataLoaded;
          wsService = new WebSocketNotificationService(dispatch);
          wsService.connect();
        } catch (error) {
          console.error("❌ STOMP setup failed:", error);
        }

        await cacheEntryRemoved;
        wsService?.disconnect();
      }
    })
  })
});

export const {
  useGetUsersNotificationsQuery,
  useGetLatestNotificationsQuery,
  useMarkNotificationsAsSeenMutation,
  useSubscribeNotificationsQuery
} = notificationApi;