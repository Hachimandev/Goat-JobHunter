import { IBackendRes, IModelPaginate } from '@/types/api';
import { ChatRoom, MessageResponse } from '@/types/model';

export type FetchChatRoomsRequest = {
  page?: number;
  size?: number;
};

export type FetchMessagesInChatRoomRequest = {
  chatRoomId: number;
  page?: number;
  size?: number;
};

export type FetchChatRoomAssetsRequest = {
  chatRoomId: number;
  page?: number;
  size?: number;
};

export type SearchMessagesInChatRoomRequest = {
  chatRoomId: number;
  searchTerm: string;
  page?: number;
  size?: number;
};

export type FetchChatRoomsResponse = IBackendRes<IModelPaginate<ChatRoom>>;

export type FetchMessagesInChatRoomResponse = IBackendRes<IModelPaginate<MessageResponse>>;

export type SendMessageToChatRoomRequest = {
  chatRoomId: number;
  content?: string;
  files?: File[];
  replyToMessageId?: string | null;
};

export type SendMessageToNewChatRoomRequest = {
  accountId: number;
  content?: string;
  files?: File[];
};

export type SendContactCardsToChatRoomRequest = {
  chatRoomId: number;
  userIds: number[];
};

export type RecallMessageRequest = {
  chatRoomId: number;
  messageId: string;
};

export type HideMessageRequest = {
  chatRoomId: number;
  messageId: string;
};

export type DeleteMessagePermanentRequest = {
  chatRoomId: number;
  messageId: string;
};

export type ForwardMessageBatchRequest = {
  sourceChatRoomId: number;
  messageId: string;
  targetChatRoomIds: number[];
};

export type ForwardMessageFailureItem = {
  chatRoomId: number;
  reason?: string;
};

export type ForwardMessageBatchResponse = {
  successfulTargetChatRoomIds?: number[];
  failedTargetChatRooms?: ForwardMessageFailureItem[];
  successCount?: number;
  failedCount?: number;
};

export type SendContactCardsSubmitResult = {
  requestedCount: number;
  successCount: number;
  failedCount: number;
  successfulUserIds: number[];
  failedUserIds: number[];
};

export type CountUnreadMessagesRequest = {
  page?: number;
  size?: number;
};
export type CountUnreadMessagesResponse = IBackendRes<
  {
    chatRoomId: number;
    unreadCount: number;
  }[]
>;
