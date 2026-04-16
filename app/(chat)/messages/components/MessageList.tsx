'use client';

import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageResponse } from '@/types/model';
import { MessageTypeEnum } from '@/types/enum';
import { useEffect, useRef, useMemo, useState } from 'react';
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
  onPinMessage?: (messageId: string) => Promise<void> | void;
  onUnpinMessage?: (messageId: string) => Promise<void> | void;
  isPinnedMessage?: (messageId: string) => boolean;
  isPinningMessage?: (messageId: string) => boolean;
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
  onPinMessage,
  onUnpinMessage,
  isPinnedMessage,
  isPinningMessage,
}: Readonly<MessageListProps>) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const { pendingMessages } = usePendingMessages();
  const collapsedMapRef = useRef<Record<string, number>>({});

  const [expandedGroups, setExpandedGroups] = useState<Set<number>>(new Set());

  const renderedItems = useMemo(() => {
    const items: Array<{
      kind: 'message' | 'collapsed';
      id?: number;
      count?: number;
      messages?: MessageResponse[];
      message?: MessageResponse;
    }> = [];
    const mapping: Record<string, number> = {};
    let i = 0;
    let groupId = 0;

    while (i < messages.length) {
      const msg = messages[i];

      if (msg.messageType === MessageTypeEnum.SYSTEM) {
        const start = i;
        while (i < messages.length && messages[i].messageType === MessageTypeEnum.SYSTEM) {
          i++;
        }

        const len = i - start;
        if (len > 5) {
          const slice = messages.slice(start, start + len);
          items.push({ kind: 'collapsed', id: groupId, count: len, messages: slice });
          for (const m of slice) {
            mapping[m.messageId] = groupId;
          }
          groupId++;
        } else {
          for (let j = start; j < start + len; j++) {
            items.push({ kind: 'message', message: messages[j] });
          }
        }
      } else {
        items.push({ kind: 'message', message: msg });
        i++;
      }
    }

    // eslint-disable-next-line react-hooks/refs
    collapsedMapRef.current = mapping;
    // Debug info about collapsed mapping
    try {
      // only run in browser
      if (typeof window !== 'undefined') {
        console.debug('[MessageList] collapsedMap size=', Object.keys(mapping).length);
      }
    } catch {
      // ignore
    }
    return items;
  }, [messages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Listen for external expand requests (detail = messageId)
  useEffect(() => {
    const handler = (e: Event) => {
      try {
        const ce = e as CustomEvent<string>;
        const messageId = ce?.detail;
        if (!messageId) return;
        const groupId = collapsedMapRef.current[messageId];
        try {
          console.debug('[MessageList] expand-system-group event=', messageId, 'mappedGroup=', groupId);
        } catch {}
        if (groupId !== undefined) {
          setExpandedGroups((prev) => {
            const next = new Set(prev);
            next.add(groupId);
            try {
              console.debug('[MessageList] expanding group', groupId);
            } catch {}
            return next;
          });
        }
      } catch (err) {
        // ignore
        console.log('[MessageList] Failed to handle expand-system-group event', err);
      }
    };

    document.addEventListener('expand-system-group', handler as EventListener);
    return () => document.removeEventListener('expand-system-group', handler as EventListener);
  }, []);

  return (
    <div className="flex-1 overflow-hidden">
      <ScrollArea className="h-full px-4">
        <div className="py-4 space-y-1">
          {renderedItems.map((item) => {
            if (item.kind === 'message') {
              const message = item.message as MessageResponse;
              return (
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
                    onPin={onPinMessage}
                    onUnpin={onUnpinMessage}
                    isPinned={isPinnedMessage?.(message.messageId) ?? false}
                    isPinning={isPinningMessage?.(message.messageId) ?? false}
                  />
                </div>
              );
            }

            const collapsed = item as { id: number; count: number; messages: MessageResponse[] };
            const isExpanded = expandedGroups.has(collapsed.id);

            if (isExpanded) {
              return (
                <div key={`expanded-${collapsed.id}`} className="space-y-1">
                  {collapsed.messages.map((m) => (
                    <div key={m.messageId} data-message-id={m.messageId} tabIndex={-1} className="outline-none">
                      <MessageBubble
                        message={m}
                        isOwn={m.sender.accountId.toString() === currentUserId}
                        showAvatar={isGroup}
                        senderName={m.sender.fullName || m.sender.username}
                        senderAvatar={m.sender.avatar || undefined}
                        onReply={onReplyMessage}
                        onNavigateToMessage={onNavigateToMessage}
                        onForward={onForwardMessage}
                        isForwarding={isForwardingMessage}
                        onDelete={onDeleteMessage}
                        isDeleting={isDeletingMessage?.(m.messageId) ?? false}
                        onRecall={onRecallMessage}
                        isRecalling={isRecallingMessage?.(m.messageId) ?? false}
                        onPin={onPinMessage}
                        onUnpin={onUnpinMessage}
                        isPinned={isPinnedMessage?.(m.messageId) ?? false}
                        isPinning={isPinningMessage?.(m.messageId) ?? false}
                      />
                    </div>
                  ))}
                </div>
              );
            }

            return (
              <div key={`collapsed-${collapsed.id}`} className="flex justify-center w-full my-3">
                <button
                  type="button"
                  onClick={() =>
                    setExpandedGroups((prev) => {
                      const next = new Set(prev);
                      next.add(collapsed.id);
                      return next;
                    })
                  }
                  className="px-4 py-2 rounded-full bg-muted/20 text-primary hover:bg-muted/30 text-sm cursor-pointer"
                >
                  Xem cập nhật trước
                </button>
              </div>
            );
          })}
          {pendingMessages.map((pending) => (
            <MessageBubbleLoading key={pending.id} />
          ))}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>
    </div>
  );
}
