import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { UnknownAction } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import { store } from '@/lib/store';
import {
  endCurrentCall,
  markCallRealtimeEvent,
  setCallError,
  setCurrentCall,
  setIncomingCall,
} from '@/lib/features/callSlice';
import { CallStatusEnum } from '@/types/enum';
import { callApi } from '@/services/chatRoom/call/callApi';

type CallRealtimeEventType = 'CALL_STARTED' | 'CALL_JOINED' | 'CALL_LEFT' | 'CALL_ENDED';

type ChatCallRealtimeEventResponse = {
  eventType: CallRealtimeEventType;
  chatRoomId: number;
  sessionId: number;
  actorAccountId: number;
  status: CallStatusEnum;
};

export class WebSocketCallService {
  private client: Client | null = null;
  private readonly destination: string;
  private subscribedDestinations = new Set<string>();

  constructor(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private readonly dispatch: ThunkDispatch<any, any, UnknownAction>,
    private readonly chatRoomId: number,
  ) {
    this.destination = `/topic/chatrooms/${chatRoomId}/calls`;
  }

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
    if (!this.client || this.subscribedDestinations.has(this.destination)) {
      return;
    }

    this.client.subscribe(this.destination, (message) => {
      try {
        const payload = JSON.parse(message.body) as unknown;

        console.log('payload in call real time: ', payload);

        this.handleEvent(payload);
      } catch (error) {
        console.error('❌ Parse call event error:', error);
      }
    });

    this.subscribedDestinations.add(this.destination);
    console.log(`✅ Subscribed to ${this.destination}`);
  }

  private isCallEventEnvelope(payload: unknown): payload is ChatCallRealtimeEventResponse {
    if (!payload || typeof payload !== 'object') {
      return false;
    }

    const candidate = payload as Record<string, unknown>;
    return (
      typeof candidate.eventType === 'string' &&
      typeof candidate.chatRoomId === 'number' &&
      typeof candidate.sessionId === 'number' &&
      typeof candidate.actorAccountId === 'number' &&
      typeof candidate.status === 'string'
    );
  }

  private async syncCurrentCall(chatRoomId: number) {
    try {
      const result = await this.dispatch(
        callApi.endpoints.getCurrentCall.initiate(
          {
            chatRoomId,
          },
          {
            forceRefetch: true,
          },
        ),
      );

      if ('data' in result && result.data?.data) {
        const nextCall = result.data.data;
        const existingCurrentCall = store.getState().call.currentCall;
        const currentUserId = store.getState().auth.user?.accountId;
        const isCurrentUserParticipant =
          typeof currentUserId === 'number' &&
          nextCall.participants.some(
            (participant) => participant.account.accountId === currentUserId && !participant.leftAt,
          );

        if (!isCurrentUserParticipant) {
          if (existingCurrentCall?.sessionId === nextCall.sessionId) {
            this.dispatch(
              endCurrentCall({
                sessionId: nextCall.sessionId,
              }),
            );
          }
          return;
        }

        if (existingCurrentCall?.sessionId === nextCall.sessionId && existingCurrentCall.rtc && !nextCall.rtc) {
          this.dispatch(
            setCurrentCall({
              ...nextCall,
              rtc: existingCurrentCall.rtc,
              callType: existingCurrentCall.callType ?? nextCall.callType,
            }),
          );
          return;
        }

        this.dispatch(setCurrentCall(nextCall));
      }
    } catch {
      this.dispatch(endCurrentCall(undefined));
    }
  }

  private handleEvent(payload: unknown) {
    if (!this.isCallEventEnvelope(payload)) {
      return;
    }

    this.dispatch(markCallRealtimeEvent(undefined));

    if (payload.chatRoomId !== this.chatRoomId) {
      return;
    }

    const currentUserId = store.getState().auth.user?.accountId;

    switch (payload.eventType) {
      case 'CALL_STARTED': {
        if (currentUserId && payload.actorAccountId !== currentUserId) {
          this.dispatch(
            setIncomingCall({
              sessionId: payload.sessionId,
              chatRoomId: payload.chatRoomId,
              actorAccountId: payload.actorAccountId,
            }),
          );
        }

        void this.syncCurrentCall(payload.chatRoomId);
        return;
      }
      case 'CALL_JOINED':
      case 'CALL_LEFT': {
        void this.syncCurrentCall(payload.chatRoomId);
        return;
      }
      case 'CALL_ENDED': {
        this.dispatch(
          endCurrentCall({
            sessionId: payload.sessionId,
            finalStatus: payload.status,
          }),
        );
        return;
      }
      default:
        this.dispatch(setCallError('Sự kiện cuộc gọi không được hỗ trợ từ realtime contract.'));
        return;
    }
  }
}
