'use client';

import { useUser } from '@/hooks/useUser';
import { useSubscribeFriendshipEventsQuery } from '@/services/friendship/friendshipRealtimeApi';

export default function FriendshipRealtimeListener() {
  const { isSignedIn, user } = useUser();

  useSubscribeFriendshipEventsQuery(undefined, {
    skip: !isSignedIn || !user,
  });

  return null;
}
