import { RECALLED_MESSAGE_PREVIEW, UNAVAILABLE_MESSAGE_PREVIEW } from '@/utils/messageUtils';
import type { MessageType } from '@/types/model';

const isReplyingToMessage = (message: MessageType, originalMessageId: string): boolean => {
  return message.replyToMessageId === originalMessageId && Boolean(message.replyContext);
};

export const cascadeReplyContextForRecalledMessage = (messages: MessageType[], originalMessageId: string): void => {
  if (!originalMessageId) {
    return;
  }

  messages.forEach((message) => {
    if (!isReplyingToMessage(message, originalMessageId) || !message.replyContext) {
      return;
    }

    message.replyContext.originalMessageHidden = true;
    message.replyContext.originalMessageUnavailable = false;
    message.replyContext.originalContentPreview = RECALLED_MESSAGE_PREVIEW;
  });
};

export const cascadeReplyContextForDeletedMessage = (messages: MessageType[], originalMessageId: string): void => {
  if (!originalMessageId) {
    return;
  }

  messages.forEach((message) => {
    if (!isReplyingToMessage(message, originalMessageId) || !message.replyContext) {
      return;
    }

    message.replyContext.originalMessageUnavailable = true;
    message.replyContext.originalMessageHidden = false;
    message.replyContext.originalSender = null;
    message.replyContext.originalMessageType = null;
    message.replyContext.originalContentPreview = UNAVAILABLE_MESSAGE_PREVIEW;
  });
};
