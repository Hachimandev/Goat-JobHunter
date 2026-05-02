'use client';

import { useEffect, useState } from 'react';
import { useAuthSlice } from '@/lib/features/authSlice';
import { Client, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import axiosClient from '@/services/axios';

export interface PresenceStatus {
  accountId: number;
  online: boolean;
  lastHeartbeatAt?: string;
}

type PresenceListener = (status: PresenceStatus) => void;

const listenersByAccount = new Map<number, Set<PresenceListener>>();
const subscriptionsByAccount = new Map<number, StompSubscription>();
let presenceClient: Client | null = null;
let isClientConnected = false;

const getSocketUrl = () => process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000/ws';

const subscribeTopicForAccount = (accountId: number) => {
  if (!presenceClient?.connected || subscriptionsByAccount.has(accountId)) {
    return;
  }

  const subscription = presenceClient.subscribe(`/topic/presence/${accountId}`, (msg) => {
    const data = JSON.parse(msg.body) as PresenceStatus;
    const listeners = listenersByAccount.get(accountId);

    if (!listeners) {
      return;
    }

    listeners.forEach((listener) => listener(data));
  });

  subscriptionsByAccount.set(accountId, subscription);
};

const ensurePresenceClient = () => {
  if (presenceClient) {
    return;
  }

  presenceClient = new Client({
    webSocketFactory: () => new SockJS(getSocketUrl()),
    reconnectDelay: 5000,
    debug: () => {},
    onConnect: () => {
      isClientConnected = true;
      listenersByAccount.forEach((_, accountId) => {
        subscribeTopicForAccount(accountId);
      });
    },
    onDisconnect: () => {
      isClientConnected = false;
      subscriptionsByAccount.clear();
    },
    onWebSocketClose: () => {
      isClientConnected = false;
      subscriptionsByAccount.clear();
    },
  });

  presenceClient.activate();
};

const fetchInitialPresence = async (accountId: number, onUpdate: PresenceListener) => {
  try {
    const response = await axiosClient.get(`/presence/${accountId}`);
    const payload = (response.data?.data ?? response.data) as PresenceStatus;

    if (payload && typeof payload.online === 'boolean') {
      onUpdate(payload);
    }
  } catch {
    onUpdate({
      accountId,
      online: false,
    });
  }
};

export function usePresenceStatus(accountId: number | null | undefined) {
  const [presence, setPresence] = useState<PresenceStatus | null>(null);
  const { isAuthenticated } = useAuthSlice();

  useEffect(() => {
    if (!accountId || !isAuthenticated) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPresence(null);
      return;
    }

    const listener: PresenceListener = (status) => {
      setPresence(status);
    };

    let listeners = listenersByAccount.get(accountId);
    if (!listeners) {
      listeners = new Set<PresenceListener>();
      listenersByAccount.set(accountId, listeners);
    }
    listeners.add(listener);

    fetchInitialPresence(accountId, listener);

    ensurePresenceClient();
    if (isClientConnected) {
      subscribeTopicForAccount(accountId);
    }

    return () => {
      const accountListeners = listenersByAccount.get(accountId);
      if (!accountListeners) {
        return;
      }

      accountListeners.delete(listener);

      if (accountListeners.size === 0) {
        listenersByAccount.delete(accountId);

        const sub = subscriptionsByAccount.get(accountId);
        if (sub) {
          sub.unsubscribe();
          subscriptionsByAccount.delete(accountId);
        }
      }
    };
  }, [accountId, isAuthenticated]);

  return presence;
}
