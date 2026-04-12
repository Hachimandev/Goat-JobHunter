import { clearUser } from '@/lib/features/authSlice';
import { useAppSelector } from '@/lib/hooks';
import {
  FriendRequest,
  FriendRequestStatus,
  FriendUserSummary,
  PairFriendshipSnapshot,
  RelationshipState,
} from '@/services/friendship/friendshipType';
import type { RootState } from '@/lib/store';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type PairFriendshipState = PairFriendshipSnapshot & {
  updatedAt: string | null;
};

type FriendshipState = {
  pairs: Record<string, PairFriendshipState>;
  requestsById: Record<string, FriendRequest>;
  lastSyncedAt: string | null;
};

type PendingRequestsHydrationPayload = {
  currentUserId: number;
  incoming?: FriendRequest[];
  outgoing?: FriendRequest[];
  replaceIncoming?: boolean;
  replaceOutgoing?: boolean;
  emittedAt?: string;
};

type FriendRequestEventPayload = {
  currentUserId: number;
  request: FriendRequest;
  emittedAt?: string;
  friendsSince?: string | null;
};

type BlockEventPayload = {
  currentUserId: number;
  blockerId: number;
  blockedId: number;
  emittedAt?: string;
};

const initialState: FriendshipState = {
  pairs: {},
  requestsById: {},
  lastSyncedAt: null,
};

const toPairKey = (targetAccountId: number): string => String(targetAccountId);

const toComparableTimestamp = (value?: string | null): number | null => {
  if (typeof value !== 'string' || value.trim().length === 0) {
    return null;
  }

  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? null : parsed;
};

const shouldApplyByRecency = (currentTimestamp?: string | null, incomingTimestamp?: string | null): boolean => {
  const incomingValue = toComparableTimestamp(incomingTimestamp);
  const currentValue = toComparableTimestamp(currentTimestamp);

  if (incomingValue === null || currentValue === null) {
    return true;
  }

  return incomingValue >= currentValue;
};

const createEmptyPairState = (targetAccountId: number): PairFriendshipState => ({
  targetAccountId,
  targetUser: undefined,
  relationshipState: null,
  blockedByMe: false,
  blockedByOther: false,
  pendingIncomingRequest: null,
  pendingOutgoingRequest: null,
  friendsSince: null,
  emittedAt: undefined,
  updatedAt: null,
});

const ensurePairState = (state: FriendshipState, targetAccountId: number): PairFriendshipState => {
  const key = toPairKey(targetAccountId);

  if (!state.pairs[key]) {
    state.pairs[key] = createEmptyPairState(targetAccountId);
  }

  return state.pairs[key];
};

const getTargetAccountIdFromRequest = (currentUserId: number, request: FriendRequest): number | null => {
  if (request.senderId === currentUserId) {
    return request.receiverId;
  }

  if (request.receiverId === currentUserId) {
    return request.senderId;
  }

  return null;
};

const mergeTargetUserSummary = (
  currentSummary: FriendUserSummary | undefined,
  incomingSummary: FriendUserSummary,
): FriendUserSummary => ({
  accountId: incomingSummary.accountId,
  displayName: incomingSummary.displayName ?? currentSummary?.displayName,
  fullName: incomingSummary.fullName ?? currentSummary?.fullName,
  username: incomingSummary.username ?? currentSummary?.username,
  avatar: incomingSummary.avatar ?? currentSummary?.avatar,
  headline: incomingSummary.headline ?? currentSummary?.headline,
  bio: incomingSummary.bio ?? currentSummary?.bio,
  coverPhoto: incomingSummary.coverPhoto ?? currentSummary?.coverPhoto,
  visibility: incomingSummary.visibility ?? currentSummary?.visibility ?? null,
});

const getTargetUserSummaryFromRequest = (
  currentUserId: number,
  request: FriendRequest,
): FriendUserSummary | undefined => {
  if (request.senderId === currentUserId) {
    return request.receiver ?? request.counterpart;
  }

  if (request.receiverId === currentUserId) {
    return request.sender ?? request.counterpart;
  }

  return request.counterpart;
};

