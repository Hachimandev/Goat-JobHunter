import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import { store } from '@/lib/store';

let stompClient: Client | null = null;
let heartbeatTimer: ReturnType<typeof setInterval> | null = null;
let currentAccountId: number | null = null;

const HEARTBEAT_INTERVAL_MS = 15000;

const getCurrentAccountId = () => {
  const { user, isAuthenticated } = store.getState().auth;
  return isAuthenticated && user && typeof user.accountId === 'number' ? user.accountId : null;
};

const publishHeartbeat = () => {
  if (!stompClient?.connected || currentAccountId == null) {
    return;
  }

  stompClient.publish({
    destination: '/app/presence/heartbeat',
    body: JSON.stringify({ accountId: currentAccountId }),
  });
};

const publishOffline = () => {
  if (!stompClient?.connected || currentAccountId == null) {
    return;
  }

  stompClient.publish({
    destination: '/app/presence/offline',
    body: JSON.stringify({ accountId: currentAccountId }),
  });
};

const stopHeartbeat = () => {
  if (heartbeatTimer) {
    clearInterval(heartbeatTimer);
    heartbeatTimer = null;
  }
};

export function connectWebSocketPresence() {
  const accountId = getCurrentAccountId();

  if (accountId == null) {
    return;
  }

  if (stompClient?.connected && currentAccountId === accountId) {
    return;
  }

  if (stompClient) {
    disconnectWebSocketPresence(false);
  }

  currentAccountId = accountId;

  const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000/ws';

  stompClient = new Client({
    webSocketFactory: () => new SockJS(socketUrl),
    reconnectDelay: 5000,
    heartbeatIncoming: 10000,
    heartbeatOutgoing: 10000,
    debug: (str) => console.log('[STOMP Presence]', str),
    onConnect: () => {
      console.log('✅ Connected WebSocket Presence');

      publishHeartbeat();
      stopHeartbeat();
      heartbeatTimer = setInterval(publishHeartbeat, HEARTBEAT_INTERVAL_MS);
    },
    onWebSocketClose: () => {
      stopHeartbeat();
      console.log('⚠️ WebSocket Presence closed');
    },
  });

  stompClient.activate();
}

export function disconnectWebSocketPresence(forceOffline = true) {
  if (forceOffline) {
    publishOffline();
  }

  stopHeartbeat();

  if (stompClient) {
    stompClient.deactivate();
    stompClient = null;
    console.log('🔌 WebSocket Presence disconnected');
  }

  currentAccountId = null;
}
