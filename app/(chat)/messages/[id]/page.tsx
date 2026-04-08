'use client';

import { ChatWindow } from '@/app/(chat)/messages/components/ChatWindow';
import { useParams } from 'next/navigation';
import { useFetchChatRoomsByIdQuery, useFetchMessagesInChatRoomQuery } from '@/services/chatRoom/chatRoomApi';
import { useEffect, useMemo } from 'react';
import { subscribeToChatRoom, unsubscribeFromChatRoom } from '@/services/chatRoom/message/messageApi';
import { useUser } from '@/hooks/useUser';
import useChatRoomAndMessageActions from '@/hooks/useChatRoomAndMessageActions';

export default function ChatRoomPage() {
  const params = useParams();
  const chatRoomId = params?.id as string;
  const { user } = useUser();
  const { handleSendMessage, handleRecallMessage, isRecallingMessage } = useChatRoomAndMessageActions();

  // Subscribe vào chat room khi component mount
  useEffect(() => {
    if (chatRoomId && !isNaN(Number(chatRoomId))) {
      subscribeToChatRoom(Number(chatRoomId));

      return () => {
        unsubscribeFromChatRoom(Number(chatRoomId));
      };
    }
  }, [chatRoomId]);

  const { data: messagesData, isLoading } = useFetchMessagesInChatRoomQuery(
    {
      chatRoomId: Number(chatRoomId),
      size: 50,
      page: 1,
    },
    { skip: !chatRoomId || isNaN(Number(chatRoomId)) },
  );

  const { data: chatRoomsData } = useFetchChatRoomsByIdQuery(Number(chatRoomId), {
    skip: !chatRoomId || isNaN(Number(chatRoomId)),
  });

  const currentChatRoom = useMemo(() => {
    return chatRoomsData?.data || null;
  }, [chatRoomsData]);

  const messages = useMemo(() => {
    // Manually sort messages by createdAt ascending, fallback to empty array if no messages
    return [...(messagesData?.data || [])].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );
  }, [messagesData]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Đang tải...</p>
      </div>
    );
  }

  if (!currentChatRoom) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <p className="text-lg text-muted-foreground">Không tìm thấy đoạn chat</p>
      </div>
    );
  }

  return (
    <ChatWindow
      chatRoom={currentChatRoom}
      messages={messages}
      currentUserId={user?.accountId?.toString()}
      onSendMessage={async (text, files) => {
        await handleSendMessage(Number(chatRoomId), text, files);
      }}
      onRecallMessage={async (messageId) => {
        await handleRecallMessage(Number(chatRoomId), messageId);
      }}
      isRecallingMessage={isRecallingMessage}
    />
  );
}
