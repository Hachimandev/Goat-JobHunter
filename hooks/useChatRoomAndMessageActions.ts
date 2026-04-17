import {
  useDeleteMessagePermanentMutation,
  useForwardMessageBatchMutation,
  useRecallMessageMutation,
  useSendContactCardsToChatRoomMutation,
  useSendMessageToChatRoomMutation,
  useSendMessageToNewChatRoomMutation,
} from '@/services/chatRoom/chatRoomApi';
import { ForwardMessageBatchResponse, SendContactCardsSubmitResult } from '@/services/chatRoom/chatRoomType';
import { toast } from 'sonner';
import { useUser } from '@/hooks/useUser';
import { useRouter } from 'next/navigation';
import { usePendingMessages } from '@/contexts/PendingMessagesContext';
import { useCallback, useState } from 'react';
import { IBackendRes } from '@/types/api';
import { Visibility } from '@/types/enum';
import { MessageResponse } from '@/types/model';
import { extractApiErrorMessage, isAccountPrivateError, isBlockedInteractionError } from '@/utils/apiError';

export const ACCOUNT_PRIVATE_MESSAGE =
  'Tài khoản này đang ở chế độ riêng tư. Bạn không thể bắt đầu cuộc trò chuyện mới.';
export const BLOCKED_INTERACTION_MESSAGE = 'Bạn không thể nhắn tin với người này.';

type ApiMutationError = {
  status?: number;
  data?: {
    message?: string;
    data?: {
      message?: string;
    };
  };
};

const toPositiveUserId = (value: unknown): number | null => {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    return null;
  }

  return parsed;
};

const normalizeRequestedUserIds = (userIds: number[]): number[] => {
  return Array.from(new Set(userIds.map((id) => toPositiveUserId(id)).filter((id): id is number => id !== null)));
};

const normalizeContactCardSendResult = (
  response: IBackendRes<MessageResponse[]>,
  requestedUserIds: number[],
): SendContactCardsSubmitResult => {
  const normalizedRequestedUserIds = normalizeRequestedUserIds(requestedUserIds);

  const successfulUserIds = Array.from(
    new Set(
      (response?.data || [])
        .map((message) => toPositiveUserId(message.contactCard?.accountId) ?? toPositiveUserId(message.content))
        .filter((id: number | null): id is number => id !== null),
    ),
  );

  const successfulIdSet = new Set(successfulUserIds);
  const failedUserIds = normalizedRequestedUserIds.filter((id) => !successfulIdSet.has(id));

  return {
    requestedCount: normalizedRequestedUserIds.length,
    successCount: successfulUserIds.length,
    failedCount: failedUserIds.length,
    successfulUserIds,
    failedUserIds,
  };
};

export type ForwardMessageSubmitResult = {
  requestedCount: number;
  successCount: number;
  failedCount: number;
  successfulTargetChatRoomIds: number[];
  failedTargetChatRoomIds: number[];
};

