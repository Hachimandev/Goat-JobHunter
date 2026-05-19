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
import { WebSocketCallService } from "@/services/socket/WebSocketCallService";

jest.mock("@stomp/stompjs", () => {
  const mockClient = {
    onConnect: null as (() => void) | null,
    onStompError: null as ((frame: { headers: { message: string } }) => void) | null,
    activate: jest.fn(),
    deactivate: jest.fn(),
    subscribe: jest.fn(),
    publish: jest.fn(),
    connected: false,
  };

  const MockClient = jest.fn().mockImplementation((config) => {
    if (config.beforeConnect) {
      // Catch rejection to prevent unhandled promise rejection leaking between tests
      config.beforeConnect().catch(() => {});
    }
    return mockClient;
  });
  (MockClient as any).__mockClient = mockClient;

  return {
    Client: MockClient,
  };
});

jest.mock("sockjs-client", () => {
  return jest.fn().mockImplementation(() => ({}));
});

jest.mock("@/lib/store", () => ({
  store: {
    getState: jest.fn(),
    dispatch: jest.fn(),
  },
}));

jest.mock("@/lib/features/callSlice", () => ({
  endCurrentCall: jest.fn((payload) => ({ type: "call/endCurrentCall", payload })),
  registerCallRealtimeEvent: jest.fn((payload) => ({ type: "call/registerCallRealtimeEvent", payload })),
  setCallError: jest.fn((payload) => ({ type: "call/setCallError", payload })),
  setCurrentCall: jest.fn((payload) => ({ type: "call/setCurrentCall", payload })),
  setIncomingCall: jest.fn((payload) => ({ type: "call/setIncomingCall", payload })),
}));

jest.mock("@/services/chatRoom/call/callApi", () => ({
  callApi: {
    endpoints: {
      getCurrentCall: {
        initiate: jest.fn(),
      },
    },
  },
}));

const mockClient = (Client as any).__mockClient;

function flushQueue() {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

describe("WebSocketCallService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (store.getState as jest.Mock).mockImplementation(() => ({
      auth: {
        isAuthenticated: true,
        user: { accountId: 1, username: "testuser", email: "test@test.com", role: { roleId: 1, name: "USER" } },
      },
      call: { currentCall: null },
    }));
    (store.dispatch as jest.Mock).mockImplementation((action) => {
      if (typeof action === "function") {
        return action(jest.fn(), jest.fn(), undefined);
      }
      return Promise.resolve({ data: null });
    });
  });

  describe("connect", () => {
    it("should create a Client and activate it", () => {
      const service = new WebSocketCallService(store.dispatch as ThunkDispatch<any, any, UnknownAction>, 42);
      service.connect();

      expect(Client).toHaveBeenCalledWith(
        expect.objectContaining({
          reconnectDelay: 5000,
          heartbeatIncoming: 10000,
          heartbeatOutgoing: 10000,
        }),
      );
      expect(mockClient.activate).toHaveBeenCalled();
    });

    it("should not throw when beforeConnect rejects", () => {
      (store.getState as jest.Mock).mockImplementation(() => ({
        auth: { isAuthenticated: false, user: null },
        call: { currentCall: null },
      }));

      const service = new WebSocketCallService(store.dispatch as ThunkDispatch<any, any, UnknownAction>, 42);
      expect(() => service.connect()).not.toThrow();
    });
  });

  describe("disconnect", () => {
    it("should deactivate the client", () => {
      const service = new WebSocketCallService(store.dispatch as ThunkDispatch<any, any, UnknownAction>, 42);
      service.connect();
      service.disconnect();

      expect(mockClient.deactivate).toHaveBeenCalled();
    });
  });

  describe("event handling", () => {
    let service: WebSocketCallService;
    let messageCallback: ((message: { body: string }) => void) | null = null;

    beforeEach(() => {
      service = new WebSocketCallService(store.dispatch as ThunkDispatch<any, any, UnknownAction>, 42);
      service.connect();

      // Trigger onConnect to set up subscription
      if (mockClient.onConnect) {
        mockClient.onConnect();
      }

      // Capture the subscribe callback
      const subscribeCalls = (mockClient.subscribe as jest.Mock).mock.calls;
      if (subscribeCalls.length > 0) {
        messageCallback = subscribeCalls[subscribeCalls.length - 1][1];
      }
    });

    afterEach(() => {
      service.disconnect();
    });

    it("should dispatch setIncomingCall on CALL_STARTED when actor !== current user", async () => {
      const eventPayload = {
        eventType: "CALL_STARTED",
        chatRoomId: 42,
        sessionId: 100,
        actorAccountId: 2,
        status: CallStatusEnum.PENDING,
        callType: CallTypeEnum.VOICE,
      };

      messageCallback!({ body: JSON.stringify(eventPayload) });
      await flushQueue();

      expect(registerCallRealtimeEvent).toHaveBeenCalledWith(eventPayload);
      expect(setIncomingCall).toHaveBeenCalledWith({
        sessionId: 100,
        chatRoomId: 42,
        actorAccountId: 2,
        callType: CallTypeEnum.VOICE,
      });
    });

    it("should NOT dispatch setIncomingCall on CALL_STARTED when actor === current user", async () => {
      const eventPayload = {
        eventType: "CALL_STARTED",
        chatRoomId: 42,
        sessionId: 100,
        actorAccountId: 1, // same as current user
        status: CallStatusEnum.PENDING,
        callType: CallTypeEnum.VOICE,
      };

      messageCallback!({ body: JSON.stringify(eventPayload) });
      await flushQueue();

      expect(registerCallRealtimeEvent).toHaveBeenCalledWith(eventPayload);
      expect(setIncomingCall).not.toHaveBeenCalled();
    });

    it("should dispatch endCurrentCall on CALL_ENDED", async () => {
      const eventPayload = {
        eventType: "CALL_ENDED",
        chatRoomId: 42,
        sessionId: 100,
        actorAccountId: 2,
        status: CallStatusEnum.ENDED,
      };

      messageCallback!({ body: JSON.stringify(eventPayload) });
      await flushQueue();

      expect(registerCallRealtimeEvent).toHaveBeenCalledWith(eventPayload);
      expect(endCurrentCall).toHaveBeenCalledWith({
        sessionId: 100,
        finalStatus: CallStatusEnum.ENDED,
      });
    });

    it("should ignore events for different chatRoomId", async () => {
      const eventPayload = {
        eventType: "CALL_STARTED",
        chatRoomId: 99, // different from service's chatRoomId (42)
        sessionId: 100,
        actorAccountId: 2,
        status: CallStatusEnum.PENDING,
        callType: CallTypeEnum.VOICE,
      };

      messageCallback!({ body: JSON.stringify(eventPayload) });
      await flushQueue();

      expect(registerCallRealtimeEvent).toHaveBeenCalledWith(eventPayload);
      expect(setIncomingCall).not.toHaveBeenCalled();
    });

    it("should ignore malformed event payloads", async () => {
      messageCallback!({ body: JSON.stringify({ foo: "bar" }) });
      await flushQueue();

      expect(registerCallRealtimeEvent).not.toHaveBeenCalled();
      expect(setIncomingCall).not.toHaveBeenCalled();
      expect(endCurrentCall).not.toHaveBeenCalled();
    });
  });
});
