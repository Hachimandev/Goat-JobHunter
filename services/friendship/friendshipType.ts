import { IBackendRes } from "@/types/api";

export enum RelationshipState {
  FRIEND = "FRIEND",
  BLOCKED = "BLOCKED",
  NONE = "NONE",
}

export type FriendBlockActionPayload = {
  targetUserId: number;
};

export type PairSnapshot = {
  accountId: number;
  targetAccountId: number;
  relationshipState: RelationshipState;
  blockedByMe: boolean;
  blockedByOther: boolean;
};

export type BlockedUser = {
  accountId: number;
  fullName: string;
  username: string;
  email: string;
  avatar?: string;
  role?: {
    roleId: number;
    name: string;
  };
};

export type BlockUserRequest = {
  targetUserId: number;
};

export type BlockUserResponse = IBackendRes<PairSnapshot>;

export type UnblockUserRequest = {
  targetUserId: number;
};

export type UnblockUserResponse = IBackendRes<PairSnapshot>;

export type GetBlockedUsersResponse = IBackendRes<{
  content: BlockedUser[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
}>;

export type CheckPairStatusResponse = IBackendRes<PairSnapshot>;
