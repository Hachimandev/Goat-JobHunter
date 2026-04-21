'use client';

import { useUser } from '@/hooks/useUser';
import { useSubscribeCallEventsQuery } from '@/services/chatRoom/call/callRealtimeApi';
import IncomingCallDialog from '@/components/common/IncomingCallDialog';

export default function CallRealtimeListener() {
  const { isSignedIn, user } = useUser();
  const skip = !isSignedIn || !user;

  useSubscribeCallEventsQuery(undefined, {
    skip,
  });

  if (skip) {
    return null;
  }

  return <IncomingCallDialog />;
}
