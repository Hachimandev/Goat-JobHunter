'use client';

import { ChatWindow } from '@/app/(chat)/messages/components/ChatWindow';
import { ForwardMessageModal } from '@/app/(chat)/messages/components/ForwardMessageModal';
import { useParams } from 'next/navigation';
import { useFetchChatRoomsByIdQuery, useFetchMessagesInChatRoomQuery } from '@/services/chatRoom/chatRoomApi';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { subscribeToChatRoom, unsubscribeFromChatRoom } from '@/services/chatRoom/message/messageApi';
import { useUser } from '@/hooks/useUser';
import useChatRoomAndMessageActions from '@/hooks/useChatRoomAndMessageActions';
import { MessageType, PinnedMessage } from '@/types/model';
import { ChatRoomType } from '@/types/enum';
import { useAppSelector } from '@/lib/hooks';
import { selectLastFriendshipRealtimeEventAt } from '@/lib/features/friendshipSlice';
import {
  usePinMessageMutation,
  useUnpinMessageMutation,
  useGetPinnedMessagesQuery,
} from '@/services/chatRoom/pinned_message/pinnedMessageApi';
import { toast } from 'sonner';
import { IBackendError } from '@/types/api';

export default function ChatRoomPage() {
  const params = useParams();
  const chatRoomId = params?.id as string;
  const { user } = useUser();
  const lastFriendshipRealtimeEventAt = useAppSelector(selectLastFriendshipRealtimeEventAt);
  const [forwardMessage, setForwardMessage] = useState<MessageType | null>(null);
  const [replyMessage, setReplyMessage] = useState<MessageType | null>(null);
  const [forwardModalOpen, setForwardModalOpen] = useState(false);
  const [pinnedMessageIds, setPinnedMessageIds] = useState<Set<string>>(new Set());
  const [pinningMessageIds, setPinningMessageIds] = useState<Set<string>>(new Set());

  const {
    handleSendMessage,
    handleDeleteMessage,
    handleForwardMessage,
    handleRecallMessage,
    isDeletingMessage,
    isForwardingMessage,
    isRecallingMessage,
  } = useChatRoomAndMessageActions();

  // Subscribe vào chat room khi component mount
  useEffect(() => {
    if (chatRoomId && !isNaN(Number(chatRoomId))) {
      subscribeToChatRoom(Number(chatRoomId));

      return () => {
        unsubscribeFromChatRoom(Number(chatRoomId));
      };
    }
  }, [chatRoomId]);

  const [pinMessage] = usePinMessageMutation();
  const [unpinMessage] = useUnpinMessageMutation();
  const { data: pinnedMessagesData, isLoading: isLoadingPinnedMessages } = useGetPinnedMessagesQuery(
    { chatRoomId: Number(chatRoomId) },
    { skip: !chatRoomId || isNaN(Number(chatRoomId)) },
  );

  const { data: messagesData, isLoading } = useFetchMessagesInChatRoomQuery(
    {
      chatRoomId: Number(chatRoomId),
      size: 50,
      page: 1,
    },
    { skip: !chatRoomId || isNaN(Number(chatRoomId)) },
  );

  const { data: chatRoomsData, refetch: refetchChatRoom } = useFetchChatRoomsByIdQuery(Number(chatRoomId), {
    skip: !chatRoomId || isNaN(Number(chatRoomId)),
  });

  useEffect(() => {
    if (!lastFriendshipRealtimeEventAt || !chatRoomId || isNaN(Number(chatRoomId))) {
      return;
    }

    void refetchChatRoom();
  }, [chatRoomId, lastFriendshipRealtimeEventAt, refetchChatRoom]);

  useEffect(() => {
    if (pinnedMessagesData?.data) {
      const pinnedIds = new Set(pinnedMessagesData.data.map((msg: PinnedMessage) => msg.messageId));
      setPinnedMessageIds(pinnedIds);
    }
  }, [pinnedMessagesData]);

  const currentChatRoom = useMemo(() => {
    return chatRoomsData?.data || null;
  }, [chatRoomsData]);

  const messages = useMemo(() => {
    // Manually sort messages by createdAt ascending, fallback to empty array if no messages
    return [...(messagesData?.data || [])].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );
  }, [messagesData]);

  const isDirectBlocked = currentChatRoom?.type === ChatRoomType.DIRECT && Boolean(currentChatRoom?.blocked);
  const isBlockedByMe = isDirectBlocked && Boolean(currentChatRoom?.blockedByMe);
  const blockedReason = isBlockedByMe
    ? 'Bạn đã chặn người này. Hãy bỏ chặn để tiếp tục nhắn tin.'
    : 'Bạn không thể nhắn tin với người này.';

  const handleNavigateToMessage = useCallback((targetMessageId: string) => {
    if (!targetMessageId) {
      return;
    }

    const escapedId =
      typeof CSS !== 'undefined' && typeof CSS.escape === 'function' ? CSS.escape(targetMessageId) : targetMessageId;

    const targetElement = document.querySelector(`[data-message-id="${escapedId}"]`) as HTMLElement | null;

    if (!targetElement) {
      return;
    }

    targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    targetElement.focus({ preventScroll: true });
  }, []);

  const handlePinMessage = useCallback(
    async (messageId: string) => {
      try {
        setPinningMessageIds((prev) => new Set([...prev, messageId]));
        await pinMessage({
          chatRoomId: Number(chatRoomId),
          messageId,
        }).unwrap();
        setPinnedMessageIds((prev) => new Set([...prev, messageId]));
        toast.success('Tin nhắn đã được ghim');
      } catch (error: unknown) {
        toast.error((error as IBackendError).data?.message || 'Không thể ghim tin nhắn');
      } finally {
        setPinningMessageIds((prev) => {
          const next = new Set(prev);
          next.delete(messageId);
          return next;
        });
      }
    },
    [chatRoomId, pinMessage],
  );

  const handleUnpinMessage = useCallback(
    async (messageId: string) => {
      try {
        setPinningMessageIds((prev) => new Set([...prev, messageId]));
        await unpinMessage({
          chatRoomId: Number(chatRoomId),
          messageId,
        }).unwrap();
        setPinnedMessageIds((prev) => {
          const next = new Set(prev);
          next.delete(messageId);
          return next;
        });
        toast.success('Bỏ ghim tin nhắn thành công');
      } catch (error: unknown) {
        toast.error((error as IBackendError).data?.message || 'Không thể bỏ ghim tin nhắn');
      } finally {
        setPinningMessageIds((prev) => {
          const next = new Set(prev);
          next.delete(messageId);
          return next;
        });
      }
    },
    [chatRoomId, unpinMessage],
  );

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Đang tải...</p>
      </div>
    );
  }

  if (!currentChatRoom) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <p className="text-lg text-muted-foreground">Không tìm thấy đoạn chat</p>
      </div>
    );
  }

  const handleOpenForwardModal = (message: MessageType) => {
    setForwardMessage(message);
    setForwardModalOpen(true);
  };

  const handleForwardModalOpenChange = (open: boolean) => {
    setForwardModalOpen(open);
    if (!open) {
      setForwardMessage(null);
    }
  };

  const handleConfirmForward = async (targetChatRoomIds: number[]) => {
    if (!forwardMessage) {
      return null;
    }

    const result = await handleForwardMessage(Number(chatRoomId), forwardMessage.messageId, targetChatRoomIds);

    if (result && result.failedCount === 0) {
      handleForwardModalOpenChange(false);
    }

    return result;
  };

  return (
    <>
      <ChatWindow
        chatRoom={currentChatRoom}
        messages={messages}
        currentUserId={user?.accountId?.toString()}
        isChatBlocked={isDirectBlocked}
        chatBlockedReason={blockedReason}
        onDirectRelationshipChanged={() => {
          void refetchChatRoom();
        }}
        onSendMessage={async (text, files, replyToMessageId) => {
          if (isDirectBlocked) {
            return;
          }

          await handleSendMessage(Number(chatRoomId), text, files, replyToMessageId);
          setReplyMessage(null);
        }}
        replyTarget={replyMessage}
        onCancelReply={() => setReplyMessage(null)}
        onReplyMessage={setReplyMessage}
        onNavigateToMessage={handleNavigateToMessage}
        onForwardMessage={handleOpenForwardModal}
        isForwardingMessage={isForwardingMessage}
        onDeleteMessage={async (messageId) => {
          await handleDeleteMessage(Number(chatRoomId), messageId);
        }}
        isDeletingMessage={isDeletingMessage}
        onRecallMessage={async (messageId) => {
          await handleRecallMessage(Number(chatRoomId), messageId);
        }}
        isRecallingMessage={isRecallingMessage}
        onPinMessage={handlePinMessage}
        onUnpinMessage={handleUnpinMessage}
        isPinnedMessage={(messageId: string) => pinnedMessageIds.has(messageId)}
        isPinningMessage={(messageId: string) => pinningMessageIds.has(messageId)}
        pinnedMessages={pinnedMessagesData?.data || []}
        isLoadingPinnedMessages={isLoadingPinnedMessages}
      />

      <ForwardMessageModal
        open={forwardModalOpen}
        onOpenChange={handleForwardModalOpenChange}
        sourceChatRoomId={Number(chatRoomId)}
        message={forwardMessage}
        isSubmitting={isForwardingMessage}
        onConfirm={handleConfirmForward}
      />
    </>
  );
}
