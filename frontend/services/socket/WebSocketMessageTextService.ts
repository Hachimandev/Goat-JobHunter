import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { store } from '@/lib/store';
import { toast } from 'sonner';

export class WebSocketMessageTextService {
  private client: Client | null = null;

  connect() {
    this.client = new Client({
      webSocketFactory: () => new SockJS(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000/ws'),
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      debug: (str) => console.log('[STOMP]', str),
      beforeConnect: this.beforeConnect,
    });

    this.setupHandlers();
    this.client.activate();
  }

  disconnect() {
    if (this.client) {
      this.client.deactivate();
      console.log('🔌 STOMP disconnected');
    }
  }

  private readonly beforeConnect = () => {
    const { isAuthenticated, user } = store.getState().auth;
    return isAuthenticated && user ? Promise.resolve() : Promise.reject(new Error('User is not authenticated'));
  };

  private setupHandlers() {
    if (!this.client) return;

    this.client.onConnect = () => {
      console.log('✅ STOMP Connected');
      this.subscribeToMessageText();
    };

    this.client.onStompError = (frame) => {
      console.error('❌ STOMP Error:', frame.headers['message']);
    };

    this.client.onWebSocketClose = () => {
      console.log('⚠️ WebSocket closed');
    };
  }

  private subscribeToMessageText() {
    this.client?.subscribe('/user/queue/message-text', (message) => {
      try {
        const messageText: string =message.body;
        this.handleMessageText(messageText);
      } catch (err) {
        console.error('❌ Parse message text error:', err);
      }
    });
    console.log('✅ Subscribed to /queue/message-text');
  }

  private handleMessageText(messageText: string) {
    console.log('🔔 Received message text:', messageText);
    this.showToast(messageText);
  }

  private showToast(message: string) {
    toast.success(message);
  }
}
