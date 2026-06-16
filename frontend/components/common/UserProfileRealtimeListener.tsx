'use client';

import { useUser } from '@/hooks/useUser';
import { useSubscribeUserProfileUpdatesQuery } from '@/services/user/userProfileRealtimeApi';

export default function UserProfileRealtimeListener() {
  const { isSignedIn, user } = useUser();

  useSubscribeUserProfileUpdatesQuery(undefined, {
    skip: !isSignedIn || !user,
  });

  return null;
}
