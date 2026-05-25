import { api } from "../api";
import type {
  CreateFriendRequestPayload,
  FriendRequestActionPayload,
  FriendRequestActionResponse,
  GetMyFriendshipsResponse,
  GetMyReceivedFriendRequestsResponse,
  GetMySentFriendRequestsResponse,
  BlockUserRequest,
  BlockUserResponse,
  UnblockUserRequest,
  UnblockUserResponse,
  GetBlockedUsersResponse,
  CheckPairStatusResponse,
} from "./friendshipType";

export const friendshipApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getMyFriendships: builder.query<
      GetMyFriendshipsResponse,
      { page?: number; size?: number }
    >({
      query: ({ page = 1, size = 20 }) => ({
        url: "/friend-requests/me",
        method: "GET",
        params: {
          page,
          size,
          sort: ["friendsSince,desc"],
        },
      }),
      providesTags: [{ type: "Friendship", id: "LIST" }],
    }),

    getMyReceivedFriendRequests: builder.query<
      GetMyReceivedFriendRequestsResponse,
      { page?: number; size?: number }
    >({
      query: ({ page = 1, size = 20 }) => ({
        url: "/friend-requests/me/received",
        method: "GET",
        params: {
          page,
          size,
          sort: ["requestedAt,desc"],
        },
      }),
      providesTags: [{ type: "FriendRequest", id: "RECEIVED" }],
    }),

    getMySentFriendRequests: builder.query<
      GetMySentFriendRequestsResponse,
      { page?: number; size?: number }
    >({
      query: ({ page = 1, size = 20 }) => ({
        url: "/friend-requests/me/sent",
        method: "GET",
        params: {
          page,
          size,
          sort: ["requestedAt,desc"],
        },
      }),
      providesTags: [{ type: "FriendRequest", id: "SENT" }],
    }),

    createFriendRequest: builder.mutation<
      FriendRequestActionResponse,
      CreateFriendRequestPayload
    >({
      query: ({ targetUserId }) => ({
        url: "/friend-requests",
        method: "POST",
        data: { targetUserId },
      }),
      invalidatesTags: [
        { type: "FriendRequest", id: "LIST" },
        { type: "FriendRequest", id: "RECEIVED" },
        { type: "FriendRequest", id: "SENT" },
      ],
    }),

    acceptFriendRequest: builder.mutation<
      FriendRequestActionResponse,
      FriendRequestActionPayload
    >({
      query: ({ requestId }) => ({
        url: `/friend-requests/${requestId}/accept`,
        method: "POST",
      }),
      invalidatesTags: [
        { type: "Friendship", id: "LIST" },
        { type: "FriendRequest", id: "RECEIVED" },
        { type: "FriendRequest", id: "SENT" },
      ],
    }),

    rejectFriendRequest: builder.mutation<
      FriendRequestActionResponse,
      FriendRequestActionPayload
    >({
      query: ({ requestId }) => ({
        url: `/friend-requests/${requestId}/reject`,
        method: "POST",
      }),
      invalidatesTags: [{ type: "FriendRequest", id: "RECEIVED" }],
    }),

    cancelFriendRequest: builder.mutation<
      FriendRequestActionResponse,
      FriendRequestActionPayload
    >({
      query: ({ requestId }) => ({
        url: `/friend-requests/${requestId}/cancel`,
        method: "POST",
      }),
      invalidatesTags: [{ type: "FriendRequest", id: "SENT" }],
    }),

    blockUser: builder.mutation<BlockUserResponse, BlockUserRequest>({
      query: ({ targetUserId }) => ({
        url: `/friend-requests/${targetUserId}/block`,
        method: "POST",
      }),
      invalidatesTags: [
        { type: "Friendship", id: "LIST" },
        { type: "Friendship", id: "BLOCKED_LIST" },
        { type: "FriendRequest", id: "LIST" },
        { type: "FriendRequest", id: "RECEIVED" },
        { type: "FriendRequest", id: "SENT" },
      ],
    }),

    unblockUser: builder.mutation<UnblockUserResponse, UnblockUserRequest>({
      query: ({ targetUserId }) => ({
        url: `/friend-requests/${targetUserId}/unblock`,
        method: "POST",
      }),
      invalidatesTags: [
        { type: "Friendship", id: "LIST" },
        { type: "Friendship", id: "BLOCKED_LIST" },
        { type: "FriendRequest", id: "LIST" },
        { type: "FriendRequest", id: "RECEIVED" },
        { type: "FriendRequest", id: "SENT" },
      ],
    }),

    getMyBlockedUsers: builder.query<
      GetBlockedUsersResponse,
      { page: number; size: number }
    >({
      query: ({ page, size }) => ({
        url: "/friend-requests/me/block",
        method: "GET",
        params: { page, size, sort: ["blockedSince,desc"] },
      }),
      providesTags: [{ type: "Friendship", id: "BLOCKED_LIST" }],
    }),

    checkPairStatus: builder.query<CheckPairStatusResponse, number>({
      query: (targetUserId) => ({
        url: `/friend-requests/pair-status/${targetUserId}`,
        method: "GET",
      }),
    }),
  }),
});

export const {
  useGetMyFriendshipsQuery,
  useGetMyReceivedFriendRequestsQuery,
  useGetMySentFriendRequestsQuery,
  useCreateFriendRequestMutation,
  useAcceptFriendRequestMutation,
  useRejectFriendRequestMutation,
  useCancelFriendRequestMutation,
  useBlockUserMutation,
  useUnblockUserMutation,
  useGetMyBlockedUsersQuery,
  useCheckPairStatusQuery,
} = friendshipApi;
