import {
  FRIENDSHIP_DEFAULT_SIZE,
  FriendRequest,
  FriendRequestDirection,
  FriendRequestStatus,
  FriendUserSnippetResponse,
  FriendUserSummary,
  FriendshipEventType,
  FriendshipPaginationMeta,
  FriendshipUiState,
  PairFriendshipSnapshot,
  PendingFriendRequestsSnapshot,
  RelationshipState,
} from '@/services/friendship/friendshipType';

type NormalizeFriendRequestOptions = {
  currentUserId?: number;
  directionHint?: FriendRequestDirection | null;
};

type NormalizePairSnapshotOptions = {
  currentUserId?: number;
};

export type ParsedFriendshipEnvelope = {
  eventType: FriendshipEventType;
  emittedAt?: string;
  data: Record<string, unknown>;
};

export const FRIENDSHIP_EVENT_TYPES = [
  'FRIEND_REQUEST_CREATED',
  'FRIEND_REQUEST_ACCEPTED',
  'FRIEND_REQUEST_REJECTED',
  'FRIEND_REQUEST_CANCELED',
  'USER_BLOCKED',
  'USER_UNBLOCKED',
] as const satisfies readonly FriendshipEventType[];

const DEFAULT_COLLECTION_KEYS = ['result'] as const;

const toRecord = (value: unknown): Record<string, unknown> => {
  if (value && typeof value === 'object') {
    return value as Record<string, unknown>;
  }

  return {};
};

const toPositiveInt = (value: unknown): number | null => {
  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    return null;
  }

  const normalized = Math.floor(parsed);
  return normalized > 0 ? normalized : null;
};

const toNonNegativeInt = (value: unknown): number | null => {
  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    return null;
  }

  const normalized = Math.floor(parsed);
  return normalized >= 0 ? normalized : null;
};

const toArray = (value: unknown): unknown[] => {
  return Array.isArray(value) ? value : [];
};

const parsePositiveNumber = (value: unknown): number | null => {
  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }

  return parsed;
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
    const parsed = parsePositiveNumber(source[key]);

    if (parsed !== null) {
      return parsed;
    }
  }

  return null;
};

const normalizeText = (value: unknown): string | undefined => {
  if (typeof value !== 'string') {
    return undefined;
  }

  const normalized = value.trim();
  return normalized.length > 0 ? normalized : undefined;
};

const pickString = (source: Record<string, unknown>, keys: string[]): string | undefined => {
  for (const key of keys) {
    const normalized = normalizeText(source[key]);

    if (normalized) {
      return normalized;
    }
  }

  return undefined;
};

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
  return pickCollectionFromSource(source, preferredKeys);
};

export const unwrapFriendshipResponseData = (input: unknown): unknown => {
  const source = toRecord(input);

  if ('data' in source && source.data !== undefined && source.data !== null) {
    return source.data;
  }

  return input;
};

export const extractFriendshipPaginationMeta = (
  input: unknown,
  fallback?: Partial<FriendshipPaginationMeta>,
): FriendshipPaginationMeta => {
  const source = toRecord(unwrapFriendshipResponseData(input));
  const meta = toRecord(source.meta);

  const fallbackPage = toPositiveInt(fallback?.page) ?? 1;
  const rawPage = toNonNegativeInt(meta.page);
  const page = rawPage === 0 ? 1 : (rawPage ?? fallbackPage);

  return {
    page,
    pageSize: toPositiveInt(meta.pageSize) ?? toPositiveInt(fallback?.pageSize) ?? FRIENDSHIP_DEFAULT_SIZE,
    pages: toNonNegativeInt(meta.pages) ?? toNonNegativeInt(fallback?.pages) ?? 0,
    total: toNonNegativeInt(meta.total) ?? toNonNegativeInt(fallback?.total) ?? 0,
  };
};

