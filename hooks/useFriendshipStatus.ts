import { useMemo } from "react";
import { useUser } from "@/hooks/useUser";
import { useCheckPairStatusQuery } from "@/services/friendship/friendshipApi";
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

  const pair = data?.data ?? null;
  const relationshipState = pair?.relationshipState ?? RelationshipState.NONE;
  const isBlockedByMe = pair?.blockedByMe ?? false;
  const isBlockedByOther = pair?.blockedByOther ?? false;
  const isBlockedAnyDirection =
    relationshipState === RelationshipState.BLOCKED ||
    isBlockedByMe ||
    isBlockedByOther;
  const isFriend = relationshipState === RelationshipState.FRIEND;

  const canSendRequest = useMemo(
    () => !isSelf && isSignedIn && !isFriend && !isBlockedAnyDirection,
    [isSelf, isSignedIn, isFriend, isBlockedAnyDirection],
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
