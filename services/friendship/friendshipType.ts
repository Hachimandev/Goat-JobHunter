import { IBackendRes } from '@/types/api';

export type FriendshipEventType =
  | 'FRIEND_REQUEST_CREATED'
  | 'FRIEND_REQUEST_ACCEPTED'
  | 'FRIEND_REQUEST_REJECTED'
  | 'FRIEND_REQUEST_CANCELED';

export enum FriendRequestStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  CANCELED = 'CANCELED',
  EXPIRED = 'EXPIRED',
}

export enum UserRelationshipStatus {
  NONE = 'NONE',
  FRIEND = 'FRIEND',
  BLOCKED = 'BLOCKED',
}

export enum FriendshipUiState {
  NOT_FRIEND = 'NOT_FRIEND',
  PENDING_SENT = 'PENDING_SENT',
  PENDING_RECEIVED = 'PENDING_RECEIVED',
  FRIEND = 'FRIEND',
  BLOCKED = 'BLOCKED',
}

export enum FriendRequestDirection {
  INCOMING = 'INCOMING',
  OUTGOING = 'OUTGOING',
}

export type FriendUserSummary = {
  accountId: number;
  displayName?: string;
  fullName?: string;
  username?: string;
  avatar?: string;
  visibility?: string | null;
};

export type FriendRequest = {
  requestId: number;
  requesterId: number;
  recipientId: number;
  status: FriendRequestStatus;
  createdAt?: string;
  updatedAt?: string;
  expiresAt?: string;
  requester?: FriendUserSummary;
  recipient?: FriendUserSummary;
};

export type PairFriendshipSnapshot = {
  targetAccountId: number;
  targetUser?: FriendUserSummary;
  relationshipStatus: UserRelationshipStatus;
  friendsSince?: string | null;
  blockedByMe: boolean;
  blockedByOther: boolean;
  pendingIncomingRequest?: FriendRequest | null;
  pendingOutgoingRequest?: FriendRequest | null;
  emittedAt?: string;
};

export type PendingFriendRequestsSnapshot = {
  incoming: FriendRequest[];
  outgoing: FriendRequest[];
};

export type CreateFriendRequestPayload = {
  targetUserId: number;
};

export type FriendRequestActionPayload = {
  requestId: number;
};

export type GetMyFriendshipsResponse =
  | IBackendRes<PairFriendshipSnapshot[] | PairFriendshipSnapshot | Record<string, unknown> | unknown[]>
  | PairFriendshipSnapshot[]
  | PairFriendshipSnapshot
  | Record<string, unknown>;

export type GetMyReceivedFriendRequestsResponse =
  | IBackendRes<FriendRequest[] | FriendRequest | Record<string, unknown> | unknown[]>
  | FriendRequest[]
  | FriendRequest
  | Record<string, unknown>;

export type GetMySentFriendRequestsResponse =
  | IBackendRes<FriendRequest[] | FriendRequest | Record<string, unknown> | unknown[]>
  | FriendRequest[]
  | FriendRequest
  | Record<string, unknown>;

// Backward-compatible aliases while call sites migrate to dedicated read endpoints.
export type GetFriendshipWithUserResponse = GetMyFriendshipsResponse;
export type GetMyPendingFriendRequestsResponse =
  | IBackendRes<PendingFriendRequestsSnapshot | FriendRequest[] | Record<string, unknown>>
  | PendingFriendRequestsSnapshot
  | FriendRequest[]
  | Record<string, unknown>;

export type FriendRequestActionResponse =
  | IBackendRes<FriendRequest | Record<string, unknown> | null>
  | FriendRequest
  | Record<string, unknown>
  | null;