const isPendingRequestForTarget = (request: FriendRequest, currentUserId: number, targetAccountId: number): boolean => {
  if (request.status !== FriendRequestStatus.PENDING) {
    return false;
  }

  const senderTargetMatch = request.senderId === currentUserId && request.receiverId === targetAccountId;
  const receiverTargetMatch = request.receiverId === currentUserId && request.senderId === targetAccountId;

  return senderTargetMatch || receiverTargetMatch;
};

const clearPendingRequestsForTarget = (
  state: FriendshipState,
  currentUserId: number,
  targetAccountId: number,
): void => {
  const removableRequestIds = Object.entries(state.requestsById)
    .filter(([, request]) => isPendingRequestForTarget(request, currentUserId, targetAccountId))
    .map(([requestId]) => requestId);

  removableRequestIds.forEach((requestId) => {
    delete state.requestsById[requestId];
  });
};

const attachPendingRequestToPair = (pair: PairFriendshipState, currentUserId: number, request: FriendRequest): void => {
  if (request.status !== FriendRequestStatus.PENDING) {
    if (pair.pendingIncomingRequest?.requestId === request.requestId) {
      pair.pendingIncomingRequest = null;
    }

    if (pair.pendingOutgoingRequest?.requestId === request.requestId) {
      pair.pendingOutgoingRequest = null;
    }

    return;
  }

  if (request.senderId === currentUserId) {
    pair.pendingOutgoingRequest = request;
    if (pair.pendingIncomingRequest?.requestId === request.requestId) {
      pair.pendingIncomingRequest = null;
    }
    return;
  }

  if (request.receiverId === currentUserId) {
    pair.pendingIncomingRequest = request;
    if (pair.pendingOutgoingRequest?.requestId === request.requestId) {
      pair.pendingOutgoingRequest = null;
    }
  }
};

const removeRequestFromPair = (pair: PairFriendshipState, requestId: number): void => {
  if (pair.pendingIncomingRequest?.requestId === requestId) {
    pair.pendingIncomingRequest = null;
  }

  if (pair.pendingOutgoingRequest?.requestId === requestId) {
    pair.pendingOutgoingRequest = null;
  }
};

const updatePairTimestamp = (pair: PairFriendshipState, emittedAt?: string | null): void => {
  if (typeof emittedAt === 'string' && emittedAt.trim().length > 0) {
    pair.updatedAt = emittedAt;
    pair.emittedAt = emittedAt;
    return;
  }

  const now = new Date().toISOString();
  pair.updatedAt = now;
  pair.emittedAt = now;
};

const setPairTargetUser = (pair: PairFriendshipState, targetUser?: FriendUserSummary): void => {
  if (!targetUser || targetUser.accountId !== pair.targetAccountId) {
    return;
  }

  pair.targetUser = mergeTargetUserSummary(pair.targetUser, targetUser);
};

const applyPairSnapshot = (state: FriendshipState, snapshot: PairFriendshipSnapshot): void => {
  const pair = ensurePairState(state, snapshot.targetAccountId);

  if (!shouldApplyByRecency(pair.updatedAt, snapshot.emittedAt)) {
    return;
  }

  pair.relationshipState = snapshot.relationshipState;
  pair.blockedByMe = snapshot.blockedByMe;
  pair.blockedByOther = snapshot.blockedByOther;
  pair.friendsSince = snapshot.friendsSince ?? null;
  setPairTargetUser(pair, snapshot.targetUser);

  if (snapshot.pendingIncomingRequest !== undefined) {
    pair.pendingIncomingRequest = snapshot.pendingIncomingRequest;

    if (snapshot.pendingIncomingRequest?.status === FriendRequestStatus.PENDING) {
      state.requestsById[String(snapshot.pendingIncomingRequest.requestId)] = snapshot.pendingIncomingRequest;
    }
  }

  if (snapshot.pendingOutgoingRequest !== undefined) {
    pair.pendingOutgoingRequest = snapshot.pendingOutgoingRequest;

    if (snapshot.pendingOutgoingRequest?.status === FriendRequestStatus.PENDING) {
      state.requestsById[String(snapshot.pendingOutgoingRequest.requestId)] = snapshot.pendingOutgoingRequest;
    }
  }

  updatePairTimestamp(pair, snapshot.emittedAt);
  state.lastSyncedAt = pair.updatedAt;
};

