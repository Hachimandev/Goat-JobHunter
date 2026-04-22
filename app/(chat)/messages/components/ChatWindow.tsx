import { CallSession, ChatRoom, MessageResponse, PinnedMessage } from '@/types/model';
import { ChatHeader } from './ChatHeader';
import { MessageInput } from './MessageInput';
import { MessageList } from './MessageList';
import { ChatDetailsPanel } from './ChatDetailsPanel';
import { PinnedMessagesPanel } from './PinnedMessagesPanel';
import { useDetailsPanelState } from '../hooks/useDetailsPanelState';
import { ChatRoomType } from '@/types/enum';
import { GroupDetailsPanel } from '@/app/(chat)/messages/components/GroupDetailsPanel';
import { SearchMessagesDialog } from '@/app/(chat)/messages/components/SearchMessagesDialog';
import type { SendContactCardsSubmitResult } from '@/services/chatRoom/chatRoomType';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { toast } from 'sonner';
import { useLeaveGroupChatMutation } from '@/services/chatRoom/groupChat/groupChatApi';
import { IBackendError } from '@/types/api';
import { useRouter } from 'next/navigation';

interface ChatWindowProps {
  chatRoom: ChatRoom;
  messages: MessageResponse[];
  currentUserId?: string;
  isChatBlocked?: boolean;
  chatBlockedReason?: string;
  onDirectRelationshipChanged?: () => void;
  onSendMessage: (text?: string, files?: File[], replyToMessageId?: string | null) => void | Promise<void>;
  onSendContactCards?:
    | ((selectedUserIds: number[]) => Promise<SendContactCardsSubmitResult | null>)
    | ((selectedUserIds: number[]) => SendContactCardsSubmitResult | null);
  replyTarget?: MessageResponse | null;
  onCancelReply?: () => void;
  onReplyMessage?: (message: MessageResponse) => void;
  onNavigateToMessage?: (messageId: string) => void;
  onLoadOlderMessages?: () => Promise<void> | void;
  hasOlderMessages?: boolean;
  isLoadingOlderMessages?: boolean;
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
  onClearChat?: () => Promise<void> | void;
  pinnedMessages?: PinnedMessage[];
  isLoadingPinnedMessages?: boolean;
  onStartVoiceCall?: () => void;
  onStartVideoCall?: () => void;
  showOngoingCallInfo?: boolean;
  callSession?: CallSession | null;
  ongoingParticipantsCount?: number;
  canJoinOngoingCall?: boolean;
  isJoiningOngoingCall?: boolean;
  onJoinOngoingCall?: () => void;
}

