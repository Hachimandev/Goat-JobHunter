import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { UnknownAction } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import {
  friendRequestAccepted,
  friendRequestCanceled,
  friendRequestCreated,
  friendRequestRejected,
} from '@/lib/features/friendshipSlice';
import { store } from '@/lib/store';
import { FriendRequestStatus } from '@/services/friendship/friendshipType';
import { normalizeFriendRequestFromEventData, parseFriendshipEventEnvelope } from '@/utils/friendshipUtils';

const FRIENDSHIP_EVENT_DESTINATIONS = ['/user/queue/friendships'] as const;

export class WebSocketFriendshipService {
  private client: Client | null = null;
  private subscribedDestinations = new Set<string>();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(private readonly dispatch: ThunkDispatch<any, any, UnknownAction>) {}

  connect() {
    this.client = new Client({
      webSocketFactory: () => new SockJS(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000/ws'),
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      debug: (str) => console.log('[STOMP Friendship]', str),
      beforeConnect: this.beforeConnect,
    });

    this.setupHandlers();
    this.client.activate();
  }

  disconnect() {
    if (this.client) {
      this.subscribedDestinations.clear();
      this.client.deactivate();
      console.log('🔌 STOMP Friendship disconnected');
    }
  }

  private readonly beforeConnect = () => {
    const { isAuthenticated, user } = store.getState().auth;
    return isAuthenticated && user ? Promise.resolve() : Promise.reject(new Error('User is not authenticated'));
  };

  private setupHandlers() {
    if (!this.client) return;

    this.client.onConnect = () => {
      console.log('✅ STOMP Friendship connected');
      this.subscribeToFriendshipEvents();
    };

    this.client.onStompError = (frame) => {
      console.error('❌ STOMP Friendship error:', frame.headers.message);
    };

    this.client.onWebSocketClose = () => {
      console.log('⚠️ WebSocket Friendship closed');
    };
  }

  private subscribeToFriendshipEvents() {
    FRIENDSHIP_EVENT_DESTINATIONS.forEach((destination) => {
      if (!this.client || this.subscribedDestinations.has(destination)) {
        return;
      }

      this.client.subscribe(destination, (message) => {
        try {
          const payload = JSON.parse(message.body) as unknown;
          console.log('📩 Received friendship event:', payload);
          this.handleEvent(payload);
        } catch (error) {
          console.error('❌ Parse friendship event error:', error);
        }
      });

      this.subscribedDestinations.add(destination);
      console.log(`✅ Subscribed to ${destination}`);
    });
  }

  private handleEvent(payload: unknown) {
    const envelope = parseFriendshipEventEnvelope(payload);

    if (!envelope) {
      return;
    }

    const currentUserId = store.getState().auth.user?.accountId;
    if (!currentUserId) {
      return;
    }

    switch (envelope.eventType) {
      case 'FRIEND_REQUEST_CREATED': {
        const request = normalizeFriendRequestFromEventData(envelope.data, FriendRequestStatus.PENDING);
        if (!request) {
          return;
        }

        this.dispatch(
          friendRequestCreated({
            currentUserId,
            request,
            emittedAt: envelope.emittedAt,
          }),
        );
        return;
      }
      case 'FRIEND_REQUEST_ACCEPTED': {
        const request = normalizeFriendRequestFromEventData(envelope.data, FriendRequestStatus.ACCEPTED);
        if (!request) {
          return;
        }

        this.dispatch(
          friendRequestAccepted({
            currentUserId,
            request,
            emittedAt: envelope.emittedAt,
            friendsSince: envelope.emittedAt,
          }),
        );
        return;
      }
      case 'FRIEND_REQUEST_REJECTED': {
        const request = normalizeFriendRequestFromEventData(envelope.data, FriendRequestStatus.REJECTED);
        if (!request) {
          return;
        }

        this.dispatch(
          friendRequestRejected({
            currentUserId,
            request,
            emittedAt: envelope.emittedAt,
          }),
        );
        return;
      }
      case 'FRIEND_REQUEST_CANCELED': {
        const request = normalizeFriendRequestFromEventData(envelope.data, FriendRequestStatus.CANCELED);
        if (!request) {
          return;
        }

        this.dispatch(
          friendRequestCanceled({
            currentUserId,
            request,
            emittedAt: envelope.emittedAt,
          }),
        );
        return;
      }
      default:
        return;
    }
  }
}
