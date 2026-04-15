import { MessageTypeEnum } from '@/types/enum';
import { MessageResponse } from '@/types/model';
import { Photo } from 'react-photo-album';

export type ChatMediaKind = 'image' | 'video';

export interface ChatMediaPhoto extends Photo {
  messageId: string;
  mediaKind: ChatMediaKind;
}

export const isImageMediaMessage = (message: MessageResponse): boolean => {
  return message.messageType === MessageTypeEnum.IMAGE;
};

export const isVideoMediaMessage = (message: MessageResponse): boolean => {
  return message.messageType === MessageTypeEnum.VIDEO;
};

const formatChatMediaForPhotoAlbum = (media: MessageResponse[] = []): ChatMediaPhoto[] => {
  return media
    .filter((message) => Boolean(message.content))
    .map((message, index) => ({
      src: message.content,
      width: 1,
      height: 1,
      alt: `${isVideoMediaMessage(message) ? 'Video' : 'Image'} ${index + 1}`,
      key: message.messageId,
      messageId: message.messageId,
      mediaKind: isVideoMediaMessage(message) ? 'video' : 'image',
    }));
};

export default formatChatMediaForPhotoAlbum;
