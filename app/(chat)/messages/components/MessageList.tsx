'use client';

import { ScrollArea } from '@/components/ui/scroll-area';
import { CHAT_MESSAGE_SCROLL_TOP_THRESHOLD } from '@/constants/constant';
import { MessageResponse } from '@/types/model';
import { MessageTypeEnum } from '@/types/enum';
import { extractMessageId } from '@/utils/slug';
import { useEffect, useRef, useMemo, useState, useCallback } from 'react';
import { MessageBubble, MessageBubbleLoading } from './MessageBubble';
import { usePendingMessages } from '@/contexts/PendingMessagesContext';
import { Loader2 } from 'lucide-react';

interface MessageListProps {
  messages: MessageResponse[];
  currentUserId?: string;
  isGroup?: boolean;
  onLoadOlderMessages?: () => Promise<void> | void;
  hasOlderMessages?: boolean;
  isLoadingOlderMessages?: boolean;
  onReplyMessage?: (message: MessageResponse) => void;
  onNavigateToMessage?: (messageId: string) => void;
  onForwardMessage?: (message: MessageResponse) => void;
  isForwardingMessage?: boolean;
  onHideMessage?: (messageId: string) => Promise<void> | void;
  isHidingMessage?: (messageId: string) => boolean;
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
  onLoadOlderMessages,
  hasOlderMessages = false,
  isLoadingOlderMessages = false,
  onReplyMessage,
  onNavigateToMessage,
  onForwardMessage,
  isForwardingMessage = false,
  onHideMessage,
  isHidingMessage,
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
  const scrollAreaContainerRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const topLoadAnchorRef = useRef<{ scrollHeight: number; scrollTop: number; messageCount: number } | null>(null);
  const hasTriggeredTopLoadRef = useRef(false);
  const isNearBottomRef = useRef(true);
  const lastTailMessageIdRef = useRef<string | null>(null);
  const { pendingMessages } = usePendingMessages();
  const collapsedMapRef = useRef<Record<string, number>>({});
  const [expandedGroups, setExpandedGroups] = useState<Set<number>>(new Set());

  const latestPollMessageIdByPollId = useMemo(() => {
    const map: Record<string, MessageResponse> = {};
    for (const m of messages) {
      if (m.messageType !== MessageTypeEnum.POLL) continue;
      const pid = extractMessageId(m.content);
      if (!pid) continue;
      const prev = map[pid];
      if (!prev) map[pid] = m;
      else if (new Date(m.createdAt) > new Date(prev.createdAt)) map[pid] = m;
    }
    const result: Record<string, string> = {};
    for (const k of Object.keys(map)) result[k] = map[k].messageId;
    return result;
  }, [messages]);

  const { renderedItems, collapsedMap } = useMemo(() => {
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
    const COLLAPSE_THRESHOLD = 5;

    while (i < messages.length) {
      const msg = messages[i];

      if (msg.messageType === MessageTypeEnum.SYSTEM || msg.messageType === MessageTypeEnum.POLL) {
        const start = i;
        while (
          i < messages.length &&
          (messages[i].messageType === MessageTypeEnum.SYSTEM || messages[i].messageType === MessageTypeEnum.POLL)
        ) {
          i++;
        }

        const slice = messages.slice(start, i);

        // find latest poll indices inside this slice
        const latestIndices: number[] = [];
        for (let idx = 0; idx < slice.length; idx++) {
          const m = slice[idx];
          if (m.messageType !== MessageTypeEnum.POLL) continue;
          const pid = extractMessageId(m.content);
          if (!pid) continue;
          if (latestPollMessageIdByPollId[pid] === m.messageId) latestIndices.push(idx);
        }

        if (latestIndices.length === 0) {
          if (slice.length > COLLAPSE_THRESHOLD) {
            items.push({ kind: 'collapsed', id: groupId, count: slice.length, messages: slice });
            for (const m of slice) mapping[m.messageId] = groupId;
            groupId++;
          } else {
            for (const m of slice) items.push({ kind: 'message', message: m });
          }
        } else {
          let segStart = 0;
          for (const pollIdx of latestIndices) {
            const segLen = pollIdx - segStart;
            if (segLen > 0) {
              const seg = slice.slice(segStart, pollIdx);
              if (segLen > COLLAPSE_THRESHOLD) {
                items.push({ kind: 'collapsed', id: groupId, count: segLen, messages: seg });
                for (const m of seg) mapping[m.messageId] = groupId;
                groupId++;
              } else {
                for (const m of seg) items.push({ kind: 'message', message: m });
              }
            }

            // always show the poll message itself
            items.push({ kind: 'message', message: slice[pollIdx] });
            segStart = pollIdx + 1;
          }

          if (segStart < slice.length) {
            const seg = slice.slice(segStart);
            if (seg.length > COLLAPSE_THRESHOLD) {
              items.push({ kind: 'collapsed', id: groupId, count: seg.length, messages: seg });
              for (const m of seg) mapping[m.messageId] = groupId;
              groupId++;
            } else {
              for (const m of seg) items.push({ kind: 'message', message: m });
            }
          }
        }
      } else {
        items.push({ kind: 'message', message: msg });
        i++;
      }
    }

    return { renderedItems: items, collapsedMap: mapping };
  }, [messages, latestPollMessageIdByPollId]);

