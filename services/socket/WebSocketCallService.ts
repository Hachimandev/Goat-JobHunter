// Goat-JobHunter-Mobile-FE/services/socket/WebSocketCallService.ts
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import type { UnknownAction } from "@reduxjs/toolkit";
import type { ThunkDispatch } from "redux-thunk";
import { store } from "@/lib/store";
import {
  endCurrentCall,
  registerCallRealtimeEvent,
  setCallError,
  setCurrentCall,
  setIncomingCall,
} from "@/lib/features/callSlice";
import { CallStatusEnum, CallTypeEnum } from "@/types/enum";
import { callApi } from "@/services/chatRoom/call/callApi";

type CallRealtimeEventType =
  | "CALL_STARTED"
  | "CALL_JOINED"
  | "CALL_LEFT"
  | "CALL_ENDED";

type ChatCallRealtimeEventResponse = {
  eventType: CallRealtimeEventType;
  chatRoomId: number;
  sessionId: number;
  actorAccountId: number;
  status: CallStatusEnum;
  callType?: CallTypeEnum;
};

export class WebSocketCallService {
  private client: Client | null = null;
  private readonly destination: string;
  private subscribedDestinations = new Set<string>();

  constructor(
    private readonly dispatch: ThunkDispatch<any, any, UnknownAction>,
    private readonly chatRoomId: number,
  ) {
    this.destination = `/topic/chatrooms/${chatRoomId}/calls`;
  }

  connect() {
    this.client = new Client({
      webSocketFactory: () =>
        new SockJS(
          process.env.EXPO_PUBLIC_SOCKET_URL || "http://localhost:5000/ws",
        ),
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      debug: (message) => console.log("[STOMP Call]", message),
      beforeConnect: this.beforeConnect,
    });

    this.setupHandlers();
    this.client.activate();
  }

  disconnect() {
    if (this.client) {
      this.subscribedDestinations.clear();
      this.client.deactivate();
    }
  }

  private readonly beforeConnect = () => {
    const { isAuthenticated, user } = store.getState().auth;
    return isAuthenticated && user
      ? Promise.resolve()
      : Promise.reject(new Error("User is not authenticated"));
  };

  private setupHandlers() {
    if (!this.client) return;
    this.client.onConnect = () => {
      this.subscribeToCallEvents();
      this.syncCurrentCall(this.chatRoomId);
    };
    this.client.onStompError = (frame) => {
      console.error("[WebSocketCall] STOMP error:", frame.headers.message);
    };
  }

  private subscribeToCallEvents() {
    if (!this.client || this.subscribedDestinations.has(this.destination)) return;
    this.client.subscribe(this.destination, (message) => {
      try {
        const payload = JSON.parse(message.body) as unknown;
        this.handleEvent(payload);
      } catch (error) {
        console.error("[WebSocketCall] Parse error:", error);
      }
    });
    this.subscribedDestinations.add(this.destination);
  }

  private isCallEventEnvelope(
    payload: unknown,
  ): payload is ChatCallRealtimeEventResponse {
    if (!payload || typeof payload !== "object") return false;
    const candidate = payload as Record<string, unknown>;
    return (
      typeof candidate.eventType === "string" &&
      typeof candidate.chatRoomId === "number" &&
      typeof candidate.sessionId === "number" &&
      typeof candidate.actorAccountId === "number" &&
      typeof candidate.status === "string" &&
      (candidate.callType === undefined || typeof candidate.callType === "string")
    );
  }

  private async syncCurrentCall(chatRoomId: number) {
    try {
      const result = await this.dispatch(
        callApi.endpoints.getCurrentCall.initiate(
          { chatRoomId },
          { forceRefetch: true },
        ),
      );
      if ("data" in result && result.data?.data) {
        const nextCall = result.data.data;
        if (nextCall.status === CallStatusEnum.ENDED || nextCall.status === CallStatusEnum.CANCELLED) {
          const existingCurrentCall = store.getState().call.currentCall;
          if (existingCurrentCall?.sessionId === nextCall.sessionId) {
            this.dispatch(endCurrentCall({ sessionId: nextCall.sessionId }));
          }
          return;
        }
        const existingCurrentCall = store.getState().call.currentCall;
        const currentUserId = store.getState().auth.user?.accountId;
        const isCurrentUserParticipant =
          typeof currentUserId === "number" &&
          nextCall.participants.some(
            (participant) =>
              participant.account.accountId === currentUserId &&
              !participant.leftAt,
          );

        if (!isCurrentUserParticipant) {
          if (existingCurrentCall?.sessionId === nextCall.sessionId) {
            this.dispatch(endCurrentCall({ sessionId: nextCall.sessionId }));
          }
          return;
        }

        if (
          existingCurrentCall?.sessionId === nextCall.sessionId &&
          existingCurrentCall.rtc &&
          !nextCall.rtc
        ) {
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
    if (!this.isCallEventEnvelope(payload)) return;
    this.dispatch(registerCallRealtimeEvent(payload));
    if (payload.chatRoomId !== this.chatRoomId) return;

    const currentUserId = store.getState().auth.user?.accountId;
    switch (payload.eventType) {
      case "CALL_STARTED": {
        const existingCurrentCall = store.getState().call.currentCall;
        if (existingCurrentCall) return;
        if (currentUserId && payload.actorAccountId !== currentUserId) {
          this.dispatch(
            setIncomingCall({
              sessionId: payload.sessionId,
              chatRoomId: payload.chatRoomId,
              actorAccountId: payload.actorAccountId,
              callType: payload.callType,
            }),
          );
        }
        void this.syncCurrentCall(payload.chatRoomId);
        return;
      }
      case "CALL_JOINED":
      case "CALL_LEFT": {
        void this.syncCurrentCall(payload.chatRoomId);
        return;
      }
      case "CALL_ENDED": {
        const currentState = store.getState().call;
        if (currentState.currentCall?.chatRoomId !== payload.chatRoomId) return;
        this.dispatch(
          endCurrentCall({
            sessionId: payload.sessionId,
            finalStatus: payload.status,
          }),
        );
        return;
      }
      default: {
        this.dispatch(
          setCallError("Sự kiện cuộc gọi không được hỗ trợ từ realtime."),
        );
      }
    }
  }
}
