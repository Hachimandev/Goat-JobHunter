import { Client, StompSubscription } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useSetTypingIndicatorMutation } from "@/services/chatRoom/chatRoomApi";
import {
  getTypingIndicators,
  subscribeTypingIndicators,
  TypingIndicatorParticipant,
  upsertTypingIndicator,
} from "@/services/chatRoom/typing/typingIndicatorRuntime";

const TYPING_STOP_DELAY_MS = 2500;

const getSocketUrl = () => {
  const configuredSocketUrl = process.env.EXPO_PUBLIC_SOCKET_URL;
  if (configuredSocketUrl) {
    return configuredSocketUrl;
  }

  const apiUrl = process.env.EXPO_PUBLIC_API_URL;
  return apiUrl?.replace(/\/api\/v\d+$/, "/ws") || "http://localhost:5000/ws";
};

const isTypingIndicatorEvent = (
  payload: unknown,
): payload is TypingIndicatorParticipant => {
  if (!payload || typeof payload !== "object") {
    return false;
  }

  const candidate = payload as Record<string, unknown>;

  return (
    typeof candidate.accountId === "number" &&
    typeof candidate.username === "string" &&
    typeof candidate.typing === "boolean" &&
    typeof candidate.updatedAt === "string"
  );
};

export function useChatRoomTypingIndicator(
  chatRoomId: number | null,
  currentUserId?: number,
) {
  const [typingParticipants, setTypingParticipants] = useState<
    TypingIndicatorParticipant[]
  >([]);
  const [setTypingIndicator] = useSetTypingIndicatorMutation();
  const stopTypingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTypingRef = useRef(false);

  const clearStopTimer = useCallback(() => {
    if (stopTypingTimerRef.current) {
      clearTimeout(stopTypingTimerRef.current);
      stopTypingTimerRef.current = null;
    }
  }, []);

  const stopTyping = useCallback(
    async (flushRemote = true) => {
      clearStopTimer();

      if (!isTypingRef.current) {
        return;
      }

      isTypingRef.current = false;

      if (!flushRemote || chatRoomId === null || Number.isNaN(chatRoomId)) {
        return;
      }

      try {
        await setTypingIndicator({ chatRoomId, typing: false }).unwrap();
      } catch (error) {
        console.warn("Failed to clear typing indicator:", error);
      }
    },
    [chatRoomId, clearStopTimer, setTypingIndicator],
  );

  const scheduleTypingStop = useCallback(() => {
    clearStopTimer();

    stopTypingTimerRef.current = setTimeout(() => {
      void stopTyping();
    }, TYPING_STOP_DELAY_MS);
  }, [clearStopTimer, stopTyping]);

  const markTyping = useCallback(
    async (typing: boolean) => {
      if (chatRoomId === null || Number.isNaN(chatRoomId)) {
        return;
      }

      if (!typing) {
        await stopTyping();
        return;
      }

      if (!isTypingRef.current) {
        isTypingRef.current = true;

        try {
          await setTypingIndicator({ chatRoomId, typing: true }).unwrap();
        } catch (error) {
          isTypingRef.current = false;
          console.warn("Failed to send typing indicator:", error);
          return;
        }
      }

      scheduleTypingStop();
    },
    [chatRoomId, scheduleTypingStop, setTypingIndicator, stopTyping],
  );

  useEffect(() => {
    if (chatRoomId === null || Number.isNaN(chatRoomId)) {
      setTypingParticipants([]);
      return;
    }

    setTypingParticipants(
      getTypingIndicators(chatRoomId).filter(
        (participant) => participant.accountId !== currentUserId,
      ),
    );

    const unsubscribe = subscribeTypingIndicators(chatRoomId, (participants) => {
      setTypingParticipants(
        participants.filter(
          (participant) => participant.accountId !== currentUserId,
        ),
      );
    });

    return () => {
      unsubscribe();
      clearStopTimer();
      void stopTyping(false);
    };
  }, [chatRoomId, clearStopTimer, currentUserId, stopTyping]);

  useEffect(() => {
    if (chatRoomId === null || Number.isNaN(chatRoomId)) {
      return;
    }

    let typingSubscription: StompSubscription | null = null;
    const client = new Client({
      webSocketFactory: () => new SockJS(getSocketUrl()),
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      debug: () => undefined,
      onConnect: () => {
        typingSubscription = client.subscribe(
          `/topic/chatrooms/${chatRoomId}/typing`,
          (frame) => {
            try {
              const payload: unknown = JSON.parse(frame.body);

              if (isTypingIndicatorEvent(payload)) {
                upsertTypingIndicator(chatRoomId, payload);
              }
            } catch (error) {
              console.error("Parse typing indicator error:", error);
            }
          },
        );
      },
      onStompError: (frame) => {
        console.error("[STOMP Typing] error:", frame.headers.message);
      },
    });

    client.activate();

    return () => {
      typingSubscription?.unsubscribe();
      void client.deactivate();
    };
  }, [chatRoomId]);

  const activeTypingParticipants = useMemo(
    () => typingParticipants.filter((participant) => participant.typing),
    [typingParticipants],
  );

  return {
    typingParticipants: activeTypingParticipants,
    markTyping,
    stopTyping: () => stopTyping(),
  };
}
