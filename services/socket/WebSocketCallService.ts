import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { UnknownAction } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import { store } from '@/lib/store';
import {
  endCurrentCall,
  markCallRealtimeEvent,
  setCallError,
  setCallParticipants,
  setCallStatus,
  setCurrentCall,
  setIncomingCall,
} from '@/lib/features/callSlice';
import { CallSession } from '@/types/model';
import { CallStatusEnum } from '@/types/enum';

type CallEventEnvelope = {
  eventType: string;
  emittedAt?: string;
  data?: unknown;
};

type IncomingCallPayload = {
  callId: string;
  chatRoomId: number;
  fromAccountId: number;
  startedAt?: string;
  session?: CallSession;
};

type CallStatusPayload = {
  callId: string;
  status: CallStatusEnum;
  endedAt?: string;
};

type CallParticipantsPayload = {
  callId: string;
  participants: CallSession['participants'];
};

const CALL_EVENT_DESTINATIONS = ['/user/queue/call', '/user/queue/call-status'] as const;

export class WebSocketCallService {
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
      debug: (str) => console.log('[STOMP Call]', str),
      beforeConnect: this.beforeConnect,
    });

    this.setupHandlers();
    this.client.activate();
  }

  disconnect() {
    if (this.client) {
      this.subscribedDestinations.clear();
      this.client.deactivate();
      console.log('🔌 STOMP Call disconnected');
    }
  }

  private readonly beforeConnect = () => {
    const { isAuthenticated, user } = store.getState().auth;
    return isAuthenticated && user ? Promise.resolve() : Promise.reject(new Error('User is not authenticated'));
  };

  private setupHandlers() {
    if (!this.client) return;

    this.client.onConnect = () => {
      console.log('✅ STOMP Call connected');
      this.subscribeToCallEvents();
    };

    this.client.onStompError = (frame) => {
      console.error('❌ STOMP Call error:', frame.headers.message);
    };

    this.client.onWebSocketClose = () => {
      console.log('⚠️ WebSocket Call closed');
    };
  }

  private subscribeToCallEvents() {
    CALL_EVENT_DESTINATIONS.forEach((destination) => {
      if (!this.client || this.subscribedDestinations.has(destination)) {
        return;
      }

      this.client.subscribe(destination, (message) => {
        try {
          const payload = JSON.parse(message.body) as unknown;
          this.handleEvent(payload);
        } catch (error) {
          console.error('❌ Parse call event error:', error);
        }
      });

      this.subscribedDestinations.add(destination);
      console.log(`✅ Subscribed to ${destination}`);
    });
  }

  private isCallEventEnvelope(payload: unknown): payload is CallEventEnvelope {
    if (!payload || typeof payload !== 'object') {
      return false;
    }

    const candidate = payload as Record<string, unknown>;
    return typeof candidate.eventType === 'string';
  }

  private handleEvent(payload: unknown) {
    if (!this.isCallEventEnvelope(payload)) {
      return;
    }

    this.dispatch(markCallRealtimeEvent(payload.emittedAt));

    switch (payload.eventType) {
      case 'CALL_INCOMING': {
        const incoming = payload.data as IncomingCallPayload;
        if (!incoming?.callId || !incoming?.chatRoomId || !incoming?.fromAccountId) {
          return;
        }

        this.dispatch(
          setIncomingCall({
            callId: incoming.callId,
            chatRoomId: incoming.chatRoomId,
            fromAccountId: incoming.fromAccountId,
            startedAt: incoming.startedAt,
            session: incoming.session,
          }),
        );
        return;
      }
      case 'CALL_UPDATED': {
        const session = payload.data as CallSession;
        if (!session?.callId) {
          return;
        }

        this.dispatch(setCurrentCall(session));
        return;
      }
      case 'CALL_STATUS_CHANGED': {
        const statusPayload = payload.data as CallStatusPayload;
        if (!statusPayload?.callId || !statusPayload?.status) {
          return;
        }

        if (statusPayload.status === CallStatusEnum.ENDED || statusPayload.status === CallStatusEnum.REJECTED) {
          this.dispatch(
            endCurrentCall({
              callId: statusPayload.callId,
              endedAt: statusPayload.endedAt,
              finalStatus: statusPayload.status,
            }),
          );
          return;
        }

        this.dispatch(
          setCallStatus({
            callId: statusPayload.callId,
            status: statusPayload.status,
          }),
        );
        return;
      }
      case 'CALL_PARTICIPANTS_UPDATED': {
        const participantsPayload = payload.data as CallParticipantsPayload;
        if (!participantsPayload?.callId || !participantsPayload?.participants) {
          return;
        }

        this.dispatch(
          setCallParticipants({
            callId: participantsPayload.callId,
            participants: participantsPayload.participants,
          }),
        );
        return;
      }
      case 'CALL_ERROR': {
        const errorPayload = payload.data as { message?: string } | undefined;
        this.dispatch(setCallError(errorPayload?.message || 'Không thể đồng bộ trạng thái cuộc gọi.'));
        return;
      }
      default:
        return;
    }
  }
}