const normalizeUserSnippet = (input: unknown): FriendUserSummary | undefined => {
  const source = toRecord(input);
  const accountId = pickNumber(source, ['accountId']);

  if (accountId === null) {
    return undefined;
  }

  const fullName = pickString(source, ['fullName']);
  const username = pickString(source, ['username']);
  const displayName = fullName ?? username;

  return {
    accountId,
    displayName,
    fullName,
    username,
    avatar: pickString(source, ['avatar']),
    headline: pickString(source, ['headline']),
    bio: pickString(source, ['bio']),
    coverPhoto: pickString(source, ['coverPhoto']),
    visibility: pickString(source, ['visibility']),
  };
};

const toOptionalNumber = (value?: number): number | null => {
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : null;
};

const inferSenderAndReceiver = (
  currentUserId: number,
  direction: FriendRequestDirection,
  counterpartId: number,
): { senderId: number; receiverId: number } => {
  if (direction === FriendRequestDirection.RECEIVED) {
    return {
      senderId: counterpartId,
      receiverId: currentUserId,
    };
  }

  return {
    senderId: currentUserId,
    receiverId: counterpartId,
  };
};

export const getFriendUserDisplayName = (
  user?: Pick<FriendUserSnippetResponse, 'fullName' | 'username'> | null,
  fallback = 'Người dùng',
): string => {
  return normalizeText(user?.fullName) ?? normalizeText(user?.username) ?? fallback;
};

export const isFriendshipEventType = (value: unknown): value is FriendshipEventType => {
  return typeof value === 'string' && FRIENDSHIP_EVENT_TYPES.includes(value as FriendshipEventType);
};

export const normalizeFriendRequestStatus = (value: unknown): FriendRequestStatus => {
  const normalized = typeof value === 'string' ? value.trim().toUpperCase() : '';

  switch (normalized) {
    case FriendRequestStatus.ACCEPTED:
      return FriendRequestStatus.ACCEPTED;
    case FriendRequestStatus.REJECTED:
      return FriendRequestStatus.REJECTED;
    case FriendRequestStatus.CANCELED:
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
    case FriendRequestDirection.RECEIVED:
      return FriendRequestDirection.RECEIVED;
    case FriendRequestDirection.SENT:
      return FriendRequestDirection.SENT;
    default:
      return null;
  }
};

export const normalizeRelationshipStatus = (value: unknown): RelationshipState | null => {
  const normalized = typeof value === 'string' ? value.trim().toUpperCase() : '';

  switch (normalized) {
    case RelationshipState.FRIEND:
      return RelationshipState.FRIEND;
    case RelationshipState.BLOCKED:
      return RelationshipState.BLOCKED;
    case RelationshipState.NONE:
      return RelationshipState.NONE;
    default:
      return null;
  }
};

