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

type NormalizeFriendRequestOptions = {
  currentUserId?: number;
  directionHint?: FriendRequestDirection | null;
};

type NormalizePairSnapshotOptions = {
  currentUserId?: number;
  directionHint?: FriendRequestDirection | null;
};

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

const normalizeText = (value?: string): string | undefined => {
  if (typeof value !== 'string') {
    return undefined;
  }

  const normalized = value.trim();
  return normalized.length > 0 ? normalized : undefined;
};

const joinNameParts = (...parts: Array<string | undefined>): string | undefined => {
  const normalizedParts = parts.map((part) => normalizeText(part)).filter((part): part is string => Boolean(part));

  if (normalizedParts.length === 0) {
    return undefined;
  }

  return normalizedParts.join(' ');
};

const toOptionalNumber = (value?: number): number | null => {
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : null;
};

const DEFAULT_COLLECTION_KEYS = [
  'result',
  'items',
  'content',
  'data',
  'requests',
  'friendRequests',
  'relationships',
  'friends',
  'records',
] as const;

const pickCollectionFromSource = (source: Record<string, unknown>, preferredKeys?: string[]): unknown[] => {
  const keys = [...(preferredKeys ?? []), ...DEFAULT_COLLECTION_KEYS];

  for (const key of keys) {
    const value = source[key];

    if (Array.isArray(value)) {
      return value;
    }
  }

  return [];
};

const extractCollectionPayload = (input: unknown, preferredKeys?: string[]): unknown[] => {
  if (Array.isArray(input)) {
    return input;
  }

  const source = toRecord(input);
  const collection = pickCollectionFromSource(source, preferredKeys);

  if (collection.length > 0) {
    return collection;
  }

  const nestedData = toRecord(source.data);
  const nestedCollection = pickCollectionFromSource(nestedData, preferredKeys);

  if (nestedCollection.length > 0) {
    return nestedCollection;
  }

  return [];
};

const normalizeUserSummary = (input: unknown): FriendUserSummary | undefined => {
  const source = toRecord(input);

  const accountId = pickNumber(source, ['accountId', 'userId', 'id', 'account_id']);
  if (accountId === null) {
    return undefined;
  }

  const fullName =
    pickString(source, ['fullName', 'full_name', 'name']) ??
    joinNameParts(pickString(source, ['firstName', 'first_name']), pickString(source, ['lastName', 'last_name']));

  const username = pickString(source, ['username', 'userName', 'handle']);
  const displayName =
    pickString(source, ['displayName', 'display_name', 'nickName', 'nickname']) ?? fullName ?? username;

  return {
    accountId,
    displayName,
    fullName,
    username,
    avatar: pickString(source, [
      'avatar',
      'avatarUrl',
      'profilePhoto',
      'profilePicture',
      'photoUrl',
      'imageUrl',
      'photo',
    ]),
    visibility: pickString(source, ['visibility', 'accountVisibility', 'profileVisibility']) ?? null,
  };
};

const buildFallbackRequesterSummary = (source: Record<string, unknown>, requesterId: number): FriendUserSummary => {
  const fullName = pickString(source, ['requesterFullName', 'requesterName', 'senderName', 'actorName', 'fromName']);
  const username = pickString(source, ['requesterUsername', 'senderUsername', 'actorUsername', 'fromUsername']);

  return {
    accountId: requesterId,
    displayName:
      pickString(source, ['requesterDisplayName', 'senderDisplayName', 'actorDisplayName', 'fromDisplayName']) ??
      fullName ??
      username,
    fullName,
    username,
    avatar: pickString(source, [
      'requesterAvatar',
      'senderAvatar',
      'actorAvatar',
      'fromAvatar',
      'requesterPhotoUrl',
      'senderPhotoUrl',
    ]),
    visibility: pickString(source, ['requesterVisibility', 'senderVisibility', 'actorVisibility']) ?? null,
  };
};

const buildFallbackRecipientSummary = (source: Record<string, unknown>, recipientId: number): FriendUserSummary => {
  const fullName = pickString(source, [
    'recipientFullName',
    'recipientName',
    'targetUserFullName',
    'targetName',
    'toName',
  ]);
  const username = pickString(source, [
    'recipientUsername',
    'targetUsername',
    'targetUserUsername',
    'receiverUsername',
    'toUsername',
  ]);

  return {
    accountId: recipientId,
    displayName:
      pickString(source, [
        'recipientDisplayName',
        'targetDisplayName',
        'targetUserDisplayName',
        'receiverDisplayName',
      ]) ??
      fullName ??
      username,
    fullName,
    username,
    avatar: pickString(source, [
      'recipientAvatar',
      'targetAvatar',
      'targetUserAvatar',
      'receiverAvatar',
      'toAvatar',
      'recipientPhotoUrl',
      'targetPhotoUrl',
    ]),
    visibility: pickString(source, ['recipientVisibility', 'targetVisibility', 'receiverVisibility']) ?? null,
  };
};

