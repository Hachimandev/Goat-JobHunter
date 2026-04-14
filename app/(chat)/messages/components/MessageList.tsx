'use client';

import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageResponse } from '@/types/model';
import { useEffect, useRef } from 'react';
import { MessageBubble, MessageBubbleLoading } from './MessageBubble';
import { usePendingMessages } from '@/contexts/PendingMessagesContext';

interface MessageListProps {
  messages: MessageResponse[];
  currentUserId?: string;
  isGroup?: boolean;
  onReplyMessage?: (message: MessageResponse) => void;
  onNavigateToMessage?: (messageId: string) => void;
  onForwardMessage?: (message: MessageResponse) => void;
  isForwardingMessage?: boolean;
  onDeleteMessage?: (messageId: string) => Promise<void> | void;
  isDeletingMessage?: (messageId: string) => boolean;
  onRecallMessage?: (messageId: string) => Promise<void> | void;
  isRecallingMessage?: (messageId: string) => boolean;
}

export function MessageList({
  messages,
  currentUserId,
  isGroup = false,
  onReplyMessage,
  onNavigateToMessage,
  onForwardMessage,
  isForwardingMessage = false,
  onDeleteMessage,
  isDeletingMessage,
  onRecallMessage,
  isRecallingMessage,
}: Readonly<MessageListProps>) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const { pendingMessages } = usePendingMessages();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-1 overflow-hidden">
      <ScrollArea className="h-full px-4">
        <div className="py-4 space-y-1">
          {messages.map((message) => (
            <div key={message.messageId} data-message-id={message.messageId} tabIndex={-1} className="outline-none">
              <MessageBubble
                message={message}
                isOwn={message.sender.accountId.toString() === currentUserId}
                showAvatar={isGroup}
                senderName={message.sender.fullName || message.sender.username}
                senderAvatar={message.sender.avatar || undefined}
                onReply={onReplyMessage}
                onNavigateToMessage={onNavigateToMessage}
                onForward={onForwardMessage}
                isForwarding={isForwardingMessage}
                onDelete={onDeleteMessage}
                isDeleting={isDeletingMessage?.(message.messageId) ?? false}
                onRecall={onRecallMessage}
                isRecalling={isRecallingMessage?.(message.messageId) ?? false}
              />
            </div>
          ))}
          {pendingMessages.map((pending) => (
            <MessageBubbleLoading key={pending.id} />
          ))}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>
    </div>
  );
}
