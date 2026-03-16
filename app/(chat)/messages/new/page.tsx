'use client';

import { ChatWindow } from '@/app/(chat)/messages/components/ChatWindow';
import { useSearchParams } from 'next/navigation';
import { useUser } from '@/hooks/useUser';
import { useMemo } from 'react';
import { ChatRoom } from '@/types/model';
import { ChatRoomType } from '@/types/enum';
import { useFetchUserByIdQuery } from '@/services/user/userApi';
import useChatRoomAndMessageActions from '@/hooks/useChatRoomAndMessageActions';

export default function NewChatRoomPage() {
  const searchParams = useSearchParams();
  const recipientId = searchParams.get('recipient');
  const { user } = useUser();
  const { handleSendMessageToNewChat } = useChatRoomAndMessageActions();

  const { data } = useFetchUserByIdQuery(recipientId!, {
    skip: !recipientId || isNaN(Number(recipientId)),
  });

  const chatRoom: ChatRoom = useMemo(() => {
    return {
      roomId: 1000, // Temporary ID for client-side only
      avatar: data?.data?.avatar || '',
      lastMessagePreview: 'Chưa có tin nhắn',
      name: data?.data?.fullName || data?.data?.username || 'C',
      type: ChatRoomType.DIRECT,
      lastMessageTime: new Date().toISOString(),
      memberCount: 2,
      currentUserSentLastMessage: true
    };
  }, [data?.data?.avatar, data?.data?.fullName, data?.data?.username]);

  return (
    <ChatWindow
      chatRoom={chatRoom}
      messages={[]}
      currentUserId={user?.accountId?.toString()}
      onSendMessage={(text, files) => handleSendMessageToNewChat(recipientId, text, files)}
    />
  );
}