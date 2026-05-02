'use client';

import { useEffect } from 'react';
import { useAuthSlice } from '@/lib/features/authSlice';
import { connectWebSocketPresence, disconnectWebSocketPresence } from '@/services/socket/WebSocketPresenceService';

export default function PresenceListener() {
  const { isAuthenticated, user } = useAuthSlice();
  const accountId = typeof user?.accountId === 'number' ? user.accountId : null;

  useEffect(() => {
    if (!isAuthenticated || accountId == null) {
      disconnectWebSocketPresence(false);
      return;
    }

    connectWebSocketPresence();

    return () => {
      disconnectWebSocketPresence(true);
    };
  }, [accountId, isAuthenticated]);

  return null;
}
