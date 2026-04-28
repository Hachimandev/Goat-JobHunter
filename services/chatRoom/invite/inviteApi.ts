import { api } from "@/services/api";
import type {
  InvitePreviewResponse,
  JoinByInviteRequest,
  JoinByInviteResponse,
} from "./inviteType";

export const inviteApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getInvitePreview: builder.query<InvitePreviewResponse, string>({
      query: (token) => ({
        url: `/chatrooms/invite-preview/${token}`,
        method: "GET",
      }),
      providesTags: (_, __, token) => [{ type: "ChatInvite", id: token }],
    }),
    joinByInvite: builder.mutation<JoinByInviteResponse, JoinByInviteRequest>({
      query: (data) => ({
        url: "/chatrooms/join-by-invite",
        method: "POST",
        data,
      }),
      invalidatesTags: [{ type: "ChatRoom", id: "LIST" }],
    }),
  }),
});

export const { useGetInvitePreviewQuery, useJoinByInviteMutation } = inviteApi;
