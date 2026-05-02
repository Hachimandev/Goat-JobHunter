export type TypingIndicatorParticipant = {
  accountId: number;
  username: string;
  avatar: string;
  updatedAt: string;
  typing: boolean;
};

type TypingIndicatorListener = (participants: TypingIndicatorParticipant[]) => void;

const TYPING_EXPIRY_MS = 4500;

const activeTypingByRoom = new Map<number, Map<number, TypingIndicatorParticipant>>();
const listenersByRoom = new Map<number, Set<TypingIndicatorListener>>();
const expiryTimersByRoom = new Map<number, Map<number, ReturnType<typeof setTimeout>>>();

const getRoomState = (roomId: number) => activeTypingByRoom.get(roomId) ?? new Map<number, TypingIndicatorParticipant>();

const getRoomListeners = (roomId: number) => listenersByRoom.get(roomId) ?? new Set<TypingIndicatorListener>();

const getSnapshot = (roomId: number): TypingIndicatorParticipant[] => {
  return Array.from(getRoomState(roomId).values()).sort(
    (left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime(),
  );
};

const notifyRoom = (roomId: number) => {
  const snapshot = getSnapshot(roomId);
  getRoomListeners(roomId).forEach((listener) => listener(snapshot));
};

const clearParticipantTimer = (roomId: number, accountId: number) => {
  const roomTimers = expiryTimersByRoom.get(roomId);
  const timer = roomTimers?.get(accountId);

  if (timer) {
    clearTimeout(timer);
    roomTimers?.delete(accountId);
  }
};

const scheduleParticipantExpiry = (roomId: number, accountId: number) => {
  clearParticipantTimer(roomId, accountId);

  const timer = setTimeout(() => {
    const roomState = activeTypingByRoom.get(roomId);

    if (roomState?.delete(accountId)) {
      notifyRoom(roomId);
    }

    clearParticipantTimer(roomId, accountId);
  }, TYPING_EXPIRY_MS);

  const roomTimers = expiryTimersByRoom.get(roomId) ?? new Map<number, ReturnType<typeof setTimeout>>();
  roomTimers.set(accountId, timer);
  expiryTimersByRoom.set(roomId, roomTimers);
};

export const upsertTypingIndicator = (roomId: number, participant: TypingIndicatorParticipant) => {
  const normalizedRoomId = Number(roomId);

  if (!Number.isFinite(normalizedRoomId) || !participant || !Number.isFinite(participant.accountId)) {
    return;
  }

  const roomState = activeTypingByRoom.get(normalizedRoomId) ?? new Map<number, TypingIndicatorParticipant>();

  if (!participant.typing) {
    if (roomState.delete(participant.accountId)) {
      activeTypingByRoom.set(normalizedRoomId, roomState);
      notifyRoom(normalizedRoomId);
    }

    clearParticipantTimer(normalizedRoomId, participant.accountId);
    return;
  }

  roomState.set(participant.accountId, participant);
  activeTypingByRoom.set(normalizedRoomId, roomState);
  scheduleParticipantExpiry(normalizedRoomId, participant.accountId);
  notifyRoom(normalizedRoomId);
};

export const getTypingIndicators = (roomId: number): TypingIndicatorParticipant[] => getSnapshot(roomId);

export const subscribeTypingIndicators = (roomId: number, listener: TypingIndicatorListener) => {
  const normalizedRoomId = Number(roomId);

  if (!Number.isFinite(normalizedRoomId)) {
    return () => undefined;
  }

  const roomListeners = listenersByRoom.get(normalizedRoomId) ?? new Set<TypingIndicatorListener>();
  roomListeners.add(listener);
  listenersByRoom.set(normalizedRoomId, roomListeners);

  listener(getSnapshot(normalizedRoomId));

  return () => {
    const currentListeners = listenersByRoom.get(normalizedRoomId);
    currentListeners?.delete(listener);

    if (currentListeners && currentListeners.size === 0) {
      listenersByRoom.delete(normalizedRoomId);
    }
  };
};

export const clearTypingIndicatorsForRoom = (roomId: number) => {
  const normalizedRoomId = Number(roomId);

  if (!Number.isFinite(normalizedRoomId)) {
    return;
  }

  const roomTimers = expiryTimersByRoom.get(normalizedRoomId);
  roomTimers?.forEach((timer) => clearTimeout(timer));
  expiryTimersByRoom.delete(normalizedRoomId);
  activeTypingByRoom.delete(normalizedRoomId);
  notifyRoom(normalizedRoomId);
};

export const clearAllTypingIndicators = () => {
  expiryTimersByRoom.forEach((roomTimers) => {
    roomTimers.forEach((timer) => clearTimeout(timer));
  });

  expiryTimersByRoom.clear();
  activeTypingByRoom.clear();

  listenersByRoom.forEach((roomListeners) => {
    roomListeners.forEach((listener) => listener([]));
  });

  listenersByRoom.clear();
};