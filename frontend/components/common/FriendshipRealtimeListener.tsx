'use client';

import { useUser } from '@/hooks/useUser';
import {
  useGetMyFriendshipsQuery,
  useGetMyReceivedFriendRequestsQuery,
  useGetMySentFriendRequestsQuery,
} from '@/services/friendship/friendshipApi';
import { FRIENDSHIP_DEFAULT_PAGE } from '@/services/friendship/friendshipType';
import { useSubscribeFriendshipEventsQuery } from '@/services/friendship/friendshipRealtimeApi';

const REALTIME_HYDRATION_SIZE = 100;
const FRIENDS_REALTIME_SORT = ['friendsSince,desc', 'relationshipId,desc'];
const REQUEST_REALTIME_SORT = ['requestedAt,desc', 'requestId,desc'];

export default function FriendshipRealtimeListener() {
  const { isSignedIn, user } = useUser();
  const skip = !isSignedIn || !user;

  useGetMyFriendshipsQuery(
    {
      page: FRIENDSHIP_DEFAULT_PAGE,
      size: REALTIME_HYDRATION_SIZE,
      sort: FRIENDS_REALTIME_SORT,
    },
    { skip },
  );

  useGetMyReceivedFriendRequestsQuery(
    {
      page: FRIENDSHIP_DEFAULT_PAGE,
      size: REALTIME_HYDRATION_SIZE,
      sort: REQUEST_REALTIME_SORT,
    },
    { skip },
  );

  useGetMySentFriendRequestsQuery(
    {
      page: FRIENDSHIP_DEFAULT_PAGE,
      size: REALTIME_HYDRATION_SIZE,
      sort: REQUEST_REALTIME_SORT,
    },
    { skip },
  );

  useSubscribeFriendshipEventsQuery(undefined, {
    skip,
  });

  return null;
}
