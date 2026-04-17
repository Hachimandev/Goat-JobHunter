import { MessageTypeEnum } from '@/types/enum';
import type { MessageReplyContext, MessageResponse } from '@/types/model';
import { extractPlainTextFromHtml } from '@/utils/extractPlainTextFromHtml';
import { truncate } from 'lodash';

export const RECALLED_MESSAGE_PREVIEW = 'Tin nhắn đã được thu hồi';
export const UNAVAILABLE_MESSAGE_PREVIEW = 'Tin nhắn không khả dụng';
export const DEFAULT_TEXT_MESSAGE_PREVIEW = '[Tin nhắn văn bản]';

type SenderPreview = {
  fullName?: string | null;
  username?: string | null;
} | null;

type MessagePreviewSource = Pick<MessageResponse, 'isHidden' | 'messageType' | 'content'>;

export const getMessageSenderDisplayName = (sender: SenderPreview | undefined, fallback = 'Người dùng'): string => {
  return sender?.fullName || sender?.username || fallback;
};

export const getMessageTypePreviewText = (messageType: MessageTypeEnum | null | undefined): string => {
  if (messageType === MessageTypeEnum.IMAGE) {
    return '[Hình ảnh]';
  }

  if (messageType === MessageTypeEnum.VIDEO) {
    return '[Video]';
  }

  if (messageType === MessageTypeEnum.AUDIO) {
    return '[Âm thanh]';
  }

  if (messageType === MessageTypeEnum.FILE) {
    return '[Tệp đính kèm]';
  }

  if (messageType === MessageTypeEnum.CONTACT_CARD) {
    return '[Danh thiếp]';
  }

  return DEFAULT_TEXT_MESSAGE_PREVIEW;
};

export const getMessagePreviewText = (message: MessagePreviewSource, maxLength = 80): string => {
  if (message.isHidden) {
    return RECALLED_MESSAGE_PREVIEW;
  }

  if (message.messageType !== MessageTypeEnum.TEXT) {
    return getMessageTypePreviewText(message.messageType);
  }

  const plainText = extractPlainTextFromHtml(message.content || '').trim();

  if (!plainText) {
    return DEFAULT_TEXT_MESSAGE_PREVIEW;
  }

  return truncate(plainText, { length: maxLength });
};

export const getReplyContextPreviewText = (replyContext: MessageReplyContext): string => {
  if (replyContext.originalMessageUnavailable) {
    return UNAVAILABLE_MESSAGE_PREVIEW;
  }

  if (replyContext.originalMessageHidden) {
    return RECALLED_MESSAGE_PREVIEW;
  }

  if (replyContext.originalMessageType !== MessageTypeEnum.TEXT) {
    return getMessageTypePreviewText(replyContext.originalMessageType);
  }

  const previewText = (replyContext.originalContentPreview || '').trim();

  if (previewText) {
    return previewText;
  }

  return getMessageTypePreviewText(replyContext.originalMessageType);
};
