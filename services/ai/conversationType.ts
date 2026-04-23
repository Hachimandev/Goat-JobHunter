import { IBackendRes, IModelPaginate } from '@/types/api';
import { MessageTypeRole } from '@/types/enum';

export type GetConversationsParams = {
  title?: string;
  page?: number;
  size?: number;
};

export type CreateConversationRequest = {
  title?: string;
};

export type RenameConversationRequest = {
  conversationId: number;
  title: string;
};

export type UpdateConversationPinRequest = {
  conversationId: number;
  pinned: boolean;
};

export type DeleteConversationRequest = {
  conversationId: number;
};

export type ChatAIRequest = {
  conversationId: number;
  message: string;
};

export type GetConversationMessagesParams = {
  conversationId: number;
  page?: number;
  size?: number;
};

export type AIConversation = {
  conversationId: number;
  title: string;
  pinned: boolean;
  createdAt: string;
  updatedAt: string | null;
};

export type AIMessage = {
  aiMessageId: number;
  role: MessageTypeRole;
  content: string;
  createdAt: string;
  updatedAt: string;
};

export type AIMessageStatus = 'sent' | 'pending' | 'failed';

export type AIMessageViewModel = AIMessage & {
  id: string;
  status: AIMessageStatus;
  errorMessage?: string;
};

export type MessageSummary = {
  chatRoomId: number;
  unreadCount: number;
  summary: string;
  isSummarized: boolean;
};

export type GetConversationsResponse = IBackendRes<IModelPaginate<AIConversation>>;

export type ConversationResponse = IBackendRes<AIConversation>;

export type ConversationPinnedResponse = IBackendRes<{ conversationId: number; pinned: boolean }>;

export type GetMessageOfConversationResponse = IBackendRes<IModelPaginate<AIMessage>>;

export type GetUnreadMessagesSummaryResponse = IBackendRes<MessageSummary>;
