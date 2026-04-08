import { Client } from '@stomp/stompjs';
import { UnknownAction } from 'redux';
import SockJS from 'sockjs-client';
import { ThunkDispatch } from 'redux-thunk';
import { mergeUserProfileIfNewer } from '@/lib/features/authSlice';
import { store } from '@/lib/store';
import {
  USER_PROFILE_UPDATED_EVENT,
  USER_PROFILE_TYPES,
  UserProfileType,
  UserProfileUpdatedEventPayload,
} from '@/services/user/userProfileRealtimeType';
import { MeResponse } from '@/types/dto';

type ParsedProfileUpdateEvent = {
  userId: number;
  profileType: UserProfileType;
  emittedAt?: string;
  profile: Partial<MeResponse>;
};

export class WebSocketUserProfileService {
  private client: Client | null = null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(private readonly dispatch: ThunkDispatch<any, any, UnknownAction>) {}

  connect() {
    this.client = new Client({
      webSocketFactory: () => new SockJS(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000/ws'),
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      debug: (str) => console.log('[STOMP Profile]', str),
      beforeConnect: this.beforeConnect,
    });

    this.setupHandlers();
    this.client.activate();
  }

  disconnect() {
    if (this.client) {
      this.client.deactivate();
      console.log('🔌 STOMP Profile disconnected');
    }
  }

  private readonly beforeConnect = () => {
    const { isAuthenticated, user } = store.getState().auth;
    return isAuthenticated && user ? Promise.resolve() : Promise.reject(new Error('User is not authenticated'));
  };

  private setupHandlers() {
    if (!this.client) return;

    this.client.onConnect = () => {
      console.log('✅ STOMP Profile Connected');
      this.subscribeToProfileUpdates();
    };

    this.client.onStompError = (frame) => {
      console.error('❌ STOMP Profile Error:', frame.headers['message']);
    };

    this.client.onWebSocketClose = () => {
      console.log('⚠️ WebSocket Profile closed');
    };
  }

  private subscribeToProfileUpdates() {
    this.client?.subscribe('/user/queue/profile-updates', (message) => {
      try {
        const payload = JSON.parse(message.body) as unknown;
        const profileEvent = this.parseProfileUpdateEvent(payload);

        if (!profileEvent) {
          return;
        }

        this.dispatch(
          mergeUserProfileIfNewer({
            userId: profileEvent.userId,
            profile: profileEvent.profile,
            emittedAt: profileEvent.emittedAt,
          }),
        );

        console.log(`🔄 Applied profile update for ${profileEvent.profileType}:`, profileEvent.userId);
      } catch (error) {
        console.error('❌ Parse profile update event error:', error);
      }
    });

    console.log('✅ Subscribed to /user/queue/profile-updates');
  }

  private parseProfileUpdateEvent(payload: unknown): ParsedProfileUpdateEvent | null {
    if (!payload || typeof payload !== 'object') {
      return null;
    }

    const event = payload as UserProfileUpdatedEventPayload;

    if (event.event !== USER_PROFILE_UPDATED_EVENT) {
      return null;
    }

    if (!this.isSupportedProfileType(event.profileType)) {
      return null;
    }

    const emittedAt = typeof event.emittedAt === 'string' ? event.emittedAt : undefined;

    const profileSource = event.data;

    if (!profileSource || typeof profileSource !== 'object') {
      return null;
    }

    const profilePatch = Object.entries(profileSource as Record<string, unknown>).reduce((patch, [key, value]) => {
      if (value !== undefined) {
        (patch as Record<string, unknown>)[key] = value;
      }
      return patch;
    }, {} as Partial<MeResponse>);

    if (Object.keys(profilePatch).length === 0) {
      return null;
    }

    const userId = Number(profilePatch.accountId);
    if (Number.isNaN(userId)) {
      return null;
    }

    if (typeof profilePatch.accountId !== 'number') {
      profilePatch.accountId = userId;
    }

    return {
      userId,
      profileType: event.profileType,
      emittedAt,
      profile: profilePatch,
    };
  }

  private isSupportedProfileType(profileType: unknown): profileType is UserProfileType {
    return typeof profileType === 'string' && USER_PROFILE_TYPES.includes(profileType as UserProfileType);
  }
}