const buildFallbackCounterpartSummary = (
  source: Record<string, unknown>,
  targetAccountId: number,
): FriendUserSummary => {
  const fullName = pickString(source, [
    'counterpartFullName',
    'counterpartName',
    'friendFullName',
    'friendName',
    'targetUserFullName',
  ]);
  const username = pickString(source, [
    'counterpartUsername',
    'friendUsername',
    'targetUserUsername',
    'targetUsername',
  ]);

  return {
    accountId: targetAccountId,
    displayName:
      pickString(source, [
        'counterpartDisplayName',
        'friendDisplayName',
        'targetUserDisplayName',
        'targetDisplayName',
      ]) ??
      fullName ??
      username,
    fullName,
    username,
    avatar: pickString(source, [
      'counterpartAvatar',
      'friendAvatar',
      'targetUserAvatar',
      'targetAvatar',
      'counterpartPhotoUrl',
      'friendPhotoUrl',
    ]),
    visibility: pickString(source, ['counterpartVisibility', 'friendVisibility', 'targetVisibility']) ?? null,
  };
};

export const getFriendUserDisplayName = (
  user?: Pick<FriendUserSummary, 'displayName' | 'fullName' | 'username'> | null,
  fallback = 'Người dùng',
): string => {
  return normalizeText(user?.displayName) ?? normalizeText(user?.fullName) ?? normalizeText(user?.username) ?? fallback;
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

export const normalizeFriendRequestDirection = (value: unknown): FriendRequestDirection | null => {
  const normalized = typeof value === 'string' ? value.trim().toUpperCase() : '';

  switch (normalized) {
    case FriendRequestDirection.INCOMING:
    case 'RECEIVED':
    case 'INBOUND':
      return FriendRequestDirection.INCOMING;
    case FriendRequestDirection.OUTGOING:
    case 'SENT':
    case 'OUTBOUND':
      return FriendRequestDirection.OUTGOING;
    default:
      return null;
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

export const normalizeFriendRequest = (
  input: unknown,
  options?: NormalizeFriendRequestOptions,
): FriendRequest | null => {
  const source = toRecord(input);

  const direction = normalizeFriendRequestDirection(
    source.direction ?? source.requestDirection ?? source.requestType ?? options?.directionHint,
  );
  const currentUserId =
    toOptionalNumber(options?.currentUserId) ?? pickNumber(source, ['currentUserId', 'meId', 'viewerAccountId']);

  const counterpart = normalizeUserSummary(
    source.counterpart ?? source.otherUser ?? source.friend ?? source.targetUser ?? source.counterpartUser,
  );
  const counterpartId =
    counterpart?.accountId ?? pickNumber(source, ['counterpartId', 'counterpartUserId', 'friendId']);

  const requestId = pickNumber(source, ['requestId', 'friendRequestId', 'id']);
  let requesterId = pickNumber(source, [
    'requesterId',
    'senderId',
    'actorUserId',
    'fromAccountId',
    'fromUserId',
    'requesterAccountId',
  ]);
  let recipientId = pickNumber(source, [
    'recipientId',
    'receiverId',
    'targetUserId',
    'targetId',
    'toAccountId',
    'toUserId',
    'recipientAccountId',
  ]);

  if ((requesterId === null || recipientId === null) && currentUserId !== null && counterpartId !== null && direction) {
    if (direction === FriendRequestDirection.INCOMING) {
      requesterId = counterpartId;
      recipientId = currentUserId;
    } else {
      requesterId = currentUserId;
      recipientId = counterpartId;
    }
  }

  if (requestId === null || requesterId === null || recipientId === null) {
    return null;
  }

  const requester = normalizeUserSummary(source.requester ?? source.sender ?? source.fromUser ?? source.from);
  const recipient = normalizeUserSummary(
    source.recipient ?? source.receiver ?? source.targetUser ?? source.toUser ?? source.to,
  );

  const fallbackRequester = buildFallbackRequesterSummary(source, requesterId);
  const fallbackRecipient = buildFallbackRecipientSummary(source, recipientId);

  const resolvedRequester =
    requester ?? (counterpart?.accountId === requesterId ? counterpart : undefined) ?? fallbackRequester;
  const resolvedRecipient =
    recipient ?? (counterpart?.accountId === recipientId ? counterpart : undefined) ?? fallbackRecipient;

  return {
    requestId,
    requesterId,
    recipientId,
    status: normalizeFriendRequestStatus(source.status ?? source.requestStatus),
    createdAt: pickString(source, ['createdAt', 'requestedAt']),
    updatedAt: pickString(source, ['updatedAt', 'respondedAt', 'processedAt', 'emittedAt']),
    expiresAt: pickString(source, ['expiresAt', 'expiredAt']),
    requester: resolvedRequester,
    recipient: resolvedRecipient,
  };
};

const normalizeRequestCollection = (input: unknown, options?: NormalizeFriendRequestOptions): FriendRequest[] => {
  return toArray(input)
    .map((item) => normalizeFriendRequest(item, options))
    .filter((item): item is FriendRequest => item !== null);
};

export const normalizeFriendRequestsPayload = (
  input: unknown,
  options?: NormalizeFriendRequestOptions,
): FriendRequest[] => {
  const collection = extractCollectionPayload(input, ['requests', 'friendRequests', 'incoming', 'outgoing']);

  if (collection.length > 0) {
    return normalizeRequestCollection(collection, options);
  }

  const single = normalizeFriendRequest(input, options);
  return single ? [single] : [];
};

export const normalizePendingRequestsPayload = (
  input: unknown,
  currentUserId?: number,
): PendingFriendRequestsSnapshot => {
  const source = toRecord(input);

  const incoming = normalizeRequestCollection(
    source.incoming ?? source.received ?? source.incomingRequests ?? source.pendingReceived,
    {
      currentUserId,
      directionHint: FriendRequestDirection.INCOMING,
    },
  );

  const outgoing = normalizeRequestCollection(
    source.outgoing ?? source.sent ?? source.outgoingRequests ?? source.pendingSent,
    {
      currentUserId,
      directionHint: FriendRequestDirection.OUTGOING,
    },
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
  options?: NormalizePairSnapshotOptions,
): PairFriendshipSnapshot | null => {
  const source = toRecord(input);

  const counterpart = normalizeUserSummary(
    source.counterpart ?? source.friend ?? source.otherUser ?? source.targetUser ?? source.counterpartUser,
  );

  const targetAccountId =
    pickNumber(source, [
      'targetAccountId',
      'accountId',
      'userId',
      'targetId',
      'friendAccountId',
      'counterpartId',
      'counterpartUserId',
      'friendId',
    ]) ??
    counterpart?.accountId ??
    (Number.isFinite(fallbackTargetAccountId) ? (fallbackTargetAccountId as number) : null);

  if (targetAccountId === null) {
    return null;
  }

  const currentUserId =
    toOptionalNumber(options?.currentUserId) ?? pickNumber(source, ['currentUserId', 'meId', 'viewerAccountId']);

  const pendingIncomingRequest = normalizeFriendRequest(
    source.pendingIncomingRequest ?? source.incomingRequest ?? source.receivedRequest ?? source.pendingReceived,
    {
      currentUserId: currentUserId ?? undefined,
      directionHint: FriendRequestDirection.INCOMING,
    },
  );

  const pendingOutgoingRequest = normalizeFriendRequest(
    source.pendingOutgoingRequest ?? source.outgoingRequest ?? source.sentRequest ?? source.pendingSent,
    {
      currentUserId: currentUserId ?? undefined,
      directionHint: FriendRequestDirection.OUTGOING,
    },
  );

  const blockedByMe = parseBoolean(source.blockedByMe ?? source.isBlockedByMe ?? source.blockedByCurrentUser);
  const blockedByOther = parseBoolean(source.blockedByOther ?? source.isBlockedByOther ?? source.blockedByTargetUser);

  let relationshipStatus = normalizeRelationshipStatus(
    source.relationshipStatus ?? source.relationshipState ?? source.status,
  );

  const resolvedCounterpart = counterpart ?? buildFallbackCounterpartSummary(source, targetAccountId);

  if (relationshipStatus !== UserRelationshipStatus.BLOCKED && (blockedByMe || blockedByOther)) {
    relationshipStatus = UserRelationshipStatus.BLOCKED;
  }

  return {
    targetAccountId,
    targetUser: resolvedCounterpart,
    relationshipStatus,
    friendsSince: pickString(source, ['friendsSince', 'friendSince', 'since', 'acceptedAt']) ?? null,
    blockedByMe,
    blockedByOther,
    pendingIncomingRequest,
    pendingOutgoingRequest,
    emittedAt: pickString(source, ['emittedAt', 'updatedAt']),
  };
};

export const normalizePairSnapshotsPayload = (
  input: unknown,
  options?: NormalizePairSnapshotOptions,
): PairFriendshipSnapshot[] => {
  const collection = extractCollectionPayload(input, ['relationships', 'friends']);

  if (collection.length > 0) {
    return collection
      .map((item) => normalizePairSnapshot(item, undefined, options))
      .filter((item): item is PairFriendshipSnapshot => item !== null);
  }

  const single = normalizePairSnapshot(input, undefined, options);
  return single ? [single] : [];
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