export function ChatWindow({
  chatRoom,
  messages,
  currentUserId,
  isChatBlocked = false,
  chatBlockedReason = 'Bạn không thể nhắn tin với người này.',
  onDirectRelationshipChanged,
  onSendMessage,
  onSendContactCards,
  replyTarget,
  onCancelReply,
  onReplyMessage,
  onNavigateToMessage,
  onLoadOlderMessages,
  hasOlderMessages = false,
  isLoadingOlderMessages = false,
  onForwardMessage,
  isForwardingMessage,
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
  pinnedMessages = [],
  isLoadingPinnedMessages = false,
  onStartVoiceCall,
  onStartVideoCall,
  showOngoingCallInfo = false,
  callSession = null,
  ongoingParticipantsCount = 0,
  canJoinOngoingCall = false,
  isJoiningOngoingCall = false,
  onJoinOngoingCall,
}: Readonly<ChatWindowProps>) {
  const { isOpen: isDetailsOpen, toggle, close } = useDetailsPanelState();
  const [isPinnedPanelOpen, setIsPinnedPanelOpen] = useState(false);
  const isGroup = chatRoom.type === ChatRoomType.GROUP;
  const isDissolved = Boolean(chatRoom.deletedAt && chatRoom.type === ChatRoomType.GROUP);
  const isChatLocked = !isGroup && isChatBlocked;
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const [searchDialogState, setSearchDialogState] = useState<{ roomId: number; open: boolean }>({
    roomId: chatRoom.roomId,
    open: false,
  });
  const router = useRouter();
  const [leaveGroup, { isLoading: isLeavingGroup }] = useLeaveGroupChatMutation();
  const searchDialogOpen = searchDialogState.roomId === chatRoom.roomId && searchDialogState.open;

  const handleOpenSearch = () => {
    setSearchDialogState({ roomId: chatRoom.roomId, open: true });
  };

  const handleSearchDialogOpenChange = (open: boolean) => {
    setSearchDialogState({ roomId: chatRoom.roomId, open });
  };

  const handleLeaveGroup = async () => {
    try {
      await leaveGroup(chatRoom.roomId.toString()).unwrap();
      toast.success('Đã rời khỏi nhóm');
      router.push('/messages');
    } catch (error) {
      toast.error((error as IBackendError).data?.message || 'Có lỗi xảy ra khi rời nhóm');
    }
  };

  return (
    <>
      <div className="flex-1 flex flex-col bg-background h-full overflow-hidden relative">
        <ChatHeader
          chatRoom={chatRoom}
          onToggleDetails={toggle}
          isDetailsOpen={isDetailsOpen}
          onShowPinnedMessages={() => setIsPinnedPanelOpen(!isPinnedPanelOpen)}
          onOpenSearch={handleOpenSearch}
          pinnedMessagesCount={pinnedMessages.length}
          readOnly={isDissolved}
          disableCallActions={isChatLocked}
          onStartVoiceCall={onStartVoiceCall}
          onStartVideoCall={onStartVideoCall}
          showOngoingCallInfo={showOngoingCallInfo}
          callSession={callSession}
          ongoingParticipantsCount={ongoingParticipantsCount}
          canJoinOngoingCall={canJoinOngoingCall}
          isJoiningOngoingCall={isJoiningOngoingCall}
          onJoinOngoingCall={onJoinOngoingCall}
        />
        <MessageList
          messages={messages}
          currentUserId={currentUserId}
          isGroup={isGroup}
          onLoadOlderMessages={onLoadOlderMessages}
          hasOlderMessages={hasOlderMessages}
          isLoadingOlderMessages={isLoadingOlderMessages}
          onReplyMessage={isDissolved ? undefined : onReplyMessage}
          onNavigateToMessage={isDissolved ? undefined : onNavigateToMessage}
          onForwardMessage={isDissolved ? undefined : onForwardMessage}
          isForwardingMessage={isDissolved ? false : isForwardingMessage}
          onHideMessage={isDissolved || chatRoom.type === ChatRoomType.AI ? undefined : onHideMessage}
          isHidingMessage={isDissolved || chatRoom.type === ChatRoomType.AI ? undefined : isHidingMessage}
          onDeleteMessage={isDissolved ? undefined : onDeleteMessage}
          isDeletingMessage={isDissolved ? undefined : isDeletingMessage}
          onRecallMessage={isDissolved ? undefined : onRecallMessage}
          isRecallingMessage={isDissolved ? undefined : isRecallingMessage}
          onPinMessage={isDissolved ? undefined : onPinMessage}
          onUnpinMessage={isDissolved ? undefined : onUnpinMessage}
          isPinnedMessage={isDissolved ? undefined : isPinnedMessage}
          isPinningMessage={isDissolved ? undefined : isPinningMessage}
        />
        {isDissolved ? (
          <div className="border-t border-border bg-card px-4 py-3 text-sm text-muted-foreground text-center">
            <div className="text-sm font-semibold text-rose-600">Bạn không thể gửi tin nhắn vào nhóm.</div>
            <div className="text-sm text-muted-foreground mt-1">
              Nhóm đã giải tán và bạn không thể gửi hoặc nhận cuộc gọi hoặc tin nhắn.
            </div>
            <div className="mt-3 flex justify-center">
              <Button variant="destructive" onClick={() => setClearDialogOpen(true)} className="w-full rounded-2xl">
                Xóa tin nhắn
              </Button>
            </div>
            <ConfirmDialog
              open={clearDialogOpen}
              onOpenChange={setClearDialogOpen}
              title="Xóa tất cả tin nhắn?"
              description="Bạn có chắc chắn muốn xóa toàn bộ tin nhắn trong cuộc trò chuyện này? Hành động không thể hoàn tác."
              confirmText="Xóa"
              cancelText="Hủy"
              confirmBtnClass="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl text-white"
              disableCancel={isLeavingGroup}
              disableConfirm={isLeavingGroup}
              isLoading={isLeavingGroup}
              onConfirm={handleLeaveGroup}
            />
          </div>
        ) : isChatLocked ? (
          <div className="border-t border-border bg-card px-4 py-3 text-sm text-muted-foreground text-center">
            {chatBlockedReason}
          </div>
        ) : (
          <MessageInput
            onSendMessage={onSendMessage}
            onSendContactCards={onSendContactCards}
            replyTarget={replyTarget}
            onCancelReply={onCancelReply}
            disabled={isChatLocked}
          />
        )}

        <PinnedMessagesPanel
          open={isPinnedPanelOpen}
          onOpenChange={setIsPinnedPanelOpen}
          pinnedMessages={pinnedMessages}
          isLoadingPinnedMessages={isLoadingPinnedMessages}
          onUnpin={onUnpinMessage ? onUnpinMessage : () => {}}
          isUnpinning={isPinningMessage ? isPinningMessage : () => false}
          onNavigateToMessage={onNavigateToMessage}
          readOnly={isDissolved}
        />

        {searchDialogOpen && (
          <SearchMessagesDialog
            open={searchDialogOpen}
            onOpenChange={handleSearchDialogOpenChange}
            chatRoomId={chatRoom.roomId}
            onNavigateToMessage={onNavigateToMessage}
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

      {isDetailsOpen && isGroup && (
        <GroupDetailsPanel
          chatRoom={chatRoom}
          isOpen={isDetailsOpen}
          onClose={close}
          readOnly={isDissolved}
          handleLeaveGroup={handleLeaveGroup}
          isLeavingGroup={isLeavingGroup}
        />
      )}
    </>
  );
}
