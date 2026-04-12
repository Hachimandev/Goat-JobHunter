import { Client, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { Alert, Platform, ToastAndroid } from 'react-native';

let stompClient: Client | null = null;
let logoutSubscription: StompSubscription | null = null;

/**
 * Kết nối WebSocket để lắng nghe sự kiện FORCE_LOGOUT cho user hiện tại.
 * Khi người dùng khác đăng nhập cùng tài khoản, server sẽ gửi FORCE_LOGOUT
 *
 * @param email      Email của user hiện tại
 * @param onLogout   Hàm callback sẽ được gọi khi nhận FORCE_LOGOUT (with isForceLogout=true)
 */
export function connectWebSocketLogout(email: string, onLogout: (isForceLogout: boolean) => void) {
  // Nếu đã kết nối, thoát sớm
  if (stompClient && stompClient.active) {
    return;
  }

  // Derive WebSocket URL from API_URL
  // e.g., http://192.168.0.5:5000/api/v1 → http://192.168.0.5:5000/ws
  let socketUrl = process.env.EXPO_PUBLIC_SOCKET_URL;
  if (!socketUrl) {
    const apiUrl = process.env.EXPO_PUBLIC_API_URL;
    if (!apiUrl) {
      throw new Error('EXPO_PUBLIC_API_URL không được set trong .env');
    }
    socketUrl = apiUrl.replace(/\/api\/v\d+$/, '/ws');
  }

  stompClient = new Client({
    webSocketFactory: () => new SockJS(socketUrl),
    reconnectDelay: 2000,
    debug: (str: string) => console.log('[STOMP Logout]', str),
    onConnect: () => {
      console.log('✅ [WebSocketLogout] Connected successfully');

      // Lắng nghe `/user/queue/logout` để nhận tin FORCE_LOGOUT
      logoutSubscription = stompClient?.subscribe('/user/queue/logout', (message: any) => {
        console.log('[WebSocketLogout] Received logout message:', message.body);

        try {
          const notification = JSON.parse(message.body);

          // Gọi callback để thực hiện logout (isForceLogout=true)
          onLogout(true);

          // Hiển thị thông báo cho user
          const errorMessage =
            notification.message || 'Tài khoản của bạn đã đăng nhập ở nơi khác. Vui lòng đăng nhập lại.';

          if (Platform.OS === 'android') {
            ToastAndroid.show(errorMessage, ToastAndroid.LONG);
          } else {
            Alert.alert('Thông báo', errorMessage);
          }
        } catch (error) {
          console.error('[WebSocketLogout] Error parsing message:', error);
        }
      }) ?? null;
    },
    onDisconnect: () => {
      // WebSocket disconnected
    },
    onStompError: (frame: any) => {
      console.error('[WebSocketLogout] STOMP error:', frame);
    },
  });

  stompClient.activate();
}

/**
 * Ngắt kết nối WebSocket logout listener
 */
export function disconnectWebSocketLogout() {
  if (logoutSubscription) {
    try {
      logoutSubscription.unsubscribe();
    } catch (e) {
      // Ignore unsubscribe errors
    }
    logoutSubscription = null;
  }

  if (stompClient) {
    try {
      stompClient.deactivate();
    } catch (e) {
      // Ignore deactivate errors
    }
    stompClient = null;
  }
}
