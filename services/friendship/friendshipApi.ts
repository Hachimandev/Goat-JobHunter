import {
  friendRequestAccepted,
  friendRequestCanceled,
  friendRequestCreated,
  friendRequestRejected,
  hydratePendingRequests,
  upsertPairSnapshot,
} from '@/lib/features/friendshipSlice';
import { api } from '@/services/api';
import type { RootState } from '@/lib/store';
import {
  CreateFriendRequestPayload,
  FriendRequest,
  FriendRequestActionPayload,
  FriendRequestActionResponse,
  FriendRequestStatus,
  GetFriendshipWithUserResponse,
  GetMyPendingFriendRequestsResponse,
  normalizeFriendRequest,
  normalizePairSnapshot,
  normalizePendingRequestsPayload,
} from '@/services/friendship/friendshipType';

const FRIEND_REQUEST_LIST_TAG_ID = 'LIST';

const toRecord = (value: unknown): Record<string, unknown> => {
  if (value && typeof value === 'object') {
    return value as Record<string, unknown>;
  }

  return {};
};

const unwrapResponseData = (value: unknown): unknown => {
  const source = toRecord(value);

  if ('data' in source && source.data !== undefined && source.data !== null) {
    return source.data;
  }

  return value;
};

const getCurrentUserId = (state: RootState): number | null => {
  const accountId = state.auth.user?.accountId;
  return typeof accountId === 'number' && accountId > 0 ? accountId : null;
};

const buildRequestWithStatus = (
  request: FriendRequest | undefined,
  status: FriendRequestStatus,
  fallbackRequestId: number,
): FriendRequest | null => {
  if (!request) {
    return null;
  }

  return {
    ...request,
    requestId: request.requestId || fallbackRequestId,
    status,
    updatedAt: request.updatedAt ?? new Date().toISOString(),
  };
};

