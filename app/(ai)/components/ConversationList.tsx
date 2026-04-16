import React from 'react';
import ConversationCard from '@/app/(ai)/components/ConversationCard';
import { AIConversation } from '@/services/ai/conversationType';

interface ConversationListProps {
  conversations: AIConversation[];
  activeConversationId?: number | null;
  handleTogglePin: (conversationId: number, isPinned: boolean) => void;
  handleRename: (conversationId: number, newName: string) => void;
  handleDelete: (conversationId: number) => void;
  isLoading: boolean;
}

const ConversationList = ({
  conversations,
  activeConversationId,
  handleTogglePin,
  handleRename,
  handleDelete,
  isLoading,
}: ConversationListProps) => {
  return (
    <div className="space-y-2">
      {conversations.map((conv) => (
        <ConversationCard
          key={conv.conversationId}
          conv={conv}
          isActive={activeConversationId === conv.conversationId}
          isLoading={isLoading}
          handleTogglePin={handleTogglePin}
          handleRename={handleRename}
          handleDelete={handleDelete}
        />
      ))}
    </div>
  );
};
export default ConversationList;
