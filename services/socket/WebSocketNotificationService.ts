import { Client } from "@stomp/stompjs";
import { ThunkDispatch } from "redux-thunk";
import { UnknownAction } from "redux";
import SockJS from "sockjs-client";
import { store } from "@/lib/store";
import { NotificationType } from "@/types/model";
import { toast } from "sonner";
import { notificationApi } from "@/services/notification/notificationApi";
import { getNotificationContent } from "@/utils/getNotificationContent";

export class WebSocketNotificationService {
  private client: Client | null = null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(private readonly dispatch: ThunkDispatch<any, any, UnknownAction>) {}

  connect() {
    this.client = new Client({
      webSocketFactory: () => new SockJS(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000/ws"),
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      debug: (str) => console.log("[STOMP]", str),
      beforeConnect: this.beforeConnect
    });

    this.setupHandlers();
    this.client.activate();
  }

  disconnect() {
    if (this.client) {
      this.client.deactivate();
      console.log("🔌 STOMP disconnected");
    }
  }

  private readonly beforeConnect = () => {
    const { isAuthenticated, user } = store.getState().auth;
    return isAuthenticated && user ? Promise.resolve() : Promise.reject(new Error("User is not authenticated"));
  };

  private setupHandlers() {
    if (!this.client) return;

    this.client.onConnect = () => {
      console.log("✅ STOMP Connected");
      this.subscribeToNotifications();
    };

    this.client.onStompError = (frame) => {
      console.error("❌ STOMP Error:", frame.headers["message"]);
    };

    this.client.onWebSocketClose = () => {
      console.log("⚠️ WebSocket closed");
    };
  }

  private subscribeToNotifications() {
    this.client?.subscribe("/user/queue/notifications", (message) => {
      try {
        const notification: NotificationType = JSON.parse(message.body);
        this.handleNotification(notification);
      } catch (err) {
        console.error("❌ Parse notification error:", err);
      }
    });
    console.log("✅ Subscribed to /user/queue/notifications");
  }

  private handleNotification(notification: NotificationType) {
    console.log("🔔 Received notification:", notification);

    this.dispatch(
      notificationApi.util.updateQueryData("getLatestNotifications", undefined, (draft) => {
        if (draft?.data) {
          draft.data.unshift(notification);
          draft.data = draft.data.slice(0, 10);
        }
      })
    );

    this.showToast(notification);
  }

  private showToast(notification: NotificationType) {

    const { message } = getNotificationContent(notification, { maxLength: 50 });
    toast.success(message);

  }
}