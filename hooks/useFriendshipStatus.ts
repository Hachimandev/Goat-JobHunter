import { useUser } from '@/hooks/useUser';
import { useAppSelector } from '@/lib/hooks';
import { useGetFriendshipWithUserQuery } from '@/services/friendship/friendshipApi';
import { deriveFriendshipUiState, FriendshipUiState } from '@/services/friendship/friendshipType';

const ENABLE_FRIENDSHIP_READ_API = process.env.NEXT_PUBLIC_FRIENDSHIP_READ_API_ENABLED === 'true';

export function useFriendshipStatus(targetAccountId?: number | null) {
  const { user, isSignedIn } = useUser();

  const normalizedTargetAccountId = Number(targetAccountId);
  const isValidTarget = Number.isFinite(normalizedTargetAccountId) && normalizedTargetAccountId > 0;
  const isSelf = user?.accountId === normalizedTargetAccountId;

  const shouldFetch = Boolean(ENABLE_FRIENDSHIP_READ_API && isSignedIn && user && isValidTarget && !isSelf);

  const { isLoading: isLoadingPair, isFetching: isFetchingPair } = useGetFriendshipWithUserQuery(
    normalizedTargetAccountId,
    {
      skip: !shouldFetch,
    },
  );

  const pair = useAppSelector((state) =>
    isValidTarget ? state.friendship.pairs[String(normalizedTargetAccountId)] : undefined,
  );

  const uiState = isSelf ? FriendshipUiState.NOT_FRIEND : deriveFriendshipUiState(pair);

  const incomingRequestId = pair?.pendingIncomingRequest?.requestId ?? null;
  const outgoingRequestId = pair?.pendingOutgoingRequest?.requestId ?? null;
  const isBlockedByMe = pair?.blockedByMe ?? false;
  const isBlockedByOther = pair?.blockedByOther ?? false;

  const isBlockedAnyDirection = uiState === FriendshipUiState.BLOCKED || isBlockedByMe || isBlockedByOther;

  const canSendRequest =
    !isSelf && isSignedIn && isValidTarget && uiState === FriendshipUiState.NOT_FRIEND && !isBlockedAnyDirection;

  const canAccept = uiState === FriendshipUiState.PENDING_RECEIVED && incomingRequestId !== null;
  const canReject = uiState === FriendshipUiState.PENDING_RECEIVED && incomingRequestId !== null;
  const canCancel = uiState === FriendshipUiState.PENDING_SENT && outgoingRequestId !== null;

  return {
    targetAccountId: isValidTarget ? normalizedTargetAccountId : null,
    pair,
    uiState,
    incomingRequestId,
    outgoingRequestId,
    isBlockedByMe,
    isBlockedByOther,
    isBlockedAnyDirection,
    isFriend: uiState === FriendshipUiState.FRIEND,
    isSelf,
    canSendRequest,
    canAccept,
    canReject,
    canCancel,
    isLoadingPair: isLoadingPair || isFetchingPair,
  };
}