export const friendshipApi = api.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getFriendshipWithUser: builder.query<GetFriendshipWithUserResponse, number>({
      query: (targetAccountId) => ({
        url: `/user-relationships/me/${targetAccountId}`,
        method: 'GET',
      }),
      providesTags: (_result, _error, targetAccountId) => [
        { type: 'Friendship', id: targetAccountId },
        { type: 'FriendRequest', id: targetAccountId },
      ],
      async onQueryStarted(targetAccountId, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          const snapshot = normalizePairSnapshot(unwrapResponseData(data), targetAccountId);

          if (snapshot) {
            dispatch(upsertPairSnapshot(snapshot));
          }
        } catch (error) {
          console.error('Failed to fetch friendship status:', error);
        }
      },
    }),

    getMyPendingFriendRequests: builder.query<GetMyPendingFriendRequestsResponse, void>({
      query: () => ({
        url: '/friend-requests/me/pending',
        method: 'GET',
      }),
      providesTags: [{ type: 'FriendRequest', id: FRIEND_REQUEST_LIST_TAG_ID }],
      async onQueryStarted(_, { dispatch, getState, queryFulfilled }) {
        const currentUserId = getCurrentUserId(getState() as RootState);

        if (!currentUserId) {
          return;
        }

        try {
          const { data } = await queryFulfilled;
          const pending = normalizePendingRequestsPayload(unwrapResponseData(data), currentUserId);

          dispatch(
            hydratePendingRequests({
              currentUserId,
              incoming: pending.incoming,
              outgoing: pending.outgoing,
              emittedAt: new Date().toISOString(),
            }),
          );
        } catch (error) {
          console.error('Failed to hydrate pending friend requests:', error);
        }
      },
    }),

    createFriendRequest: builder.mutation<FriendRequestActionResponse, CreateFriendRequestPayload>({
      query: (payload) => ({
        url: '/friend-requests',
        method: 'POST',
        data: payload,
      }),
      invalidatesTags: (_result, _error, payload) => [
        { type: 'FriendRequest', id: payload.targetUserId },
        { type: 'Friendship', id: payload.targetUserId },
        { type: 'FriendRequest', id: FRIEND_REQUEST_LIST_TAG_ID },
      ],
      async onQueryStarted(payload, { dispatch, getState, queryFulfilled }) {
        const currentUserId = getCurrentUserId(getState() as RootState);

        if (!currentUserId) {
          return;
        }

        try {
          const { data } = await queryFulfilled;
          const request = normalizeFriendRequest(unwrapResponseData(data));

          if (!request) {
            return;
          }

          dispatch(
            friendRequestCreated({
              currentUserId,
              request,
              emittedAt: new Date().toISOString(),
            }),
          );
        } catch (error) {
          console.error('Create friend request failed:', error);
        }
      },
    }),

    acceptFriendRequest: builder.mutation<FriendRequestActionResponse, FriendRequestActionPayload>({
      query: ({ requestId }) => ({
        url: `/friend-requests/${requestId}/accept`,
        method: 'POST',
      }),
      invalidatesTags: [{ type: 'FriendRequest', id: FRIEND_REQUEST_LIST_TAG_ID }],
      async onQueryStarted({ requestId }, { dispatch, getState, queryFulfilled }) {
        const state = getState() as RootState;
        const currentUserId = getCurrentUserId(state);

        if (!currentUserId) {
          return;
        }

        try {
          const { data } = await queryFulfilled;
          const responseRequest = normalizeFriendRequest(unwrapResponseData(data));
          const existingRequest = state.friendship.requestsById[String(requestId)];

          const request = buildRequestWithStatus(
            responseRequest ?? existingRequest,
            FriendRequestStatus.ACCEPTED,
            requestId,
          );

          if (!request) {
            return;
          }

          dispatch(
            friendRequestAccepted({
              currentUserId,
              request,
              emittedAt: new Date().toISOString(),
              friendsSince: request.updatedAt,
            }),
          );
        } catch (error) {
          console.error('Accept friend request failed:', error);
        }
      },
    }),

    rejectFriendRequest: builder.mutation<FriendRequestActionResponse, FriendRequestActionPayload>({
      query: ({ requestId }) => ({
        url: `/friend-requests/${requestId}/reject`,
        method: 'POST',
      }),
      invalidatesTags: [{ type: 'FriendRequest', id: FRIEND_REQUEST_LIST_TAG_ID }],
      async onQueryStarted({ requestId }, { dispatch, getState, queryFulfilled }) {
        const state = getState() as RootState;
        const currentUserId = getCurrentUserId(state);

        if (!currentUserId) {
          return;
        }

        try {
          const { data } = await queryFulfilled;
          const responseRequest = normalizeFriendRequest(unwrapResponseData(data));
          const existingRequest = state.friendship.requestsById[String(requestId)];

          const request = buildRequestWithStatus(
            responseRequest ?? existingRequest,
            FriendRequestStatus.REJECTED,
            requestId,
          );

          if (!request) {
            return;
          }

          dispatch(
            friendRequestRejected({
              currentUserId,
              request,
              emittedAt: new Date().toISOString(),
            }),
          );
        } catch (error) {
          console.error('Reject friend request failed:', error);
        }
      },
    }),

    cancelFriendRequest: builder.mutation<FriendRequestActionResponse, FriendRequestActionPayload>({
      query: ({ requestId }) => ({
        url: `/friend-requests/${requestId}/cancel`,
        method: 'POST',
      }),
      invalidatesTags: [{ type: 'FriendRequest', id: FRIEND_REQUEST_LIST_TAG_ID }],
      async onQueryStarted({ requestId }, { dispatch, getState, queryFulfilled }) {
        const state = getState() as RootState;
        const currentUserId = getCurrentUserId(state);

        if (!currentUserId) {
          return;
        }

        try {
          const { data } = await queryFulfilled;
          const responseRequest = normalizeFriendRequest(unwrapResponseData(data));
          const existingRequest = state.friendship.requestsById[String(requestId)];

          const request = buildRequestWithStatus(
            responseRequest ?? existingRequest,
            FriendRequestStatus.CANCELED,
            requestId,
          );

          if (!request) {
            return;
          }

          dispatch(
            friendRequestCanceled({
              currentUserId,
              request,
              emittedAt: new Date().toISOString(),
            }),
          );
        } catch (error) {
          console.error('Cancel friend request failed:', error);
        }
      },
    }),
  }),
});

export const {
  useGetFriendshipWithUserQuery,
  useLazyGetFriendshipWithUserQuery,
  useGetMyPendingFriendRequestsQuery,
  useCreateFriendRequestMutation,
  useAcceptFriendRequestMutation,
  useRejectFriendRequestMutation,
  useCancelFriendRequestMutation,
} = friendshipApi;
