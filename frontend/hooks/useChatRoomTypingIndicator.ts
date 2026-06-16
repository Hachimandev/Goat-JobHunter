import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSetTypingIndicatorMutation } from '@/services/chatRoom/chatRoomApi';
import {
  getTypingIndicators,
  subscribeTypingIndicators,
  TypingIndicatorParticipant,
} from '@/services/chatRoom/typing/typingIndicatorRuntime';

const TYPING_STOP_DELAY_MS = 2500;

export function useChatRoomTypingIndicator(chatRoomId: number | null, currentUserId?: number) {
  const [typingParticipants, setTypingParticipants] = useState<TypingIndicatorParticipant[]>([]);
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
        console.warn('Failed to clear typing indicator:', error);
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
    async (isTyping: boolean) => {
      if (chatRoomId === null || Number.isNaN(chatRoomId)) {
        return;
      }

      if (!isTyping) {
        await stopTyping();
        return;
      }

      if (!isTypingRef.current) {
        isTypingRef.current = true;

        try {
          await setTypingIndicator({ chatRoomId, typing: true }).unwrap();
        } catch (error) {
          isTypingRef.current = false;
          console.warn('Failed to send typing indicator:', error);
          return;
        }
      }

      scheduleTypingStop();
    },
    [chatRoomId, scheduleTypingStop, setTypingIndicator, stopTyping],
  );

  useEffect(() => {
    if (chatRoomId === null || Number.isNaN(chatRoomId)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTypingParticipants([]);
      return;
    }

    setTypingParticipants(getTypingIndicators(chatRoomId).filter((participant) => participant.accountId !== currentUserId));

    const unsubscribe = subscribeTypingIndicators(chatRoomId, (participants) => {
      setTypingParticipants(participants.filter((participant) => participant.accountId !== currentUserId));
    });

    return () => {
      unsubscribe();
      clearStopTimer();
      void stopTyping(false);
    };
  }, [chatRoomId, clearStopTimer, currentUserId, stopTyping]);

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