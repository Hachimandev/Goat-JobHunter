import { api } from "../api";
import type {
  BlockUserRequest,
  BlockUserResponse,
  UnblockUserRequest,
  UnblockUserResponse,
  GetBlockedUsersResponse,
  CheckPairStatusResponse,
} from "./friendshipType";

export const friendshipApi = api.injectEndpoints({
  endpoints: (builder) => ({
    blockUser: builder.mutation<BlockUserResponse, BlockUserRequest>({
      query: ({ targetUserId }) => ({
        url: `/friend-requests/${targetUserId}/block`,
        method: "POST",
      }),
      invalidatesTags: ["ChatRoom"],
    }),

    unblockUser: builder.mutation<UnblockUserResponse, UnblockUserRequest>({
      query: ({ targetUserId }) => ({
        url: `/friend-requests/${targetUserId}/unblock`,
        method: "POST",
      }),
      invalidatesTags: ["ChatRoom"],
    }),

    getMyBlockedUsers: builder.query<
      GetBlockedUsersResponse,
      { page: number; size: number }
    >({
      query: ({ page, size }) => ({
        url: `/friend-requests/me/blocked?page=${page}&size=${size}`,
        method: "GET",
      }),
      providesTags: ["ChatRoom"],
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
  useBlockUserMutation,
  useUnblockUserMutation,
  useGetMyBlockedUsersQuery,
  useCheckPairStatusQuery,
} = friendshipApi;
