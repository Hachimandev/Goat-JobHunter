import { IBackendRes, IModelPaginate } from "@/types/api";

export enum FriendRequestStatus {
  PENDING = "PENDING",
  ACCEPTED = "ACCEPTED",
  REJECTED = "REJECTED",
  CANCELED = "CANCELED",
  EXPIRED = "EXPIRED",
}

export enum RelationshipState {
  FRIEND = "FRIEND",
  BLOCKED = "BLOCKED",
  NONE = "NONE",
}

export type FriendshipReadQueryParams = {
  page?: number;
  size?: number;
  sort?: string | string[];
};

export type FriendUserSnippetResponse = {
  accountId: number;
  fullName?: string;
  username?: string;
  avatar?: string;
};

export type MyFriendResponse = {
  relationshipId: number;
  friendsSince?: string;
  friend: FriendUserSnippetResponse;
};

export type FriendRequestListItemResponse = {
  requestId: number;
  status: FriendRequestStatus;
  requestedAt?: string;
  respondedAt?: string | null;
  direction: "RECEIVED" | "SENT";
  counterpart: FriendUserSnippetResponse;
};

export type FriendshipPageResponse<T> = IBackendRes<IModelPaginate<T>>;

export type GetMyFriendshipsResponse = FriendshipPageResponse<MyFriendResponse>;
export type GetMyReceivedFriendRequestsResponse =
  FriendshipPageResponse<FriendRequestListItemResponse>;
export type GetMySentFriendRequestsResponse =
  FriendshipPageResponse<FriendRequestListItemResponse>;

export type CreateFriendRequestRequest = {
  targetUserId: number;
};

export type CreateFriendRequestPayload = CreateFriendRequestRequest;

export type FriendRequestActionPayload = {
  requestId: number;
};

export type FriendRequestActionResponse = IBackendRes<{
  requestId: number;
  senderId: number;
  receiverId: number;
  status: FriendRequestStatus;
  relationshipState: RelationshipState | null;
  requestedAt?: string;
  respondedAt?: string | null;
}>;

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
