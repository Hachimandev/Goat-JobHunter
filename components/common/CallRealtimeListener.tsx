'use client';

import { useUser } from '@/hooks/useUser';
import { useSubscribeCallEventsQuery } from '@/services/chatRoom/call/callRealtimeApi';
import IncomingCallDialog from '@/components/common/IncomingCallDialog';
import { useParams } from 'next/navigation';

export default function CallRealtimeListener() {
  const { isSignedIn, user } = useUser();
  const params = useParams();
  const parsedChatRoomId = Number(params?.id);
  const hasValidChatRoomId = Number.isFinite(parsedChatRoomId) && parsedChatRoomId > 0;
  const skip = !isSignedIn || !user || !hasValidChatRoomId;

  useSubscribeCallEventsQuery(parsedChatRoomId, {
    skip,
  });

  if (skip) {
    return null;
  }

  return <IncomingCallDialog />;
}