const clearPendingRequestsForCurrentUser = (
  state: FriendshipState,
  currentUserId: number,
  options?: {
    incoming?: boolean;
    outgoing?: boolean;
  },
): void => {
  const clearIncoming = options?.incoming ?? true;
  const clearOutgoing = options?.outgoing ?? true;

  const removableRequestIds = Object.entries(state.requestsById)
    .filter(([, request]) => {
      if (request.status !== FriendRequestStatus.PENDING) {
        return false;
      }

      const isIncoming = request.receiverId === currentUserId;
      const isOutgoing = request.senderId === currentUserId;

      return (clearIncoming && isIncoming) || (clearOutgoing && isOutgoing);
    })
    .map(([requestId]) => requestId);

  removableRequestIds.forEach((requestId) => {
    delete state.requestsById[requestId];
  });

  Object.values(state.pairs).forEach((pair) => {
    if (clearIncoming) {
      pair.pendingIncomingRequest = null;
    }

    if (clearOutgoing) {
      pair.pendingOutgoingRequest = null;
    }
  });
};

const friendshipSlice = createSlice({
  name: 'friendship',
  initialState,
  reducers: {
    upsertPairSnapshot: (state, action: PayloadAction<PairFriendshipSnapshot>) => {
      applyPairSnapshot(state, action.payload);
    },
    upsertPairSnapshots: (state, action: PayloadAction<PairFriendshipSnapshot[]>) => {
      action.payload.forEach((snapshot) => {
        applyPairSnapshot(state, snapshot);
      });
    },
    hydratePendingRequests: (state, action: PayloadAction<PendingRequestsHydrationPayload>) => {
      const {
        currentUserId,
        incoming = [],
        outgoing = [],
        replaceIncoming = true,
        replaceOutgoing = true,
        emittedAt,
      } = action.payload;

      clearPendingRequestsForCurrentUser(state, currentUserId, {
        incoming: replaceIncoming,
        outgoing: replaceOutgoing,
      });

      [...incoming, ...outgoing]
        .filter((request) => request.status === FriendRequestStatus.PENDING)
        .forEach((request) => {
          const targetAccountId = getTargetAccountIdFromRequest(currentUserId, request);

          if (targetAccountId === null) {
            return;
          }

          state.requestsById[String(request.requestId)] = request;

          const pair = ensurePairState(state, targetAccountId);
          attachPendingRequestToPair(pair, currentUserId, request);
          setPairTargetUser(pair, getTargetUserSummaryFromRequest(currentUserId, request));

          if (
            pair.relationshipState !== RelationshipState.BLOCKED &&
            pair.relationshipState !== RelationshipState.FRIEND
          ) {
            pair.relationshipState = null;
          }

          updatePairTimestamp(pair, emittedAt ?? request.respondedAt ?? request.requestedAt);
        });

      state.lastSyncedAt = emittedAt ?? new Date().toISOString();
    },
    friendRequestCreated: (state, action: PayloadAction<FriendRequestEventPayload>) => {
      const { currentUserId, request, emittedAt } = action.payload;

      if (request.status !== FriendRequestStatus.PENDING) {
        return;
      }

      const targetAccountId = getTargetAccountIdFromRequest(currentUserId, request);
      if (targetAccountId === null) {
        return;
      }

      const pair = ensurePairState(state, targetAccountId);
      if (!shouldApplyByRecency(pair.updatedAt, emittedAt ?? request.respondedAt ?? request.requestedAt)) {
        return;
      }

      state.requestsById[String(request.requestId)] = request;
      attachPendingRequestToPair(pair, currentUserId, request);
      setPairTargetUser(pair, getTargetUserSummaryFromRequest(currentUserId, request));

      if (pair.relationshipState !== RelationshipState.BLOCKED && pair.relationshipState !== RelationshipState.FRIEND) {
        pair.relationshipState = null;
      }

      updatePairTimestamp(pair, emittedAt ?? request.respondedAt ?? request.requestedAt);
      state.lastSyncedAt = pair.updatedAt;
    },
    friendRequestAccepted: (state, action: PayloadAction<FriendRequestEventPayload>) => {
      const { currentUserId, request, emittedAt, friendsSince } = action.payload;
      const targetAccountId = getTargetAccountIdFromRequest(currentUserId, request);

      if (targetAccountId === null) {
        return;
      }

      const pair = ensurePairState(state, targetAccountId);
      if (!shouldApplyByRecency(pair.updatedAt, emittedAt ?? request.respondedAt)) {
        return;
      }

      clearPendingRequestsForTarget(state, currentUserId, targetAccountId);
      removeRequestFromPair(pair, request.requestId);

      pair.pendingIncomingRequest = null;
      pair.pendingOutgoingRequest = null;
      pair.relationshipState = request.relationshipState ?? RelationshipState.FRIEND;
      pair.friendsSince = friendsSince ?? request.respondedAt ?? request.requestedAt ?? pair.friendsSince ?? null;
      setPairTargetUser(pair, getTargetUserSummaryFromRequest(currentUserId, request));

      updatePairTimestamp(pair, emittedAt ?? request.respondedAt);
      state.lastSyncedAt = pair.updatedAt;
    },
    friendRequestRejected: (state, action: PayloadAction<FriendRequestEventPayload>) => {
      const { currentUserId, request, emittedAt } = action.payload;
      const targetAccountId = getTargetAccountIdFromRequest(currentUserId, request);

      if (targetAccountId === null) {
        return;
      }

      const pair = ensurePairState(state, targetAccountId);
      if (!shouldApplyByRecency(pair.updatedAt, emittedAt ?? request.respondedAt)) {
        return;
      }

      delete state.requestsById[String(request.requestId)];
      removeRequestFromPair(pair, request.requestId);
      setPairTargetUser(pair, getTargetUserSummaryFromRequest(currentUserId, request));

      if (
        pair.relationshipState !== RelationshipState.FRIEND &&
        pair.relationshipState !== RelationshipState.BLOCKED &&
        !pair.pendingIncomingRequest &&
        !pair.pendingOutgoingRequest
      ) {
        pair.relationshipState = null;
      }

      updatePairTimestamp(pair, emittedAt ?? request.respondedAt);
      state.lastSyncedAt = pair.updatedAt;
    },
    friendRequestCanceled: (state, action: PayloadAction<FriendRequestEventPayload>) => {
      const { currentUserId, request, emittedAt } = action.payload;
      const targetAccountId = getTargetAccountIdFromRequest(currentUserId, request);

      if (targetAccountId === null) {
        return;
      }

      const pair = ensurePairState(state, targetAccountId);
      if (!shouldApplyByRecency(pair.updatedAt, emittedAt ?? request.respondedAt)) {
        return;
      }

      delete state.requestsById[String(request.requestId)];
      removeRequestFromPair(pair, request.requestId);
      setPairTargetUser(pair, getTargetUserSummaryFromRequest(currentUserId, request));

      if (
        pair.relationshipState !== RelationshipState.FRIEND &&
        pair.relationshipState !== RelationshipState.BLOCKED &&
        !pair.pendingIncomingRequest &&
        !pair.pendingOutgoingRequest
      ) {
        pair.relationshipState = null;
      }

      updatePairTimestamp(pair, emittedAt ?? request.respondedAt);
      state.lastSyncedAt = pair.updatedAt;
    },
    userBlocked: (state, action: PayloadAction<BlockEventPayload>) => {
      const { currentUserId, blockerId, blockedId, emittedAt } = action.payload;

      if (blockerId !== currentUserId && blockedId !== currentUserId) {
        return;
      }

      const targetAccountId = blockerId === currentUserId ? blockedId : blockerId;
      const pair = ensurePairState(state, targetAccountId);

      if (!shouldApplyByRecency(pair.updatedAt, emittedAt)) {
        return;
      }

      if (blockerId === currentUserId) {
        pair.blockedByMe = true;
      }

      if (blockedId === currentUserId) {
        pair.blockedByOther = true;
      }

      pair.relationshipState = RelationshipState.BLOCKED;
      pair.pendingIncomingRequest = null;
      pair.pendingOutgoingRequest = null;
      clearPendingRequestsForTarget(state, currentUserId, targetAccountId);

      updatePairTimestamp(pair, emittedAt);
      state.lastSyncedAt = pair.updatedAt;
    },
    userUnblocked: (state, action: PayloadAction<BlockEventPayload>) => {
      const { currentUserId, blockerId, blockedId, emittedAt } = action.payload;

      if (blockerId !== currentUserId && blockedId !== currentUserId) {
        return;
      }

      const targetAccountId = blockerId === currentUserId ? blockedId : blockerId;
      const pair = ensurePairState(state, targetAccountId);

      if (!shouldApplyByRecency(pair.updatedAt, emittedAt)) {
        return;
      }

      if (blockerId === currentUserId) {
        pair.blockedByMe = false;
      }

      if (blockedId === currentUserId) {
        pair.blockedByOther = false;
      }

      if (!pair.blockedByMe && !pair.blockedByOther && pair.relationshipState === RelationshipState.BLOCKED) {
        pair.relationshipState = null;
      }

      updatePairTimestamp(pair, emittedAt);
      state.lastSyncedAt = pair.updatedAt;
    },
    clearFriendshipState: () => initialState,
  },
  extraReducers: (builder) => {
    builder.addCase(clearUser, () => initialState);
  },
});

