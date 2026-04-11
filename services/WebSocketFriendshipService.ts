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
import {
  FriendRequest,
  FriendRequestStatus,
  FriendshipEventType,
  isFriendshipEventType,
  normalizeFriendRequest,
} from '@/services/friendship/friendshipType';

const FRIENDSHIP_EVENT_DESTINATIONS = ['/user/queue/friendships'] as const;

type ParsedFriendshipEnvelope = {
  eventType: FriendshipEventType;
  emittedAt?: string;
  data: Record<string, unknown>;
};

const toRecord = (value: unknown): Record<string, unknown> => {
  if (value && typeof value === 'object') {
    return value as Record<string, unknown>;
  }

  return {};
};

const parsePositiveNumber = (value: unknown): number | null => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }

  return parsed;
};

const pickNumber = (source: Record<string, unknown>, keys: string[]): number | null => {
  for (const key of keys) {
    const value = parsePositiveNumber(source[key]);
    if (value !== null) {
      return value;
    }
  }

  return null;
};

const pickString = (source: Record<string, unknown>, keys: string[]): string | undefined => {
  for (const key of keys) {
    const candidate = source[key];

    if (typeof candidate === 'string' && candidate.trim().length > 0) {
      return candidate;
    }
  }

  return undefined;
};

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
    const envelope = this.extractEnvelope(payload);

    if (!envelope) {
      return;
    }

    const currentUserId = store.getState().auth.user?.accountId;
    if (!currentUserId) {
      return;
    }

    switch (envelope.eventType) {
      case 'FRIEND_REQUEST_CREATED': {
        const request = this.normalizeRequestFromEnvelope(envelope.data, FriendRequestStatus.PENDING);
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
        const request = this.normalizeRequestFromEnvelope(envelope.data, FriendRequestStatus.ACCEPTED);
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
        const request = this.normalizeRequestFromEnvelope(envelope.data, FriendRequestStatus.REJECTED);
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
        const request = this.normalizeRequestFromEnvelope(envelope.data, FriendRequestStatus.CANCELED);
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

  private normalizeRequestFromEnvelope(
    data: Record<string, unknown>,
    status: FriendRequestStatus,
  ): FriendRequest | null {
    const normalized = normalizeFriendRequest(data);

    if (normalized) {
      return {
        ...normalized,
        status,
      };
    }

    const requestId = pickNumber(data, ['requestId', 'friendRequestId', 'id']);
    const requesterId = pickNumber(data, ['requesterId', 'senderId', 'actorUserId', 'fromAccountId', 'actorId']);
    const recipientId = pickNumber(data, ['recipientId', 'receiverId', 'targetUserId', 'targetId', 'toAccountId']);

    if (!requestId || !requesterId || !recipientId) {
      return null;
    }

    return {
      requestId,
      requesterId,
      recipientId,
      status,
      createdAt: pickString(data, ['createdAt', 'requestedAt']),
      updatedAt: pickString(data, ['updatedAt', 'respondedAt', 'processedAt', 'emittedAt']) ?? new Date().toISOString(),
      expiresAt: pickString(data, ['expiresAt']),
    };
  }

  private extractEnvelope(payload: unknown): ParsedFriendshipEnvelope | null {
    const source = toRecord(payload);
    const nestedData = toRecord(source.data);

    const eventCandidate = source.eventType ?? source.event ?? source.type ?? source.action;
    const nestedEventCandidate = nestedData.eventType ?? nestedData.event ?? nestedData.type ?? nestedData.action;

    const eventType = isFriendshipEventType(eventCandidate)
      ? eventCandidate
      : isFriendshipEventType(nestedEventCandidate)
        ? nestedEventCandidate
        : null;

    if (!eventType) {
      return null;
    }

    const emittedAt =
      pickString(source, ['emittedAt', 'timestamp', 'createdAt', 'updatedAt']) ??
      pickString(nestedData, ['emittedAt', 'timestamp', 'createdAt', 'updatedAt']);

    const mergedData = {
      ...source,
      ...nestedData,
    };

    return {
      eventType,
      emittedAt,
      data: mergedData,
    };
  }
}
