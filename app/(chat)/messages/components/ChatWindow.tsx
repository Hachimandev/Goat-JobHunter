'use client';

import { MessageType, ChatRoom } from '@/types/model';
import { ChatHeader } from './ChatHeader';
import { MessageInput } from './MessageInput';
import { MessageList } from './MessageList';
import { ChatDetailsPanel } from './ChatDetailsPanel';
import { useDetailsPanelState } from '../hooks/useDetailsPanelState';
import { ChatRoomType } from '@/types/enum';
import { GroupDetailsPanel } from '@/app/(chat)/messages/components/GroupDetailsPanel';

interface ChatWindowProps {
  chatRoom: ChatRoom;
  messages: MessageType[];
  currentUserId?: string;
  isChatBlocked?: boolean;
  chatBlockedReason?: string;
  onDirectRelationshipChanged?: () => void;
  onSendMessage: (text?: string, files?: File[]) => void;
  onForwardMessage?: (message: MessageType) => void;
  isForwardingMessage?: boolean;
  onDeleteMessage?: (messageId: string) => Promise<void> | void;
  isDeletingMessage?: (messageId: string) => boolean;
  onRecallMessage?: (messageId: string) => Promise<void> | void;
  isRecallingMessage?: (messageId: string) => boolean;
}

export function ChatWindow({
  chatRoom,
  messages,
  currentUserId,
  isChatBlocked = false,
  chatBlockedReason = 'Bạn không thể nhắn tin với người này.',
  onDirectRelationshipChanged,
  onSendMessage,
  onForwardMessage,
  isForwardingMessage,
  onDeleteMessage,
  isDeletingMessage,
  onRecallMessage,
  isRecallingMessage,
}: Readonly<ChatWindowProps>) {
  const { isOpen: isDetailsOpen, toggle, close } = useDetailsPanelState();
  const isGroup = chatRoom.type === ChatRoomType.GROUP;
  const isChatLocked = !isGroup && isChatBlocked;

  return (
    <>
      <div className="flex-1 flex flex-col bg-background h-full overflow-hidden">
        <ChatHeader chatRoom={chatRoom} onToggleDetails={toggle} isDetailsOpen={isDetailsOpen} />
        <MessageList
          messages={messages}
          currentUserId={currentUserId}
          isGroup={isGroup}
          onForwardMessage={onForwardMessage}
          isForwardingMessage={isForwardingMessage}
          onDeleteMessage={onDeleteMessage}
          isDeletingMessage={isDeletingMessage}
          onRecallMessage={onRecallMessage}
          isRecallingMessage={isRecallingMessage}
        />
        {isChatLocked ? (
          <div className="border-t border-border bg-card px-4 py-3 text-sm text-muted-foreground text-center">
            {chatBlockedReason}
          </div>
        ) : (
          <MessageInput onSendMessage={onSendMessage} disabled={isChatLocked} />
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
    </>
  );
}