export const {
  upsertPairSnapshot,
  upsertPairSnapshots,
  hydratePendingRequests,
  friendRequestCreated,
  friendRequestAccepted,
  friendRequestRejected,
  friendRequestCanceled,
  userBlocked,
  userUnblocked,
  clearFriendshipState,
} = friendshipSlice.actions;

export const useFriendshipSlice = () => useAppSelector((state) => state.friendship);

export const selectPairFriendshipByTarget = (
  state: RootState,
  targetAccountId: number,
): PairFriendshipState | undefined => {
  return state.friendship.pairs[toPairKey(targetAccountId)];
};

const sortFriendPairsByRecent = (a: PairFriendshipState, b: PairFriendshipState): number => {
  const left = Date.parse(a.friendsSince ?? a.updatedAt ?? '');
  const right = Date.parse(b.friendsSince ?? b.updatedAt ?? '');

  if (Number.isNaN(left) && Number.isNaN(right)) {
    return b.targetAccountId - a.targetAccountId;
  }

  if (Number.isNaN(left)) {
    return 1;
  }

  if (Number.isNaN(right)) {
    return -1;
  }

  return right - left;
};

export const selectFriendPairs = (state: RootState): PairFriendshipState[] => {
  return Object.values(state.friendship.pairs)
    .filter((pair) => pair.relationshipState === RelationshipState.FRIEND)
    .sort(sortFriendPairsByRecent);
};

const sortByNewest = (a: FriendRequest, b: FriendRequest): number => {
  const left = Date.parse(a.respondedAt ?? a.requestedAt ?? '');
  const right = Date.parse(b.respondedAt ?? b.requestedAt ?? '');

  if (Number.isNaN(left) && Number.isNaN(right)) {
    return b.requestId - a.requestId;
  }

  if (Number.isNaN(left)) {
    return 1;
  }

  if (Number.isNaN(right)) {
    return -1;
  }

  return right - left;
};

export const selectPendingIncomingRequests = (state: RootState, currentUserId: number): FriendRequest[] => {
  return Object.values(state.friendship.requestsById)
    .filter((request) => request.status === FriendRequestStatus.PENDING && request.receiverId === currentUserId)
    .sort(sortByNewest);
};

export const selectPendingOutgoingRequests = (state: RootState, currentUserId: number): FriendRequest[] => {
  return Object.values(state.friendship.requestsById)
    .filter((request) => request.status === FriendRequestStatus.PENDING && request.senderId === currentUserId)
    .sort(sortByNewest);
};

export default friendshipSlice.reducer;
