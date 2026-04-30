import { IBackendRes } from "@/types/api";

export type InvitePreviewPayload = {
  roomId: number;
  roomName: string;
  roomAvatar: string | null;
  inviteEnabled: boolean;
};

export type InvitePreviewResponse = IBackendRes<InvitePreviewPayload>;

export type JoinByInviteRequest = {
  inviteToken: string;
};

export type JoinByInvitePayload = {
  roomId: number;
  joined: boolean;
};

export type JoinByInviteResponse = IBackendRes<JoinByInvitePayload>;

export type InviteLinkPayload = {
  roomId: number;
  inviteToken: string;
  inviteLink: string;
  inviteEnabled: boolean;
  inviteRotatedAt: string | null;
};

export type InviteLinkResponse = IBackendRes<InviteLinkPayload>;

export type ToggleInviteRequest = {
  enabled: boolean;
};
