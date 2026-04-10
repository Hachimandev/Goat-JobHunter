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
        <MessageInput onSendMessage={onSendMessage} />
      </div>

      {isDetailsOpen && !isGroup && <ChatDetailsPanel chatRoom={chatRoom} isOpen={isDetailsOpen} onClose={close} />}

      {isDetailsOpen && isGroup && <GroupDetailsPanel chatRoom={chatRoom} isOpen={isDetailsOpen} onClose={close} />}
    </>
  );
}
