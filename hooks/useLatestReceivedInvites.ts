import { useUser } from '@/hooks/useUser';
import { selectPendingIncomingRequests } from '@/lib/features/friendshipSlice';
import { useAppSelector } from '@/lib/hooks';
import type { FriendRequest } from '@/services/friendship/friendshipType';
import { FriendRequestCardViewModel, toFriendRequestCardViewModel } from '@/utils/friendshipRequestViewModel';
import { useMemo } from 'react';

const EMPTY_REQUESTS: FriendRequest[] = [];

export type UseLatestReceivedInvitesResult = {
  isSignedIn: boolean;
  invites: FriendRequestCardViewModel[];
  showViewAll: boolean;
};

export default function useLatestReceivedInvites(): UseLatestReceivedInvitesResult {
  const { user, isSignedIn } = useUser();
  const currentUserId = user?.accountId ?? 0;

  const incomingRequests = useAppSelector((state) =>
    currentUserId > 0 ? selectPendingIncomingRequests(state, currentUserId) : EMPTY_REQUESTS,
  );

  const invites = useMemo(() => {
    return incomingRequests.slice(0, 3).map((request) => toFriendRequestCardViewModel(request, true));
  }, [incomingRequests]);

  return {
    isSignedIn,
    invites,
    showViewAll: incomingRequests.length > 3,
  };
}