  useEffect(() => {
    collapsedMapRef.current = collapsedMap;
  }, [collapsedMap]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const resolveViewport = useCallback(() => {
    return scrollAreaContainerRef.current?.querySelector('[data-slot="scroll-area-viewport"]') as HTMLDivElement | null;
  }, []);

  const updateNearBottom = useCallback(() => {
    const viewport = viewportRef.current;

    if (!viewport) {
      return;
    }

    const distanceToBottom = viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight;
    isNearBottomRef.current = distanceToBottom <= 120;
  }, []);

  const handleScroll = useCallback(() => {
    const viewport = viewportRef.current;

    if (!viewport) {
      return;
    }

    updateNearBottom();

    if (viewport.scrollTop > CHAT_MESSAGE_SCROLL_TOP_THRESHOLD) {
      hasTriggeredTopLoadRef.current = false;
      return;
    }

    if (!onLoadOlderMessages || !hasOlderMessages || isLoadingOlderMessages || hasTriggeredTopLoadRef.current) {
      return;
    }
  }, [hasOlderMessages, isLoadingOlderMessages, onLoadOlderMessages, updateNearBottom]);

  useEffect(() => {
    const viewport = resolveViewport();

    if (!viewport) {
      return;
    }

    viewportRef.current = viewport;
    updateNearBottom();
    viewport.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      viewport.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll, resolveViewport, updateNearBottom]);

  useEffect(() => {
    if (isLoadingOlderMessages) {
      return;
    }

    const viewport = viewportRef.current;
    const topLoadAnchor = topLoadAnchorRef.current;

    if (!viewport || !topLoadAnchor) {
      return;
    }

    if (messages.length > topLoadAnchor.messageCount) {
      const nextScrollTop = viewport.scrollHeight - topLoadAnchor.scrollHeight + topLoadAnchor.scrollTop;
      viewport.scrollTop = Math.max(0, nextScrollTop);
    }

    topLoadAnchorRef.current = null;
    hasTriggeredTopLoadRef.current = false;
    updateNearBottom();
  }, [isLoadingOlderMessages, messages.length, updateNearBottom]);

  useEffect(() => {
    if (isLoadingOlderMessages) {
      return;
    }

    const viewport = viewportRef.current;
    const topLoadAnchor = topLoadAnchorRef.current;

    if (!viewport || !topLoadAnchor) {
      return;
    }

    if (messages.length > topLoadAnchor.messageCount) {
      const nextScrollTop = viewport.scrollHeight - topLoadAnchor.scrollHeight + topLoadAnchor.scrollTop;
      viewport.scrollTop = Math.max(0, nextScrollTop);
    }

    topLoadAnchorRef.current = null;
    hasTriggeredTopLoadRef.current = false;
    updateNearBottom();
  }, [isLoadingOlderMessages, messages.length, updateNearBottom]);

  const latestMessageId = messages[messages.length - 1]?.messageId ?? null;

  useEffect(() => {
    if (!latestMessageId) {
      lastTailMessageIdRef.current = null;
      return;
    }

    const previousTailMessageId = lastTailMessageIdRef.current;

    if (previousTailMessageId === latestMessageId) {
      return;
    }

    if (!previousTailMessageId || isNearBottomRef.current) {
      bottomRef.current?.scrollIntoView({ behavior: previousTailMessageId ? 'smooth' : 'auto' });
    }

    lastTailMessageIdRef.current = latestMessageId;
  }, [latestMessageId]);

  useEffect(() => {
    const handler = (e: Event) => {
      try {
        const ce = e as CustomEvent<string>;
        const messageId = ce?.detail;
        if (!messageId) return;
        const groupId = collapsedMapRef.current[messageId];
        if (groupId !== undefined) {
          setExpandedGroups((prev) => {
            const next = new Set(prev);
            next.add(groupId);
            return next;
          });
        }
      } catch (err) {
        console.error('Error handling expand-system-group event', err);
      }
    };

    document.addEventListener('expand-system-group', handler as EventListener);
    return () => document.removeEventListener('expand-system-group', handler as EventListener);
  }, []);

  return (
    <div className="flex-1 overflow-hidden" ref={scrollAreaContainerRef}>
      <ScrollArea className="h-full px-4">
        <div className="py-4 space-y-1">
          {isLoadingOlderMessages && (
            <div className="flex justify-center py-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          )}
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
                    showPoll={
                      message.messageType === MessageTypeEnum.POLL &&
                      latestPollMessageIdByPollId[extractMessageId(message.content) || ''] === message.messageId
                    }
                    onNavigateToPoll={(pid: string) => {
                      const target = latestPollMessageIdByPollId[pid];
                      if (target && onNavigateToMessage) onNavigateToMessage(target);
                    }}
                    onReply={onReplyMessage}
                    onNavigateToMessage={onNavigateToMessage}
                    onForward={onForwardMessage}
                    isForwarding={isForwardingMessage}
                    onHide={onHideMessage}
                    isHiding={isHidingMessage?.(message.messageId) ?? false}
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
                        showPoll={
                          m.messageType === MessageTypeEnum.POLL &&
                          latestPollMessageIdByPollId[extractMessageId(m.content) || ''] === m.messageId
                        }
                        onNavigateToPoll={(pid: string) => {
                          const target = latestPollMessageIdByPollId[pid];
                          if (target && onNavigateToMessage) onNavigateToMessage(target);
                        }}
                        onReply={onReplyMessage}
                        onNavigateToMessage={onNavigateToMessage}
                        onForward={onForwardMessage}
                        isForwarding={isForwardingMessage}
                        onHide={onHideMessage}
                        isHiding={isHidingMessage?.(m.messageId) ?? false}
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
