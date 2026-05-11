import { useMemo } from "react";
import { useUser } from "@/hooks/useUser";
import {
  useCheckPairStatusQuery,
  useGetMySentFriendRequestsQuery,
  useGetMyReceivedFriendRequestsQuery,
} from "@/services/friendship/friendshipApi";
import { RelationshipState } from "@/services/friendship/friendshipType";

export function useFriendshipStatus(targetAccountId: number) {
  const { user, isSignedIn } = useUser();
  const isSelf = user?.accountId === targetAccountId;

  const { data, isLoading, isFetching } = useCheckPairStatusQuery(
    targetAccountId,
    {
      skip: !isSignedIn || !targetAccountId,
    },
  );

  const { data: sentRequests } = useGetMySentFriendRequestsQuery(
    { size: 1000 },
    {
      skip: !isSignedIn,
    },
  );

  const { data: receivedRequests } = useGetMyReceivedFriendRequestsQuery(
    { size: 1000 },
    {
      skip: !isSignedIn,
    },
  );

  const pair = data?.data ?? null;
  const relationshipState = pair?.relationshipState ?? RelationshipState.NONE;
  const isBlockedByMe = pair?.blockedByMe ?? false;
  const isBlockedByOther = pair?.blockedByOther ?? false;
  const isBlockedAnyDirection =
    relationshipState === RelationshipState.BLOCKED ||
    isBlockedByMe ||
    isBlockedByOther;
  const isFriend = relationshipState === RelationshipState.FRIEND;

  const hasSentRequest =
    sentRequests?.data?.result?.some(
      (req) =>
        req.status === "PENDING" &&
        req.counterpart.accountId === targetAccountId,
    ) ?? false;
  const hasReceivedRequest =
    receivedRequests?.data?.result?.some(
      (req) =>
        req.status === "PENDING" &&
        req.counterpart.accountId === targetAccountId,
    ) ?? false;

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
      false,
    [isSelf, isSignedIn, relationshipState],
  );

  const isLoadingPair = isLoading || isFetching;

  return {
    targetAccountId,
    pair,
    isSelf,
    isFriend,
    hasSentRequest,
    hasReceivedRequest,
    isBlockedByMe,
    isBlockedByOther,
    isBlockedAnyDirection,
    canSendRequest,
    canAccept,
    canReject: false,
    canCancel: false,
    canBlock: !isSelf && isSignedIn && !isBlockedAnyDirection,
    canUnblock: !isSelf && isSignedIn && isBlockedByMe,
    isLoadingPair,
  };
}
