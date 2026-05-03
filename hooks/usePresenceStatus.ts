'use client';

import { useEffect, useRef, useState } from 'react';
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
const refreshTimersByAccount = new Map<number, ReturnType<typeof setInterval>>();
let presenceClient: Client | null = null;
let isClientConnected = false;

const REFRESH_INTERVAL_MS = 5000;

const getSocketUrl = () => process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000/ws';

const notifyPresenceListeners = (accountId: number, status: PresenceStatus) => {
  const listeners = listenersByAccount.get(accountId);

  if (!listeners) {
    return;
  }

  listeners.forEach((listener) => listener(status));
};

const subscribeTopicForAccount = (accountId: number) => {
  if (!presenceClient?.connected || subscriptionsByAccount.has(accountId)) {
    return;
  }

  const subscription = presenceClient.subscribe(`/topic/presence/${accountId}`, (msg) => {
    const data = JSON.parse(msg.body) as PresenceStatus;
    notifyPresenceListeners(accountId, data);
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
        fetchInitialPresence(accountId, (status) => notifyPresenceListeners(accountId, status));
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

const startPresenceRefresh = (accountId: number) => {
  if (refreshTimersByAccount.has(accountId)) {
    return;
  }

  const timer = setInterval(() => {
    const listeners = listenersByAccount.get(accountId);

    if (!listeners || listeners.size === 0) {
      stopPresenceRefresh(accountId);
      return;
    }

    fetchInitialPresence(accountId, (status) => notifyPresenceListeners(accountId, status));
  }, REFRESH_INTERVAL_MS);

  refreshTimersByAccount.set(accountId, timer);
};

const stopPresenceRefresh = (accountId: number) => {
  const timer = refreshTimersByAccount.get(accountId);

  if (timer) {
    clearInterval(timer);
    refreshTimersByAccount.delete(accountId);
  }
};

export function usePresenceStatus(accountId: number | null | undefined) {
  const [presence, setPresence] = useState<PresenceStatus | null>(null);
  const lastSeenAtRef = useRef<string | undefined>(undefined);
  const { isAuthenticated } = useAuthSlice();

  useEffect(() => {
    if (!accountId || !isAuthenticated) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPresence(null);
      return;
    }

    const listener: PresenceListener = (status) => {
      if (status.lastHeartbeatAt) {
        lastSeenAtRef.current = status.lastHeartbeatAt;
      }

      setPresence((prev) => {
        if (!prev) {
          return {
            ...status,
            lastHeartbeatAt: status.lastHeartbeatAt ?? lastSeenAtRef.current,
          };
        }

        if (status && status.online === false && !status.lastHeartbeatAt && lastSeenAtRef.current) {
          return {
            ...status,
            lastHeartbeatAt: lastSeenAtRef.current,
          };
        }

        return {
          ...status,
          lastHeartbeatAt: status.lastHeartbeatAt ?? prev.lastHeartbeatAt ?? lastSeenAtRef.current,
        };
      });
    };

    let listeners = listenersByAccount.get(accountId);
    if (!listeners) {
      listeners = new Set<PresenceListener>();
      listenersByAccount.set(accountId, listeners);
    }
    listeners.add(listener);

    fetchInitialPresence(accountId, listener);
    startPresenceRefresh(accountId);

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
        stopPresenceRefresh(accountId);

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
