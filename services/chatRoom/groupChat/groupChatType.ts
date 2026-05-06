import { IBackendRes } from '@/types/api';
import { ChatRoomPrivacy } from '@/types/enum';

export const ChatRole = {
  OWNER: 'OWNER',
  MODERATOR: 'MODERATOR',
  MEMBER: 'MEMBER',
} as const;

export type ChatRole = (typeof ChatRole)[keyof typeof ChatRole];

export type ChatRoomPermissionSettings = {
  allowMemberUpdate: boolean;
  allowMemberPin: boolean;
  allowMemberCreateVote: boolean;
  allowMemberSendMessage: boolean;
  allowModeratorSendMessage: boolean;
};

export type ChatRoomPermissionField = keyof ChatRoomPermissionSettings;

export interface CreateGroupChatRequest {
  accountIds: number[];
  name: string;
  avatar: string;
}

export interface UpdateGroupInfoRequest {
  name?: string;
  avatar?: string;
  privacy?: ChatRoomPrivacy;
}

export interface AddMemberRequest {
  accountId: number;
}

export interface UpdateMemberRoleRequest {
  role: ChatRole;
}

export interface ChatRoomResponse extends ChatRoomPermissionSettings {
  aiModel: string | null;
  avatar: string;
  createdAt: string;
  createdBy: string;
  deletedAt: string | null;
  deleteBy: string | null;
  name: string;
  roomId: number;
  type: 'GROUP';
  privacy: ChatRoomPrivacy;
  updatedAt: string;
  updatedBy: string;
}

export interface ChatMemberResponse {
  accountId: number;
  avatar: string;
  chatMemberId: number;
  fullName: string;
  email: string;
  joinedAt: string;
  role: ChatRole;
  username: string;
}

export type GetGroupPermissionsResponse = IBackendRes<ChatRoomPermissionSettings>;

export type UpdateGroupPermissionsRequest = {
  chatRoomId: number;
} & ChatRoomPermissionSettings;

export type UpdateGroupPermissionsResponse = IBackendRes<ChatRoomPermissionSettings>;
