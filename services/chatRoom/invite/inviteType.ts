import { IBackendRes } from '@/types/api';
import { ChatRoomPrivacy } from '@/types/enum';

export type InviteLinkPayload = {
  roomId: number;
  inviteToken: string;
  inviteLink: string;
  inviteEnabled: boolean;
  inviteRotatedAt: string | null;
  privacy: ChatRoomPrivacy;
};

export type JoinByInvitePayload = {
  roomId: number;
  joined: boolean;
};

export type ToggleInviteRequest = {
  enabled: boolean;
};

export type JoinByInviteRequest = {
  inviteToken: string;
};

export type InvitePreviewPayload = {
  roomId: number;
  roomName: string;
  roomAvatar: string | null;
  inviteEnabled: boolean;
  privacy: ChatRoomPrivacy;
};

export type InviteLinkResponse = IBackendRes<InviteLinkPayload>;
export type JoinByInviteResponse = IBackendRes<JoinByInvitePayload>;
export type InvitePreviewResponse = IBackendRes<InvitePreviewPayload>;
