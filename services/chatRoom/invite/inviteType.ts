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
  status: 'joined' | 'request_pending';
  requestId?: number | null;
};

export type GroupJoinRequestItem = {
  requestId: number;
  accountId: number;
  fullName: string;
  username: string;
  avatar: string | null;
  requestedAt: string;
};

export type GroupJoinRequestListResponse = IBackendRes<GroupJoinRequestItem[]>;

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
