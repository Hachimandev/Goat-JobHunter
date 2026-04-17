'use client';

import { useEffect } from 'react';
import { useUser } from '@/hooks/useUser';
import { messageTextService } from '@/services/socket/socketClient';

export default function MessageTextListener() {
  const { isSignedIn, user } = useUser();

  useEffect(() => {
    if (!isSignedIn || !user) {
      messageTextService.disconnect();
      return;
    }

    messageTextService.connect();

    return () => {
      messageTextService.disconnect();
    };
  }, [isSignedIn, user]);

  return null;
}
