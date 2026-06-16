import { MessageTypeEnum } from '@/types/enum';
import { MessageMediaItem, MessageResponse } from '@/types/model';
import { Photo } from 'react-photo-album';

export type ChatMediaKind = 'image' | 'video' | 'audio';

export interface ChatMediaPhoto extends Photo {
  messageId: string;
  parentMessageId: string;
  mediaKind: ChatMediaKind;
}

const IMAGE_EXTENSION_PATTERN = /\.(jpg|jpeg|png|gif|webp|avif|svg|bmp)$/i;
const VIDEO_EXTENSION_PATTERN = /\.(mp4|mov|webm|m4v|avi|mkv)$/i;
const AUDIO_EXTENSION_PATTERN = /\.(mp3|wav|ogg|m4a|aac|flac)$/i;

const normalizeMessageType = (value: unknown): MessageTypeEnum | null => {
  if (typeof value !== 'string') {
    return null;
  }

  const normalizedType = value.trim().toUpperCase();

  if (normalizedType === MessageTypeEnum.IMAGE) {
    return MessageTypeEnum.IMAGE;
  }

  if (normalizedType === MessageTypeEnum.VIDEO) {
    return MessageTypeEnum.VIDEO;
  }

  if (normalizedType === MessageTypeEnum.AUDIO) {
    return MessageTypeEnum.AUDIO;
  }

  if (normalizedType === MessageTypeEnum.MEDIA) {
    return MessageTypeEnum.MEDIA;
  }

  return null;
};

const inferMediaKindFromUrl = (url: string): ChatMediaKind | null => {
  const sanitizedUrl = url.split('?')[0].toLowerCase();

  if (IMAGE_EXTENSION_PATTERN.test(sanitizedUrl)) {
    return 'image';
  }

  if (VIDEO_EXTENSION_PATTERN.test(sanitizedUrl)) {
    return 'video';
  }

  if (AUDIO_EXTENSION_PATTERN.test(sanitizedUrl)) {
    return 'audio';
  }

  return null;
};

const getMediaUrlFromItem = (item: MessageMediaItem): string | null => {
  if (!item.url || item.url.trim().length === 0) {
    return null;
  }

  return item.url.trim();
};

const resolveMediaKindFromItem = (item: MessageMediaItem, mediaUrl: string): ChatMediaKind | null => {
  if (item.mediaType.toLowerCase() === 'image') {
    return 'image';
  }

  if (item.mediaType.toLowerCase() === 'video') {
    return 'video';
  }

  if (item.mediaType.toLowerCase() === 'audio') {
    return 'audio';
  }

  return inferMediaKindFromUrl(mediaUrl);
};

const toChatMediaPhoto = (
  parentMessageId: string,
  itemId: string,
  mediaKind: ChatMediaKind,
  mediaUrl: string,
  sequence: number,
): ChatMediaPhoto => ({
  src: mediaUrl,
  width: 1,
  height: 1,
  alt: `${mediaKind === 'video' ? 'Video' : mediaKind === 'audio' ? 'Audio' : 'Image'} ${sequence}`,
  key: `${parentMessageId}-${itemId}`,
  messageId: `${parentMessageId}-${itemId}`,
  parentMessageId,
  mediaKind,
});

export const getMessageMediaPhotos = (message: MessageResponse): ChatMediaPhoto[] => {
  const mediaItems = [...(message.mediaItems ?? [])].sort((a, b) => a.displayOrder - b.displayOrder);

  const normalizedMediaItems = mediaItems
    .map((item, index) => {
      const mediaUrl = getMediaUrlFromItem(item);

      if (!mediaUrl) {
        return null;
      }

      const mediaKind = resolveMediaKindFromItem(item, mediaUrl);

      if (!mediaKind) {
        return null;
      }

      return toChatMediaPhoto(message.messageId, `${item.displayOrder}-${index}`, mediaKind, mediaUrl, index + 1);
    })
    .filter((item): item is ChatMediaPhoto => Boolean(item));

  if (normalizedMediaItems.length > 0) {
    return normalizedMediaItems;
  }

  const normalizedType = normalizeMessageType(message.messageType);
  const normalizedContent = message.content?.trim();

  if (!normalizedContent) {
    return [];
  }

  if (normalizedType === MessageTypeEnum.IMAGE) {
    return [toChatMediaPhoto(message.messageId, message.messageId, 'image', normalizedContent, 1)];
  }

  if (normalizedType === MessageTypeEnum.VIDEO) {
    return [toChatMediaPhoto(message.messageId, message.messageId, 'video', normalizedContent, 1)];
  }

  if (normalizedType === MessageTypeEnum.AUDIO) {
    return [toChatMediaPhoto(message.messageId, message.messageId, 'audio', normalizedContent, 1)];
  }

  if (normalizedType === MessageTypeEnum.MEDIA) {
    const fallbackMediaKind = inferMediaKindFromUrl(normalizedContent);

    if (!fallbackMediaKind) {
      return [];
    }

    return [toChatMediaPhoto(message.messageId, message.messageId, fallbackMediaKind, normalizedContent, 1)];
  }

  return [];
};

export const isImageMediaMessage = (message: MessageResponse): boolean => {
  return getMessageMediaPhotos(message).some((item) => item.mediaKind === 'image');
};

export const isVideoMediaMessage = (message: MessageResponse): boolean => {
  return getMessageMediaPhotos(message).some((item) => item.mediaKind === 'video');
};

export const isAudioMediaMessage = (message: MessageResponse): boolean => {
  return getMessageMediaPhotos(message).some((item) => item.mediaKind === 'audio');
};

const formatChatMediaForPhotoAlbum = (media: MessageResponse[] = []): ChatMediaPhoto[] => {
  return media.flatMap((message) => getMessageMediaPhotos(message));
};

export default formatChatMediaForPhotoAlbum;
