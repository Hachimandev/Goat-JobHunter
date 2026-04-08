import {
  useDeleteMessagePermanentMutation,
  useRecallMessageMutation,
  useSendMessageToChatRoomMutation,
  useSendMessageToNewChatRoomMutation,
} from '@/services/chatRoom/chatRoomApi';
import { toast } from 'sonner';
import { useUser } from '@/hooks/useUser';
import { useRouter } from 'next/navigation';
import { usePendingMessages } from '@/contexts/PendingMessagesContext';
import { useCallback, useState } from 'react';

type ApiMutationError = {
  status?: number;
  data?: {
    message?: string;
    data?: {
      message?: string;
    };
  };
};

const useChatRoomAndMessageActions = () => {
  const { user, isSignedIn } = useUser();
  const router = useRouter();
  const { addPendingMessage, removePendingMessage } = usePendingMessages();
  const [sendMessageToChatRoom, { isLoading: isSendingMessage }] = useSendMessageToChatRoomMutation();
  const [sendMessageToNewChatRoom, { isLoading: isSendingNewMessage }] = useSendMessageToNewChatRoomMutation();
  const [deleteMessagePermanent] = useDeleteMessagePermanentMutation();
  const [recallMessage] = useRecallMessageMutation();
  const [deletingMessageIds, setDeletingMessageIds] = useState<Set<string>>(new Set());
  const [recallingMessageIds, setRecallingMessageIds] = useState<Set<string>>(new Set());

  const getDeleteMessageError = (error: unknown) => {
    const apiError = error as ApiMutationError;

    if (apiError?.status === 403) {
      return 'Bạn không có quyền xóa tin nhắn này.';
    }

    if (apiError?.status === 404) {
      return 'Tin nhắn không tồn tại hoặc đã bị xóa.';
    }

    return apiError?.data?.message || apiError?.data?.data?.message || 'Không thể xóa tin nhắn.';
  };

  const handleSendMessage = async (chatRoomId: number, content?: string, files?: File[]) => {
    let pendingId: string | null = null;

    try {
      if (!isSignedIn || !user) {
        toast.error('Vui lòng đăng nhập để gửi tin nhắn.');
        return;
      }

      if (!chatRoomId) {
        toast.error('Không tìm thấy đoạn chat.');
        return;
      }

      if ((content && content.trim()) || (files && files.length)) {
        pendingId = addPendingMessage(content, files);
        console.log('Send message: ', { chatRoomId, content, files });
        await sendMessageToChatRoom({ chatRoomId, content, files }).unwrap();
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Gửi tin nhắn thất bại.');
    } finally {
      if (pendingId) {
        removePendingMessage(pendingId);
      }
    }
  };

  const handleSendMessageToNewChat = async (recipientId: string | null, content?: string, files?: File[]) => {
    let pendingId: string | null = null;

    try {
      if (!isSignedIn || !user) {
        toast.error('Vui lòng đăng nhập để gửi tin nhắn.');
        return;
      }

      if (!recipientId || isNaN(Number(recipientId))) {
        console.log('Invalid recipient ID');
        return;
      }

      if ((content && content.trim()) || (files && files.length)) {
        pendingId = addPendingMessage(content, files);
        console.log('Send message: ', { recipientId, content, files });
        const response = await sendMessageToNewChatRoom({
          accountId: Number(recipientId),
          content,
          files,
        }).unwrap();

        const roomId = response?.data?.roomId;

        if (roomId) {
          router.replace(`/messages/${roomId}`);
        }
      }
    } catch (error) {
      console.error('Error sending message to new chat:', error);
      toast.error('Gửi tin nhắn thất bại.');
    } finally {
      if (pendingId) {
        removePendingMessage(pendingId);
      }
    }
  };

  const handleRecallMessage = async (chatRoomId: number, messageId: string) => {
    try {
      if (!isSignedIn || !user) {
        toast.error('Vui lòng đăng nhập để thu hồi tin nhắn.');
        return;
      }

      if (!chatRoomId || !messageId) {
        toast.error('Không thể thu hồi tin nhắn.');
        return;
      }

      if (recallingMessageIds.has(messageId)) {
        return;
      }

      setRecallingMessageIds((prev) => {
        const next = new Set(prev);
        next.add(messageId);
        return next;
      });

      await recallMessage({ chatRoomId, messageId }).unwrap();
    } catch (error) {
      console.error('Error recalling message:', error);
      toast.error('Thu hồi tin nhắn thất bại.');
    } finally {
      setRecallingMessageIds((prev) => {
        const next = new Set(prev);
        next.delete(messageId);
        return next;
      });
    }
  };

  const handleDeleteMessage = async (chatRoomId: number, messageId: string) => {
    try {
      if (!isSignedIn || !user) {
        toast.error('Vui lòng đăng nhập để xóa tin nhắn.');
        return;
      }

      if (!chatRoomId || !messageId) {
        toast.error('Không thể xóa tin nhắn.');
        return;
      }

      if (deletingMessageIds.has(messageId)) {
        return;
      }

      setDeletingMessageIds((prev) => {
        const next = new Set(prev);
        next.add(messageId);
        return next;
      });

      await deleteMessagePermanent({ chatRoomId, messageId }).unwrap();
    } catch (error) {
      console.error('Error deleting message:', error);
      toast.error(getDeleteMessageError(error));
    } finally {
      setDeletingMessageIds((prev) => {
        const next = new Set(prev);
        next.delete(messageId);
        return next;
      });
    }
  };

  const isRecallingMessage = useCallback(
    (messageId: string) => recallingMessageIds.has(messageId),
    [recallingMessageIds],
  );

  const isDeletingMessage = useCallback((messageId: string) => deletingMessageIds.has(messageId), [deletingMessageIds]);

  return {
    handleSendMessage,
    handleSendMessageToNewChat,
    handleDeleteMessage,
    handleRecallMessage,
    isDeletingMessage,
    isRecallingMessage,
    isSendingMessage,
    isSendingNewMessage,
  };
};

export default useChatRoomAndMessageActions;
