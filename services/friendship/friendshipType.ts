import { IBackendRes } from '@/types/api';

export const FRIENDSHIP_EVENT_TYPES = [
  'FRIEND_REQUEST_CREATED',
  'FRIEND_REQUEST_ACCEPTED',
  'FRIEND_REQUEST_REJECTED',
  'FRIEND_REQUEST_CANCELED',
] as const;

export type FriendshipEventType = (typeof FRIENDSHIP_EVENT_TYPES)[number];

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

export type FriendUserSummary = {
  accountId: number;
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

export type GetFriendshipWithUserResponse =
  | IBackendRes<PairFriendshipSnapshot | Record<string, unknown>>
  | PairFriendshipSnapshot
  | Record<string, unknown>;

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

const toRecord = (value: unknown): Record<string, unknown> => {
  if (value && typeof value === 'object') {
    return value as Record<string, unknown>;
  }

  return {};
};

const toArray = (value: unknown): unknown[] => {
  return Array.isArray(value) ? value : [];
};

const parseNumber = (value: unknown): number | null => {
  const num = Number(value);

  if (!Number.isFinite(num) || num <= 0) {
    return null;
  }

  return num;
};

const parseBoolean = (value: unknown): boolean => {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    return normalized === 'true' || normalized === '1';
  }

  if (typeof value === 'number') {
    return value === 1;
  }

  return false;
};

const pickNumber = (source: Record<string, unknown>, keys: string[]): number | null => {
  for (const key of keys) {
    const parsed = parseNumber(source[key]);
    if (parsed !== null) {
      return parsed;
    }
  }

  return null;
};

const pickString = (source: Record<string, unknown>, keys: string[]): string | undefined => {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === 'string' && value.trim().length > 0) {
      return value;
    }
  }

  return undefined;
};

const normalizeUserSummary = (input: unknown): FriendUserSummary | undefined => {
  const source = toRecord(input);

  const accountId = pickNumber(source, ['accountId', 'userId', 'id']);
  if (accountId === null) {
    return undefined;
  }

  return {
    accountId,
    fullName: pickString(source, ['fullName', 'name']),
    username: pickString(source, ['username']),
    avatar: pickString(source, ['avatar', 'photoUrl', 'imageUrl']),
    visibility: pickString(source, ['visibility']) ?? null,
  };
};

export const normalizeFriendRequestStatus = (value: unknown): FriendRequestStatus => {
  const normalized = typeof value === 'string' ? value.trim().toUpperCase() : '';

  switch (normalized) {
    case FriendRequestStatus.ACCEPTED:
      return FriendRequestStatus.ACCEPTED;
    case FriendRequestStatus.REJECTED:
      return FriendRequestStatus.REJECTED;
    case FriendRequestStatus.CANCELED:
    case 'CANCELLED':
      return FriendRequestStatus.CANCELED;
    case FriendRequestStatus.EXPIRED:
      return FriendRequestStatus.EXPIRED;
    case FriendRequestStatus.PENDING:
    default:
      return FriendRequestStatus.PENDING;
  }
};

export const normalizeRelationshipStatus = (value: unknown): UserRelationshipStatus => {
  const normalized = typeof value === 'string' ? value.trim().toUpperCase() : '';

  switch (normalized) {
    case UserRelationshipStatus.FRIEND:
      return UserRelationshipStatus.FRIEND;
    case UserRelationshipStatus.BLOCKED:
      return UserRelationshipStatus.BLOCKED;
    case 'NOT_FRIEND':
    case 'UNRELATED':
    case 'NONE':
    default:
      return UserRelationshipStatus.NONE;
  }
};

export const normalizeFriendRequest = (input: unknown): FriendRequest | null => {
  const source = toRecord(input);

  const requestId = pickNumber(source, ['requestId', 'friendRequestId', 'id']);
  const requesterId = pickNumber(source, [
    'requesterId',
    'senderId',
    'actorUserId',
    'fromAccountId',
    'fromUserId',
    'requesterAccountId',
  ]);
  const recipientId = pickNumber(source, [
    'recipientId',
    'receiverId',
    'targetUserId',
    'targetId',
    'toAccountId',
    'toUserId',
    'recipientAccountId',
  ]);

  if (requestId === null || requesterId === null || recipientId === null) {
    return null;
  }

  return {
    requestId,
    requesterId,
    recipientId,
    status: normalizeFriendRequestStatus(source.status ?? source.requestStatus),
    createdAt: pickString(source, ['createdAt', 'requestedAt']),
    updatedAt: pickString(source, ['updatedAt', 'respondedAt', 'processedAt', 'emittedAt']),
    expiresAt: pickString(source, ['expiresAt', 'expiredAt']),
    requester: normalizeUserSummary(source.requester ?? source.sender ?? source.fromUser ?? source.from),
    recipient: normalizeUserSummary(
      source.recipient ?? source.receiver ?? source.targetUser ?? source.toUser ?? source.to,
    ),
  };
};

