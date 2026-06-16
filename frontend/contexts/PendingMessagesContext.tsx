'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface PendingMessage {
  id: string;
  content?: string;
  files?: File[];
  replyToMessageId?: string | null;
}

interface PendingMessagesContextType {
  pendingMessages: PendingMessage[];
  addPendingMessage: (content?: string, files?: File[], replyToMessageId?: string | null) => string;
  removePendingMessage: (id: string) => void;
}

const PendingMessagesContext = createContext<PendingMessagesContextType | null>(null);

export function PendingMessagesProvider({ children }: { children: ReactNode }) {
  const [pendingMessages, setPendingMessages] = useState<PendingMessage[]>([]);

  const addPendingMessage = useCallback((content?: string, files?: File[], replyToMessageId?: string | null) => {
    const id = `pending-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setPendingMessages((prev) => [...prev, { id, content, files, replyToMessageId }]);
    return id;
  }, []);

  const removePendingMessage = useCallback((id: string) => {
    setPendingMessages((prev) => prev.filter((msg) => msg.id !== id));
  }, []);

  return (
    <PendingMessagesContext.Provider value={{ pendingMessages, addPendingMessage, removePendingMessage }}>
      {children}
    </PendingMessagesContext.Provider>
  );
}

export function usePendingMessages() {
  const context = useContext(PendingMessagesContext);
  if (!context) {
    throw new Error('usePendingMessages must be used within PendingMessagesProvider');
  }
  return context;
}
