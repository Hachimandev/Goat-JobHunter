import { api } from "@/services/api";
import type {
  InviteLinkResponse,
  InvitePreviewResponse,
  JoinByInviteRequest,
  JoinByInviteResponse,
  ToggleInviteRequest,
} from "./inviteType";

export const inviteApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getInviteLink: builder.query<InviteLinkResponse, number>({
      query: (roomId) => ({
        url: `/chatrooms/${roomId}/invite-link`,
        method: "GET",
      }),
      providesTags: (_, __, roomId) => [
        { type: "ChatRoom", id: roomId },
        { type: "ChatInvite", id: roomId },
      ],
    }),
    getInvitePreview: builder.query<InvitePreviewResponse, string>({
      query: (token) => ({
        url: `/chatrooms/invite-preview/${token}`,
        method: "GET",
      }),
      providesTags: (_, __, token) => [{ type: "ChatInvite", id: token }],
    }),
    rotateInviteLink: builder.mutation<InviteLinkResponse, number>({
      query: (roomId) => ({
        url: `/chatrooms/${roomId}/invite-link/rotate`,
        method: "POST",
      }),
      invalidatesTags: (_, __, roomId) => [{ type: "ChatInvite", id: roomId }],
    }),
    toggleInviteLink: builder.mutation<
      InviteLinkResponse,
      { roomId: number } & ToggleInviteRequest
    >({
      query: ({ roomId, ...data }) => ({
        url: `/chatrooms/${roomId}/invite-link/toggle`,
        method: "POST",
        data,
      }),
      invalidatesTags: (_, __, { roomId }) => [
        { type: "ChatInvite", id: roomId },
      ],
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

export const {
  useGetInviteLinkQuery,
  useGetInvitePreviewQuery,
  useRotateInviteLinkMutation,
  useToggleInviteLinkMutation,
  useJoinByInviteMutation,
} = inviteApi;
