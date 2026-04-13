import { useUser } from '@/hooks/useUser';
import { useAppSelector } from '@/lib/hooks';
import {
  useGetMyFriendshipsQuery,
  useGetMyReceivedFriendRequestsQuery,
  useGetMySentFriendRequestsQuery,
} from '@/services/friendship/friendshipApi';
import { FRIENDSHIP_DEFAULT_PAGE, FriendshipUiState } from '@/services/friendship/friendshipType';
import { deriveFriendshipUiState } from '@/utils/friendshipUtils';

const STATUS_HYDRATION_SIZE = 100;
const FRIENDS_STATUS_SORT = ['friendsSince,desc', 'relationshipId,desc'];
const REQUEST_STATUS_SORT = ['requestedAt,desc', 'requestId,desc'];

export function useFriendshipStatus(targetAccountId?: number | null) {
  const { user, isSignedIn } = useUser();

  const normalizedTargetAccountId = Number(targetAccountId);
  const isValidTarget = Number.isFinite(normalizedTargetAccountId) && normalizedTargetAccountId > 0;
  const isSelf = user?.accountId === normalizedTargetAccountId;

  const shouldHydrateReadData = Boolean(isSignedIn && user);

  const { isLoading: isLoadingFriendships, isFetching: isFetchingFriendships } = useGetMyFriendshipsQuery(
    {
      page: FRIENDSHIP_DEFAULT_PAGE,
      size: STATUS_HYDRATION_SIZE,
      sort: FRIENDS_STATUS_SORT,
    },
    {
      skip: !shouldHydrateReadData,
    },
  );
  const { isLoading: isLoadingReceived, isFetching: isFetchingReceived } = useGetMyReceivedFriendRequestsQuery(
    {
      page: FRIENDSHIP_DEFAULT_PAGE,
      size: STATUS_HYDRATION_SIZE,
      sort: REQUEST_STATUS_SORT,
    },
    {
      skip: !shouldHydrateReadData,
    },
  );
  const { isLoading: isLoadingSent, isFetching: isFetchingSent } = useGetMySentFriendRequestsQuery(
    {
      page: FRIENDSHIP_DEFAULT_PAGE,
      size: STATUS_HYDRATION_SIZE,
      sort: REQUEST_STATUS_SORT,
    },
    {
      skip: !shouldHydrateReadData,
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

  const isLoadingPair =
    !isSelf &&
    isValidTarget &&
    shouldHydrateReadData &&
    (isLoadingFriendships ||
      isFetchingFriendships ||
      isLoadingReceived ||
      isFetchingReceived ||
      isLoadingSent ||
      isFetchingSent);

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
    isLoadingPair,
  };
}
