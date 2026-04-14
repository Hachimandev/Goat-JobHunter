import SockJS from 'sockjs-client';
import { Client, StompSubscription } from '@stomp/stompjs';
import { DeviceNotificationType } from '@/types/model';
import { toast } from 'sonner';

let stompClient: Client | null = null;
let logoutSubscription: StompSubscription | null = null;

/**
 * Kết nối WebSocket để lắng nghe sự kiện FORCE_LOGOUT cho user hiện tại.
 *
 * @param email      Email hoặc identifier của user (nếu backend cần)
 * @param onLogout   Hàm callback sẽ được gọi khi nhận FORCE_LOGOUT
 */
export function connectWebSocketLogout(email: string, onLogout: () => void) {
  if (stompClient) {
    return;
  }

  const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000/ws';

  stompClient = new Client({
    webSocketFactory: () => new SockJS(socketUrl),
    reconnectDelay: 5000,
    debug: (str) => console.log('[STOMP Logout]', str),
    onConnect: () => {
      console.log('✅ Connected WebSocket Logout');

      // Nếu server dùng queue riêng theo user (ví dụ: /user/queue/logout)
      logoutSubscription =
        stompClient?.subscribe('/user/queue/logout', (message) => {
          console.log('Logout message:', message.body);

          const notification: DeviceNotificationType = JSON.parse(message.body);
          onLogout();
          toast.error(notification.message, { duration: 10000 });
        }) ?? null;

      // Nếu backend cần gửi thông tin email sau khi connect, có thể gửi qua STOMP
      // ví dụ: stompClient?.publish({ destination: '/app/register-session', body: JSON.stringify({ email }) });
      void email; // giữ param không bị unused, nếu chưa dùng
    },
  });

  stompClient.activate();
}

export function disconnectWebSocketLogout() {
  if (logoutSubscription) {
    logoutSubscription.unsubscribe();
    logoutSubscription = null;
  }

  if (stompClient) {
    stompClient.deactivate();
    stompClient = null;
    console.log('🔌 WebSocket Logout disconnected');
  }
}
