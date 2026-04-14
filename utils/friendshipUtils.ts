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
import { IBackendRes, IModelPaginate } from '@/types/api';

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

const toRecord = (value: unknown): Record<string, unknown> => {
  if (value && typeof value === 'object') {
    return value as Record<string, unknown>;
  }

  return {};
};

const toArray = (value: unknown): unknown[] => {
  return Array.isArray(value) ? value : [];
};

const toPositiveInt = (value: unknown): number | null => {
  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    return null;
  }

  const normalized = Math.floor(parsed);
  return normalized > 0 ? normalized : null;
};

const toBoolean = (value: unknown): boolean => {
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

const toTrimmedString = (value: unknown): string | undefined => {
  if (typeof value !== 'string') {
    return undefined;
  }

  const normalized = value.trim();
  return normalized.length > 0 ? normalized : undefined;
};

const getResultCollection = (input: unknown): unknown[] => {
  if (Array.isArray(input)) {
    return input;
  }

  const source = toRecord(input);
  return toArray(source.result);
};

export const unwrapFriendshipResponseData = (input: unknown): unknown => {
  const source = toRecord(input);

  if ('data' in source && source.data !== undefined && source.data !== null) {
    return source.data;
  }

  return input;
};

export const extractFriendshipPaginationMeta = <T>(
  input: IBackendRes<IModelPaginate<T>> | undefined,
): FriendshipPaginationMeta => {
  if (input?.data?.meta) {
    const { page, pageSize, pages, total } = input.data.meta;
    return {
      page,
      pageSize,
      pages,
      total,
    };
  }

  return {
    page: FRIENDSHIP_DEFAULT_SIZE,
    pageSize: FRIENDSHIP_DEFAULT_SIZE,
    pages: 0,
    total: 0,
  };
};

const normalizeUserSnippet = (input: unknown): FriendUserSummary | undefined => {
  const source = toRecord(input);
  const accountId = toPositiveInt(source.accountId);

  if (accountId === null) {
    return undefined;
  }

  const fullName = toTrimmedString(source.fullName);
  const username = toTrimmedString(source.username);
  const displayName = fullName ?? username;

  return {
    accountId,
    displayName,
    fullName,
    username,
    avatar: toTrimmedString(source.avatar),
    headline: toTrimmedString(source.headline),
    bio: toTrimmedString(source.bio),
    coverPhoto: toTrimmedString(source.coverPhoto),
    visibility: toTrimmedString(source.visibility),
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
  return toTrimmedString(user?.fullName) ?? toTrimmedString(user?.username) ?? fallback;
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

  const requestId = toPositiveInt(source.requestId);
  if (requestId === null) {
    return null;
  }

  const direction = normalizeFriendRequestDirection(source.direction ?? options?.directionHint);
  const currentUserId = toOptionalNumber(options?.currentUserId);
  const counterpart = normalizeUserSnippet(source.counterpart);
  const sender = normalizeUserSnippet(source.sender);
  const receiver = normalizeUserSnippet(source.receiver);

  let senderId = toPositiveInt(source.senderId) ?? sender?.accountId ?? null;
  let receiverId = toPositiveInt(source.receiverId) ?? receiver?.accountId ?? null;

  if (senderId === null || receiverId === null) {
    if (currentUserId !== null && counterpart?.accountId && direction) {
      const inferred = inferSenderAndReceiver(currentUserId, direction, counterpart.accountId);
      senderId = senderId ?? inferred.senderId;
      receiverId = receiverId ?? inferred.receiverId;
    }
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
    requestedAt: toTrimmedString(source.requestedAt) ?? undefined,
    respondedAt: toTrimmedString(source.respondedAt) ?? null,
    direction: direction ?? undefined,
    counterpart,
    sender,
    receiver,
  };
};

export const normalizeFriendUserSnippetsPayload = (input: unknown): FriendUserSummary[] => {
  const payload = unwrapFriendshipResponseData(input);
  const collection = getResultCollection(payload);

  if (collection.length > 0) {
    return collection.map((item) => normalizeUserSnippet(item)).filter((item): item is FriendUserSummary => !!item);
  }

  const single = normalizeUserSnippet(payload);
  return single ? [single] : [];
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
  const payload = unwrapFriendshipResponseData(input);
  const collection = getResultCollection(payload);

  if (collection.length > 0) {
    return normalizeRequestCollection(collection, options);
  }

  const single = normalizeFriendRequest(payload, options);
  return single ? [single] : [];
};

export const normalizePendingRequestsPayload = (
  input: unknown,
  currentUserId?: number,
): PendingFriendRequestsSnapshot => {
  const source = toRecord(unwrapFriendshipResponseData(input));

  const incoming = normalizeRequestCollection(source.incoming, {
    currentUserId,
    directionHint: FriendRequestDirection.RECEIVED,
  });

  const outgoing = normalizeRequestCollection(source.outgoing, {
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

  if (typeof currentUserId === 'number' && Number.isFinite(currentUserId) && currentUserId > 0) {
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
  const friend = normalizeUserSnippet(source.friend) ?? normalizeUserSnippet(source.targetUser);

  const targetAccountId =
    friend?.accountId ?? toPositiveInt(source.targetAccountId) ?? toPositiveInt(fallbackTargetAccountId);

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

  const blockedByMe = toBoolean(source.blockedByMe);
  const blockedByOther = toBoolean(source.blockedByOther);

  return {
    targetAccountId,
    targetUser: friend,
    relationshipState: blockedByMe || blockedByOther ? RelationshipState.BLOCKED : relationshipState,
    friendsSince: toTrimmedString(source.friendsSince) ?? null,
    blockedByMe,
    blockedByOther,
    pendingIncomingRequest: pendingIncomingRequest ?? null,
    pendingOutgoingRequest: pendingOutgoingRequest ?? null,
    emittedAt: toTrimmedString(source.emittedAt) ?? toTrimmedString(source.updatedAt),
  };
};

export const normalizePairSnapshotsPayload = (
  input: unknown,
  options?: NormalizePairSnapshotOptions,
): PairFriendshipSnapshot[] => {
  const payload = unwrapFriendshipResponseData(input);
  const collection = getResultCollection(payload);

  if (collection.length > 0) {
    return collection
      .map((item) => normalizePairSnapshot(item, undefined, options))
      .filter((item): item is PairFriendshipSnapshot => item !== null);
  }

  const single = normalizePairSnapshot(payload, undefined, options);
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
  const requestId = toPositiveInt(data.requestId);

  if (requestId === null) {
    return null;
  }

  const relationshipStateForStatus =
    status === FriendRequestStatus.ACCEPTED
      ? RelationshipState.FRIEND
      : (normalizeRelationshipStatus(data.relationshipState) ?? RelationshipState.NONE);

  const actorUser = normalizeUserSnippet(data.actorUser);
  const targetUser = normalizeUserSnippet(data.targetUser);

  let senderId = toPositiveInt(data.senderId);
  let receiverId = toPositiveInt(data.receiverId);

  if ((senderId === null || receiverId === null) && actorUser && targetUser) {
    const actorIsSender = status === FriendRequestStatus.PENDING || status === FriendRequestStatus.CANCELED;
    const inferredSenderId = actorIsSender ? actorUser.accountId : targetUser.accountId;
    const inferredReceiverId = actorIsSender ? targetUser.accountId : actorUser.accountId;

    senderId = senderId ?? inferredSenderId;
    receiverId = receiverId ?? inferredReceiverId;
  }

  if (senderId === null || receiverId === null) {
    const fallback = normalizeFriendRequest(data);

    if (!fallback) {
      return null;
    }

    const fallbackSenderId = toPositiveInt(fallback.senderId);
    const fallbackReceiverId = toPositiveInt(fallback.receiverId);

    if (senderId === null && fallbackSenderId !== null) {
      senderId = fallbackSenderId;
    }

    if (receiverId === null && fallbackReceiverId !== null) {
      receiverId = fallbackReceiverId;
    }
  }

  const finalSenderId = toPositiveInt(senderId);
  const finalReceiverId = toPositiveInt(receiverId);

  if (finalSenderId === null || finalReceiverId === null) {
    return null;
  }

  const sender =
    actorUser?.accountId === finalSenderId
      ? actorUser
      : targetUser?.accountId === finalSenderId
        ? targetUser
        : undefined;
  const receiver =
    actorUser?.accountId === finalReceiverId
      ? actorUser
      : targetUser?.accountId === finalReceiverId
        ? targetUser
        : undefined;

  return {
    requestId,
    senderId: finalSenderId,
    receiverId: finalReceiverId,
    status,
    relationshipState: relationshipStateForStatus,
    requestedAt: toTrimmedString(data.requestedAt) ?? toTrimmedString(data.emittedAt) ?? undefined,
    respondedAt:
      status === FriendRequestStatus.PENDING
        ? null
        : (toTrimmedString(data.respondedAt) ?? toTrimmedString(data.emittedAt) ?? new Date().toISOString()),
    sender,
    receiver,
  };
};

export const normalizeFriendshipBlockEventParticipants = (
  data: Record<string, unknown>,
): {
  blockerId: number;
  blockedId: number;
} | null => {
  const blockerId = toPositiveInt(data.senderId) ?? normalizeUserSnippet(data.actorUser)?.accountId ?? null;

  const blockedId = toPositiveInt(data.receiverId) ?? normalizeUserSnippet(data.targetUser)?.accountId ?? null;

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
  const eventType = source.type;

  if (!isFriendshipEventType(eventType)) {
    return null;
  }

  const eventData = { ...source };
  eventData.type = eventType;

  const emittedAt = toTrimmedString(source.emittedAt);

  return {
    eventType,
    emittedAt,
    data: eventData,
  };
};
