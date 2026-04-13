import { IBackendRes, IModelPaginate } from '@/types/api';

export const FRIENDSHIP_DEFAULT_PAGE = 0;
export const FRIENDSHIP_DEFAULT_SIZE = 10;

export type FriendshipReadQueryParams = {
  page?: number;
  size?: number;
  sort?: string | string[] | readonly string[];
};

export type FriendshipPaginationMeta = IModelPaginate<unknown>['meta'];

export type FriendshipRealtimeEventType =
  | 'FRIEND_REQUEST_CREATED'
  | 'FRIEND_REQUEST_ACCEPTED'
  | 'FRIEND_REQUEST_REJECTED'
  | 'FRIEND_REQUEST_CANCELED'
  | 'USER_BLOCKED'
  | 'USER_UNBLOCKED';

export type FriendshipEventType = FriendshipRealtimeEventType;

export enum FriendRequestStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  CANCELED = 'CANCELED',
  EXPIRED = 'EXPIRED',
}

export enum RelationshipState {
  FRIEND = 'FRIEND',
  BLOCKED = 'BLOCKED',
  NONE = 'NONE',
}

// UI-only state derived from relationship + pending requests.
export enum FriendshipUiState {
  NOT_FRIEND = 'NOT_FRIEND',
  PENDING_SENT = 'PENDING_SENT',
  PENDING_RECEIVED = 'PENDING_RECEIVED',
  FRIEND = 'FRIEND',
  BLOCKED = 'BLOCKED',
}

export enum FriendRequestDirection {
  RECEIVED = 'RECEIVED',
  SENT = 'SENT',
}

export type FriendUserSnippetResponse = {
  accountId: number;
  fullName?: string;
  username?: string;
  avatar?: string;
  headline?: string;
  bio?: string;
  coverPhoto?: string;
  visibility?: string;
};

export type FriendUserSummary = FriendUserSnippetResponse & {
  displayName?: string;
};

export type CreateFriendRequestRequest = {
  targetUserId: number;
};

export type FriendRequestResponse = {
  requestId: number;
  senderId: number;
  receiverId: number;
  status: FriendRequestStatus;
  relationshipState: RelationshipState | null;
  requestedAt?: string;
  respondedAt?: string | null;
};

export type FriendRequestListItemResponse = {
  requestId: number;
  status: FriendRequestStatus;
  requestedAt?: string;
  respondedAt?: string | null;
  direction: FriendRequestDirection;
  counterpart: FriendUserSnippetResponse;
};

export type MyFriendResponse = {
  relationshipId: number;
  friendsSince?: string;
  friend: FriendUserSnippetResponse;
};

export type FriendshipRealtimeEventResponse = {
  type: FriendshipRealtimeEventType;
  actorUser?: FriendUserSnippetResponse;
  targetUser?: FriendUserSnippetResponse;
  requestId?: number;
  relationshipState?: RelationshipState;
  emittedAt?: string;
};

export type FriendRequest = FriendRequestResponse & {
  direction?: FriendRequestDirection;
  counterpart?: FriendUserSummary;
  sender?: FriendUserSummary;
  receiver?: FriendUserSummary;
};

export type PairFriendshipSnapshot = {
  targetAccountId: number;
  targetUser?: FriendUserSummary;
  relationshipState: RelationshipState;
  friendsSince: string | null;
  blockedByMe: boolean;
  blockedByOther: boolean;
  pendingIncomingRequest: FriendRequest | null;
  pendingOutgoingRequest: FriendRequest | null;
  emittedAt?: string;
};

export type PendingFriendRequestsSnapshot = {
  incoming: FriendRequest[];
  outgoing: FriendRequest[];
};

export type CreateFriendRequestPayload = CreateFriendRequestRequest;
export type FriendBlockActionPayload = {
  targetUserId: number;
};

export type FriendRequestActionPayload = {
  requestId: number;
};

export type FriendBlockActionResponseBody = {
  senderId: number;
  receiverId: number;
  relationshipState: RelationshipState;
  requestedAt: string;
};

type FriendshipReadPayload =
  | IModelPaginate<MyFriendResponse>
  | MyFriendResponse[]
  | MyFriendResponse
  | Record<string, unknown>
  | unknown[];

type FriendRequestReadPayload =
  | IModelPaginate<FriendRequestListItemResponse>
  | FriendRequestListItemResponse[]
  | FriendRequestListItemResponse
  | Record<string, unknown>
  | unknown[];

export type GetMyFriendshipsResponse = IBackendRes<FriendshipReadPayload>;

export type GetMyReceivedFriendRequestsResponse = IBackendRes<FriendRequestReadPayload>;

export type GetMySentFriendRequestsResponse = IBackendRes<FriendRequestReadPayload>;

export type GetMyBlockedUsersResponse = IBackendRes<IModelPaginate<FriendUserSnippetResponse>>;

export type FriendRequestActionResponse = IBackendRes<FriendRequestResponse>;

export type FriendBlockActionResponse = IBackendRes<FriendBlockActionResponseBody>;