export const normalizeFriendRequest = (
  input: unknown,
  options?: NormalizeFriendRequestOptions,
): FriendRequest | null => {
  const source = toRecord(input);

  const requestId = pickNumber(source, ['requestId']);
  if (requestId === null) {
    return null;
  }

  const direction = normalizeFriendRequestDirection(source.direction ?? options?.directionHint);
  const currentUserId = toOptionalNumber(options?.currentUserId);
  const counterpart = normalizeUserSnippet(source.counterpart);

  let senderId = pickNumber(source, ['senderId']);
  let receiverId = pickNumber(source, ['receiverId']);

  if (senderId === null || receiverId === null) {
    if (currentUserId !== null && counterpart?.accountId && direction) {
      const inferred = inferSenderAndReceiver(currentUserId, direction, counterpart.accountId);
      senderId = inferred.senderId;
      receiverId = inferred.receiverId;
    }
  }

  const sender = normalizeUserSnippet(source.sender);
  const receiver = normalizeUserSnippet(source.receiver);

  if (senderId === null) {
    senderId = sender?.accountId ?? null;
  }

  if (receiverId === null) {
    receiverId = receiver?.accountId ?? null;
  }

  if (senderId === null || receiverId === null) {
    return null;
  }

  return {
    requestId,
    senderId,
    receiverId,
    status: normalizeFriendRequestStatus(source.status),
    relationshipState: normalizeRelationshipStatus(source.relationshipState) ?? RelationshipState.NONE,
    requestedAt: pickString(source, ['requestedAt']) ?? undefined,
    respondedAt: pickString(source, ['respondedAt']) ?? null,
    direction: direction ?? undefined,
    counterpart,
    sender,
    receiver,
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
  const collection = extractCollectionPayload(input, ['result']);

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

  const incoming = normalizeRequestCollection(source.incoming ?? source.received, {
    currentUserId,
    directionHint: FriendRequestDirection.RECEIVED,
  });

  const outgoing = normalizeRequestCollection(source.outgoing ?? source.sent, {
    currentUserId,
    directionHint: FriendRequestDirection.SENT,
  });

  if (incoming.length > 0 || outgoing.length > 0) {
    return {
      incoming: incoming.filter((request) => request.status === FriendRequestStatus.PENDING),
      outgoing: outgoing.filter((request) => request.status === FriendRequestStatus.PENDING),
    };
  }

  const requests = normalizeFriendRequestsPayload(input, { currentUserId }).filter(
    (request) => request.status === FriendRequestStatus.PENDING,
  );

  if (currentUserId && Number.isFinite(currentUserId)) {
    return {
      incoming: requests.filter((request) => request.receiverId === currentUserId),
      outgoing: requests.filter((request) => request.senderId === currentUserId),
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
  const friend = normalizeUserSnippet(source.friend);

  const targetAccountId =
    friend?.accountId ??
    pickNumber(source, ['targetAccountId']) ??
    (Number.isFinite(fallbackTargetAccountId) ? (fallbackTargetAccountId as number) : null);

  if (targetAccountId === null) {
    return null;
  }

  const currentUserId = toOptionalNumber(options?.currentUserId);

  const pendingIncomingRequest = normalizeFriendRequest(source.pendingIncomingRequest, {
    currentUserId: currentUserId ?? undefined,
    directionHint: FriendRequestDirection.RECEIVED,
  });

  const pendingOutgoingRequest = normalizeFriendRequest(source.pendingOutgoingRequest, {
    currentUserId: currentUserId ?? undefined,
    directionHint: FriendRequestDirection.SENT,
  });

  const relationshipState =
    normalizeRelationshipStatus(source.relationshipState) ??
    (friend ? RelationshipState.FRIEND : RelationshipState.NONE);

  const blockedByMe = parseBoolean(source.blockedByMe);
  const blockedByOther = parseBoolean(source.blockedByOther);

  return {
    targetAccountId,
    targetUser: friend,
    relationshipState: blockedByMe || blockedByOther ? RelationshipState.BLOCKED : relationshipState,
    friendsSince: pickString(source, ['friendsSince']) ?? null,
    blockedByMe,
    blockedByOther,
    pendingIncomingRequest: pendingIncomingRequest ?? null,
    pendingOutgoingRequest: pendingOutgoingRequest ?? null,
    emittedAt: pickString(source, ['emittedAt', 'updatedAt']),
  };
};

export const normalizePairSnapshotsPayload = (
  input: unknown,
  options?: NormalizePairSnapshotOptions,
): PairFriendshipSnapshot[] => {
  const collection = extractCollectionPayload(input, ['result']);

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
    'relationshipState' | 'blockedByMe' | 'blockedByOther' | 'pendingIncomingRequest' | 'pendingOutgoingRequest'
  > | null,
): FriendshipUiState => {
  if (!snapshot) {
    return FriendshipUiState.NOT_FRIEND;
  }

  if (snapshot.relationshipState === RelationshipState.BLOCKED || snapshot.blockedByMe || snapshot.blockedByOther) {
    return FriendshipUiState.BLOCKED;
  }

  if (snapshot.relationshipState === RelationshipState.FRIEND) {
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

export const normalizeFriendRequestFromEventData = (
  data: Record<string, unknown>,
  status: FriendRequestStatus,
): FriendRequest | null => {
  const relationshipStateForStatus =
    status === FriendRequestStatus.ACCEPTED
      ? RelationshipState.FRIEND
      : (normalizeRelationshipStatus(data.relationshipState) ?? RelationshipState.NONE);

  const explicitSenderId = pickNumber(data, ['senderId']);
  const explicitReceiverId = pickNumber(data, ['receiverId']);
  const hasExplicitDirection = explicitSenderId !== null && explicitReceiverId !== null;

  const normalized = normalizeFriendRequest(data);

  if (normalized) {
    const shouldSwapActorAndTarget =
      !hasExplicitDirection && (status === FriendRequestStatus.ACCEPTED || status === FriendRequestStatus.REJECTED);

    return {
      ...normalized,
      senderId: shouldSwapActorAndTarget ? normalized.receiverId : normalized.senderId,
      receiverId: shouldSwapActorAndTarget ? normalized.senderId : normalized.receiverId,
      sender: shouldSwapActorAndTarget ? normalized.receiver : normalized.sender,
      receiver: shouldSwapActorAndTarget ? normalized.sender : normalized.receiver,
      status,
      relationshipState: relationshipStateForStatus,
      respondedAt:
        status === FriendRequestStatus.PENDING
          ? normalized.respondedAt
          : (normalized.respondedAt ?? pickString(data, ['emittedAt']) ?? new Date().toISOString()),
    };
  }

  const requestId = pickNumber(data, ['requestId']);
  const actorUser = normalizeUserSnippet(data.actorUser);
  const targetUser = normalizeUserSnippet(data.targetUser);

  if (!requestId || !actorUser || !targetUser) {
    return null;
  }

  let senderId = pickNumber(data, ['senderId']);
  let receiverId = pickNumber(data, ['receiverId']);

  if (!senderId || !receiverId) {
    if (status === FriendRequestStatus.PENDING || status === FriendRequestStatus.CANCELED) {
      senderId = actorUser.accountId;
      receiverId = targetUser.accountId;
    } else {
      senderId = targetUser.accountId;
      receiverId = actorUser.accountId;
    }
  }

  return {
    requestId,
    senderId,
    receiverId,
    status,
    relationshipState: relationshipStateForStatus,
    requestedAt: pickString(data, ['requestedAt', 'emittedAt']) ?? undefined,
    respondedAt:
      status === FriendRequestStatus.PENDING ? null : (pickString(data, ['respondedAt', 'emittedAt']) ?? null),
    sender: {
      ...actorUser,
      accountId: senderId,
    },
    receiver: {
      ...targetUser,
      accountId: receiverId,
    },
  };
};

const parseUserIdFromObject = (value: unknown): number | null => {
  const source = toRecord(value);

  return pickNumber(source, ['accountId']);
};

export const normalizeFriendshipBlockEventParticipants = (
  data: Record<string, unknown>,
): {
  blockerId: number;
  blockedId: number;
} | null => {
  const blockerId = pickNumber(data, ['senderId']) ?? parseUserIdFromObject(data.actorUser);

  const blockedId = pickNumber(data, ['receiverId']) ?? parseUserIdFromObject(data.targetUser);

  if (blockerId === null || blockedId === null) {
    return null;
  }

  return {
    blockerId,
    blockedId,
  };
};

export const parseFriendshipEventEnvelope = (payload: unknown): ParsedFriendshipEnvelope | null => {
  const source = toRecord(payload);
  const eventType = isFriendshipEventType(source.type) ? source.type : null;

  if (!eventType) {
    return null;
  }

  const eventData = { ...source };
  eventData.type = eventType;

  const emittedAt = pickString(source, ['emittedAt']);

  return {
    eventType,
    emittedAt,
    data: eventData,
  };
};