const useChatRoomAndMessageActions = () => {
  const { user, isSignedIn } = useUser();
  const router = useRouter();
  const { addPendingMessage, removePendingMessage } = usePendingMessages();
  const [sendMessageToChatRoom, { isLoading: isSendingMessage }] = useSendMessageToChatRoomMutation();
  const [sendContactCardsToChatRoom, { isLoading: isSendingContactCards }] = useSendContactCardsToChatRoomMutation();
  const [sendMessageToNewChatRoom, { isLoading: isSendingNewMessage }] = useSendMessageToNewChatRoomMutation();
  const [deleteMessagePermanent] = useDeleteMessagePermanentMutation();
  const [forwardMessageBatch, { isLoading: isForwardingMessage }] = useForwardMessageBatchMutation();
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

  const getSendMessageError = (error: unknown, fallbackMessage: string) => {
    const apiError = error as ApiMutationError;

    if (isBlockedInteractionError(error) || apiError?.status === 403) {
      return BLOCKED_INTERACTION_MESSAGE;
    }

    return extractApiErrorMessage(error, fallbackMessage);
  };

  const getForwardMessageError = (error: unknown) => {
    const apiError = error as ApiMutationError;

    if (apiError?.status === 403) {
      return 'Bạn không có quyền chuyển tiếp tin nhắn này.';
    }

    if (apiError?.status === 404) {
      return 'Tin nhắn hoặc cuộc trò chuyện không tồn tại.';
    }

    return apiError?.data?.message || apiError?.data?.data?.message || 'Không thể chuyển tiếp tin nhắn.';
  };

  const normalizeForwardResult = (
    response: IBackendRes<ForwardMessageBatchResponse>,
    targetChatRoomIds: number[],
  ): ForwardMessageSubmitResult => {
    const normalizedTargetIds = Array.from(new Set(targetChatRoomIds));
    const requestedCount = normalizedTargetIds.length;

    const failedTargetChatRoomIds = Array.from(
      new Set((response?.data?.failedTargetChatRooms || []).map((item) => item.chatRoomId)),
    );

    const successfulTargetChatRoomIds = Array.from(
      new Set(
        response?.data?.successfulTargetChatRoomIds && response.data.successfulTargetChatRoomIds.length > 0
          ? response.data.successfulTargetChatRoomIds
          : normalizedTargetIds.filter((roomId) => !failedTargetChatRoomIds.includes(roomId)),
      ),
    );

    const successCount =
      typeof response?.data?.successCount === 'number'
        ? response.data.successCount
        : successfulTargetChatRoomIds.length;

    const failedCount =
      typeof response?.data?.failedCount === 'number'
        ? response.data.failedCount
        : Math.max(requestedCount - successCount, 0);

    return {
      requestedCount,
      successCount,
      failedCount,
      successfulTargetChatRoomIds,
      failedTargetChatRoomIds,
    };
  };

  const handleSendMessage = async (
    chatRoomId: number,
    content?: string,
    files?: File[],
    replyToMessageId?: string | null,
  ) => {
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
        pendingId = addPendingMessage(content, files, replyToMessageId);
        console.log('Send message: ', { chatRoomId, content, files, replyToMessageId });
        await sendMessageToChatRoom({ chatRoomId, content, files, replyToMessageId }).unwrap();
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error(getSendMessageError(error, 'Gửi tin nhắn thất bại.'));
    } finally {
      if (pendingId) {
        removePendingMessage(pendingId);
      }
    }
  };

  const handleSendMessageToNewChat = async (
    recipientId: string | null,
    content?: string,
    files?: File[],
    recipientVisibility?: Visibility | string | null,
  ) => {
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

      if (recipientVisibility === Visibility.PRIVATE) {
        toast.error(ACCOUNT_PRIVATE_MESSAGE);
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

      if (isAccountPrivateError(error)) {
        toast.error(ACCOUNT_PRIVATE_MESSAGE);
        return;
      }

      toast.error(getSendMessageError(error, 'Gửi tin nhắn thất bại.'));
    } finally {
      if (pendingId) {
        removePendingMessage(pendingId);
      }
    }
  };

  const handleSendContactCards = async (
    chatRoomId: number,
    userIds: number[],
  ): Promise<SendContactCardsSubmitResult | null> => {
    try {
      if (!isSignedIn || !user) {
        toast.error('Vui lòng đăng nhập để gửi danh thiếp.');
        return null;
      }

      if (!chatRoomId) {
        toast.error('Không tìm thấy đoạn chat.');
        return null;
      }

      const normalizedUserIds = normalizeRequestedUserIds(userIds);

      if (normalizedUserIds.length === 0) {
        toast.error('Vui lòng chọn ít nhất 1 người bạn hợp lệ.');
        return null;
      }

      const response = await sendContactCardsToChatRoom({ chatRoomId, userIds: normalizedUserIds }).unwrap();

      const result = normalizeContactCardSendResult(response, normalizedUserIds);

      if (result.failedCount === 0) {
        toast.success(
          result.successCount > 1
            ? `Đã gửi ${result.successCount} danh thiếp thành công.`
            : 'Đã gửi danh thiếp thành công.',
        );
      } else if (result.successCount > 0) {
        toast(`Đã gửi ${result.successCount}/${result.requestedCount} danh thiếp.`);
      } else {
        toast.error(response?.message || 'Không thể gửi danh thiếp.');
      }

      return result;
    } catch (error) {
      console.error('Error sending contact cards:', error);
      toast.error(getSendMessageError(error, 'Gửi danh thiếp thất bại.'));
      return null;
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

  const handleForwardMessage = async (
    sourceChatRoomId: number,
    messageId: string,
    targetChatRoomIds: number[],
  ): Promise<ForwardMessageSubmitResult | null> => {
    try {
      if (!isSignedIn || !user) {
        toast.error('Vui lòng đăng nhập để chuyển tiếp tin nhắn.');
        return null;
      }

      if (!sourceChatRoomId || !messageId) {
        toast.error('Không thể chuyển tiếp tin nhắn.');
        return null;
      }

      const normalizedTargetIds = Array.from(new Set(targetChatRoomIds));

      if (normalizedTargetIds.length === 0) {
        toast.error('Vui lòng chọn ít nhất 1 cuộc trò chuyện đích.');
        return null;
      }

      const response = await forwardMessageBatch({
        sourceChatRoomId,
        messageId,
        targetChatRoomIds: normalizedTargetIds,
      }).unwrap();

      const result = normalizeForwardResult(response, normalizedTargetIds);

      if (result.failedCount === 0) {
        toast.success('Đã chuyển tiếp tin nhắn thành công.');
      } else if (result.successCount > 0) {
        toast(`Đã chuyển tiếp ${result.successCount}/${result.requestedCount} cuộc trò chuyện.`);
      } else {
        toast.error(response?.message || 'Không thể chuyển tiếp tin nhắn.');
      }

      return result;
    } catch (error) {
      console.error('Error forwarding message:', error);
      toast.error(getForwardMessageError(error));
      return null;
    }
  };

  const isRecallingMessage = useCallback(
    (messageId: string) => recallingMessageIds.has(messageId),
    [recallingMessageIds],
  );

  const isDeletingMessage = useCallback((messageId: string) => deletingMessageIds.has(messageId), [deletingMessageIds]);

  return {
    handleSendMessage,
    handleSendContactCards,
    handleSendMessageToNewChat,
    handleDeleteMessage,
    handleForwardMessage,
    handleRecallMessage,
    isDeletingMessage,
    isForwardingMessage,
    isRecallingMessage,
    isSendingContactCards,
    isSendingMessage,
    isSendingNewMessage,
  };
};

export default useChatRoomAndMessageActions;
