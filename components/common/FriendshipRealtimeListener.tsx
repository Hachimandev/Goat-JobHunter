'use client';

import { useUser } from '@/hooks/useUser';
import {
  useGetMyFriendshipsQuery,
  useGetMyReceivedFriendRequestsQuery,
  useGetMySentFriendRequestsQuery,
} from '@/services/friendship/friendshipApi';
import { useSubscribeFriendshipEventsQuery } from '@/services/friendship/friendshipRealtimeApi';

export default function FriendshipRealtimeListener() {
  const { isSignedIn, user } = useUser();
  const skip = !isSignedIn || !user;

  useGetMyFriendshipsQuery(undefined, { skip });
  useGetMyReceivedFriendRequestsQuery(undefined, { skip });
  useGetMySentFriendRequestsQuery(undefined, { skip });

  useSubscribeFriendshipEventsQuery(undefined, {
    skip,
  });

  return null;
}
