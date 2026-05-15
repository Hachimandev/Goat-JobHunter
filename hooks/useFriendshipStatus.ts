import { useMemo } from "react";
import { useUser } from "@/hooks/useUser";
import {
  useGetMyBlockedUsersQuery,
  useGetMyFriendshipsQuery,
  useGetMySentFriendRequestsQuery,
  useGetMyReceivedFriendRequestsQuery,
} from "@/services/friendship/friendshipApi";
import { RelationshipState } from "@/services/friendship/friendshipType";

const STATUS_PAGE_SIZE = 1000;

export function useFriendshipStatus(targetAccountId: number) {
  const { user, isSignedIn } = useUser();
  const isSelf = user?.accountId === targetAccountId;
  const shouldFetch = Boolean(isSignedIn && targetAccountId && !isSelf);

  const {
    data: friendships,
    isLoading: isLoadingFriendships,
    isFetching: isFetchingFriendships,
  } = useGetMyFriendshipsQuery(
    { size: STATUS_PAGE_SIZE },
    {
      skip: !shouldFetch,
    },
  );

  const {
    data: blockedUsers,
    isLoading: isLoadingBlocked,
    isFetching: isFetchingBlocked,
  } = useGetMyBlockedUsersQuery(
    { page: 1, size: STATUS_PAGE_SIZE },
    {
      skip: !shouldFetch,
    },
  );

  const {
    data: sentRequests,
    isLoading: isLoadingSent,
    isFetching: isFetchingSent,
  } = useGetMySentFriendRequestsQuery(
    { size: STATUS_PAGE_SIZE },
    {
      skip: !shouldFetch,
    },
  );

  const {
    data: receivedRequests,
    isLoading: isLoadingReceived,
    isFetching: isFetchingReceived,
  } = useGetMyReceivedFriendRequestsQuery(
    { size: STATUS_PAGE_SIZE },
    {
      skip: !shouldFetch,
    },
  );

  const friendship = friendships?.data?.result?.find(
    (item) => item.friend.accountId === targetAccountId,
  );
  const blockedUser = blockedUsers?.data?.result?.find(
    (item) => item.accountId === targetAccountId,
  );
  const outgoingRequest = sentRequests?.data?.result?.find(
    (req) =>
      req.status === "PENDING" &&
      req.counterpart.accountId === targetAccountId,
  );
  const incomingRequest = receivedRequests?.data?.result?.find(
    (req) =>
      req.status === "PENDING" &&
      req.counterpart.accountId === targetAccountId,
  );

  const isFriend = Boolean(friendship);
  const isBlockedByMe = Boolean(blockedUser);
  const isBlockedByOther = false;
  const isBlockedAnyDirection = isBlockedByMe || isBlockedByOther;
  const hasSentRequest = Boolean(outgoingRequest);
  const hasReceivedRequest = Boolean(incomingRequest);
  const relationshipState = isBlockedByMe
    ? RelationshipState.BLOCKED
    : isFriend
      ? RelationshipState.FRIEND
      : RelationshipState.NONE;

  const canSendRequest = useMemo(
    () =>
      !isSelf &&
      isSignedIn &&
      !isFriend &&
      !isBlockedAnyDirection &&
      !hasSentRequest &&
      !hasReceivedRequest,
    [
      isSelf,
      isSignedIn,
      isFriend,
      isBlockedAnyDirection,
      hasSentRequest,
      hasReceivedRequest,
    ],
  );

  const canAccept = useMemo(
    () =>
      !isSelf &&
      isSignedIn &&
      relationshipState === RelationshipState.NONE &&
      Boolean(incomingRequest?.requestId),
    [isSelf, isSignedIn, relationshipState, incomingRequest?.requestId],
  );

  const canReject = canAccept;
  const canCancel = useMemo(
    () =>
      !isSelf &&
      isSignedIn &&
      relationshipState === RelationshipState.NONE &&
      Boolean(outgoingRequest?.requestId),
    [isSelf, isSignedIn, relationshipState, outgoingRequest?.requestId],
  );

  const isLoadingPair =
    shouldFetch &&
    (isLoadingFriendships ||
      isFetchingFriendships ||
      isLoadingBlocked ||
      isFetchingBlocked ||
      isLoadingSent ||
      isFetchingSent ||
      isLoadingReceived ||
      isFetchingReceived);

  return {
    targetAccountId,
    pair: {
      accountId: user?.accountId,
      targetAccountId,
      relationshipState,
      blockedByMe: isBlockedByMe,
      blockedByOther: isBlockedByOther,
    },
    incomingRequestId: incomingRequest?.requestId ?? null,
    outgoingRequestId: outgoingRequest?.requestId ?? null,
    isSelf,
    isFriend,
    hasSentRequest,
    hasReceivedRequest,
    isBlockedByMe,
    isBlockedByOther,
    isBlockedAnyDirection,
    canSendRequest,
    canAccept,
    canReject,
    canCancel,
    canBlock: !isSelf && isSignedIn && !isBlockedAnyDirection,
    canUnblock: !isSelf && isSignedIn && isBlockedByMe,
    isLoadingPair,
  };
}
