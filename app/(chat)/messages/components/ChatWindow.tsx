'use client';

import { MessageType, ChatRoom, PinnedMessage } from '@/types/model';
import { ChatHeader } from './ChatHeader';
import { MessageInput } from './MessageInput';
import { MessageList } from './MessageList';
import { ChatDetailsPanel } from './ChatDetailsPanel';
import { PinnedMessagesPanel } from './PinnedMessagesPanel';
import { useDetailsPanelState } from '../hooks/useDetailsPanelState';
import { ChatRoomType } from '@/types/enum';
import { GroupDetailsPanel } from '@/app/(chat)/messages/components/GroupDetailsPanel';
import { useState } from 'react';

interface ChatWindowProps {
  chatRoom: ChatRoom;
  messages: MessageType[];
  currentUserId?: string;
  isChatBlocked?: boolean;
  chatBlockedReason?: string;
  onDirectRelationshipChanged?: () => void;
  onSendMessage: (text?: string, files?: File[], replyToMessageId?: string | null) => void | Promise<void>;
  replyTarget?: MessageType | null;
  onCancelReply?: () => void;
  onReplyMessage?: (message: MessageType) => void;
  onNavigateToMessage?: (messageId: string) => void;
  onForwardMessage?: (message: MessageType) => void;
  isForwardingMessage?: boolean;
  onDeleteMessage?: (messageId: string) => Promise<void> | void;
  isDeletingMessage?: (messageId: string) => boolean;
  onRecallMessage?: (messageId: string) => Promise<void> | void;
  isRecallingMessage?: (messageId: string) => boolean;
  onPinMessage?: (messageId: string) => Promise<void> | void;
  onUnpinMessage?: (messageId: string) => Promise<void> | void;
  isPinnedMessage?: (messageId: string) => boolean;
  isPinningMessage?: (messageId: string) => boolean;
  pinnedMessages?: PinnedMessage[];
  isLoadingPinnedMessages?: boolean;
}

export function ChatWindow({
  chatRoom,
  messages,
  currentUserId,
  isChatBlocked = false,
  chatBlockedReason = 'Bạn không thể nhắn tin với người này.',
  onDirectRelationshipChanged,
  onSendMessage,
  replyTarget,
  onCancelReply,
  onReplyMessage,
  onNavigateToMessage,
  onForwardMessage,
  isForwardingMessage,
  onDeleteMessage,
  isDeletingMessage,
  onRecallMessage,
  isRecallingMessage,
  onPinMessage,
  onUnpinMessage,
  isPinnedMessage,
  isPinningMessage,
  pinnedMessages = [],
  isLoadingPinnedMessages = false,
}: Readonly<ChatWindowProps>) {
  const { isOpen: isDetailsOpen, toggle, close } = useDetailsPanelState();
  const [isPinnedPanelOpen, setIsPinnedPanelOpen] = useState(false);
  const isGroup = chatRoom.type === ChatRoomType.GROUP;
  const isChatLocked = !isGroup && isChatBlocked;

  return (
    <>
      <div className="flex-1 flex flex-col bg-background h-full overflow-hidden">
        <ChatHeader
          chatRoom={chatRoom}
          onToggleDetails={toggle}
          isDetailsOpen={isDetailsOpen}
          onShowPinnedMessages={() => setIsPinnedPanelOpen(!isPinnedPanelOpen)}
          pinnedMessagesCount={pinnedMessages.length}
        />
        <MessageList
          messages={messages}
          currentUserId={currentUserId}
          isGroup={isGroup}
          onReplyMessage={onReplyMessage}
          onNavigateToMessage={onNavigateToMessage}
          onForwardMessage={onForwardMessage}
          isForwardingMessage={isForwardingMessage}
          onDeleteMessage={onDeleteMessage}
          isDeletingMessage={isDeletingMessage}
          onRecallMessage={onRecallMessage}
          isRecallingMessage={isRecallingMessage}
          onPinMessage={onPinMessage}
          onUnpinMessage={onUnpinMessage}
          isPinnedMessage={isPinnedMessage}
          isPinningMessage={isPinningMessage}
        />
        {isChatLocked ? (
          <div className="border-t border-border bg-card px-4 py-3 text-sm text-muted-foreground text-center">
            {chatBlockedReason}
          </div>
        ) : (
          <MessageInput
            onSendMessage={onSendMessage}
            replyTarget={replyTarget}
            onCancelReply={onCancelReply}
            disabled={isChatLocked}
          />
        )}
      </div>

      {isDetailsOpen && !isGroup && (
        <ChatDetailsPanel
          chatRoom={chatRoom}
          isOpen={isDetailsOpen}
          onClose={close}
          onRelationshipChanged={onDirectRelationshipChanged}
        />
      )}

      {isDetailsOpen && isGroup && <GroupDetailsPanel chatRoom={chatRoom} isOpen={isDetailsOpen} onClose={close} />}

      <PinnedMessagesPanel
        open={isPinnedPanelOpen}
        onOpenChange={setIsPinnedPanelOpen}
        pinnedMessages={pinnedMessages}
        isLoadingPinnedMessages={isLoadingPinnedMessages}
        onUnpin={onUnpinMessage}
        isUnpinning={isPinningMessage}
        onNavigateToMessage={onNavigateToMessage}
      />
    </>
  );
}
