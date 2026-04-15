import { IBackendRes } from '@/types/api';
import { PinnedMessage } from '@/types/model';

export type PinMessageRequest = {
  chatRoomId: number;
  messageId: string;
};
export type PinMessageResponse = IBackendRes<PinnedMessage>;

export type FetchPinnedMessagesInChatRoomRequest = {
  chatRoomId: number;
};
export type FetchPinnedMessagesInChatRoomResponse = IBackendRes<PinnedMessage[]>;