const normalizeRequestCollection = (input: unknown): FriendRequest[] => {
  return toArray(input)
    .map((item) => normalizeFriendRequest(item))
    .filter((item): item is FriendRequest => item !== null);
};

export const normalizePendingRequestsPayload = (
  input: unknown,
  currentUserId?: number,
): PendingFriendRequestsSnapshot => {
  const source = toRecord(input);

  const incoming = normalizeRequestCollection(
    source.incoming ?? source.received ?? source.incomingRequests ?? source.pendingReceived,
  );

  const outgoing = normalizeRequestCollection(
    source.outgoing ?? source.sent ?? source.outgoingRequests ?? source.pendingSent,
  );

  if (incoming.length > 0 || outgoing.length > 0) {
    return {
      incoming: incoming.filter((request) => request.status === FriendRequestStatus.PENDING),
      outgoing: outgoing.filter((request) => request.status === FriendRequestStatus.PENDING),
    };
  }

  const rawCollection =
    source.requests ?? source.result ?? source.items ?? source.data ?? source.content ?? source.friendRequests;

  const requests = normalizeRequestCollection(rawCollection).filter(
    (request) => request.status === FriendRequestStatus.PENDING,
  );

  if (currentUserId && Number.isFinite(currentUserId)) {
    return {
      incoming: requests.filter((request) => request.recipientId === currentUserId),
      outgoing: requests.filter((request) => request.requesterId === currentUserId),
    };
  }

  return {
    incoming: [],
    outgoing: requests,
  };
};

export const normalizePairSnapshot = (
  input: unknown,
  fallbackTargetAccountId?: number,
): PairFriendshipSnapshot | null => {
  const source = toRecord(input);

  const targetAccountId =
    pickNumber(source, ['targetAccountId', 'accountId', 'userId', 'targetId', 'friendAccountId']) ??
    (Number.isFinite(fallbackTargetAccountId) ? (fallbackTargetAccountId as number) : null);

  if (targetAccountId === null) {
    return null;
  }

  const pendingIncomingRequest = normalizeFriendRequest(
    source.pendingIncomingRequest ?? source.incomingRequest ?? source.receivedRequest ?? source.pendingReceived,
  );

  const pendingOutgoingRequest = normalizeFriendRequest(
    source.pendingOutgoingRequest ?? source.outgoingRequest ?? source.sentRequest ?? source.pendingSent,
  );

  const blockedByMe = parseBoolean(source.blockedByMe ?? source.isBlockedByMe ?? source.blockedByCurrentUser);
  const blockedByOther = parseBoolean(source.blockedByOther ?? source.isBlockedByOther ?? source.blockedByTargetUser);

  let relationshipStatus = normalizeRelationshipStatus(
    source.relationshipStatus ?? source.relationshipState ?? source.status,
  );

  if (relationshipStatus !== UserRelationshipStatus.BLOCKED && (blockedByMe || blockedByOther)) {
    relationshipStatus = UserRelationshipStatus.BLOCKED;
  }

  return {
    targetAccountId,
    relationshipStatus,
    friendsSince: pickString(source, ['friendsSince', 'since']) ?? null,
    blockedByMe,
    blockedByOther,
    pendingIncomingRequest,
    pendingOutgoingRequest,
    emittedAt: pickString(source, ['emittedAt', 'updatedAt']),
  };
};

export const deriveFriendshipUiState = (
  snapshot?: Pick<
    PairFriendshipSnapshot,
    'relationshipStatus' | 'blockedByMe' | 'blockedByOther' | 'pendingIncomingRequest' | 'pendingOutgoingRequest'
  > | null,
): FriendshipUiState => {
  if (!snapshot) {
    return FriendshipUiState.NOT_FRIEND;
  }

  if (
    snapshot.relationshipStatus === UserRelationshipStatus.BLOCKED ||
    snapshot.blockedByMe ||
    snapshot.blockedByOther
  ) {
    return FriendshipUiState.BLOCKED;
  }

  if (snapshot.relationshipStatus === UserRelationshipStatus.FRIEND) {
    return FriendshipUiState.FRIEND;
  }

  if (snapshot.pendingIncomingRequest?.status === FriendRequestStatus.PENDING) {
    return FriendshipUiState.PENDING_RECEIVED;
  }

  if (snapshot.pendingOutgoingRequest?.status === FriendRequestStatus.PENDING) {
    return FriendshipUiState.PENDING_SENT;
  }

  return FriendshipUiState.NOT_FRIEND;
};

export const isFriendshipEventType = (value: unknown): value is FriendshipEventType => {
  return typeof value === 'string' && FRIENDSHIP_EVENT_TYPES.includes(value as FriendshipEventType);
};
