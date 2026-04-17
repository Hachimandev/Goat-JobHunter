'use client';

import { ChatWindow } from '@/app/(chat)/messages/components/ChatWindow';
import { useSearchParams } from 'next/navigation';
import { useUser } from '@/hooks/useUser';
import { useMemo } from 'react';
import { ChatRoom } from '@/types/model';
import { ChatRoomType, Visibility } from '@/types/enum';
import { useFetchUserByIdQuery } from '@/services/user/userApi';
import useChatRoomAndMessageActions from '@/hooks/useChatRoomAndMessageActions';
import { useFriendshipStatus } from '@/hooks/useFriendshipStatus';

export default function NewChatRoomPage() {
  const searchParams = useSearchParams();
  const recipientId = searchParams.get('recipient');
  const recipientAccountId = Number(recipientId);
  const { user } = useUser();
  const { handleSendMessageToNewChat } = useChatRoomAndMessageActions();

  const { data } = useFetchUserByIdQuery(recipientId!, {
    skip: !recipientId || isNaN(Number(recipientId)),
  });

  const recipientVisibility = data?.data?.visibility;
  const isRecipientPrivate = recipientVisibility === Visibility.PRIVATE;
  const { isBlockedAnyDirection, isBlockedByMe } = useFriendshipStatus(recipientAccountId);
  const blockedReason = isBlockedByMe
    ? 'Bạn đã chặn người này. Hãy bỏ chặn trước khi nhắn tin.'
    : 'Bạn không thể nhắn tin với người này.';

  const chatRoom: ChatRoom = useMemo(() => {
    return {
      roomId: 1000, // Temporary ID for client-side only
      avatar: data?.data?.avatar || '',
      lastMessagePreview: 'Chưa có tin nhắn',
      name: data?.data?.fullName || data?.data?.username || 'C',
      type: ChatRoomType.DIRECT,
      lastMessageTime: new Date().toISOString(),
      memberCount: 2,
      currentUserSentLastMessage: true,
      blocked: false,
      blockedByMe: false,
      counterpartAccountId: recipientAccountId,
    };
  }, [data?.data?.avatar, data?.data?.fullName, data?.data?.username, recipientAccountId]);

  if (isRecipientPrivate) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background px-4">
        <div className="max-w-md text-center space-y-2">
          <p className="text-lg font-semibold">Không thể bắt đầu cuộc trò chuyện mới</p>
          <p className="text-muted-foreground">
            Tài khoản này đang ở chế độ riêng tư nên bạn không thể chủ động gửi tin nhắn.
          </p>
        </div>
      </div>
    );
  }

  if (isBlockedAnyDirection) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background px-4">
        <div className="max-w-md text-center space-y-2">
          <p className="text-lg font-semibold">Không thể bắt đầu cuộc trò chuyện mới</p>
          <p className="text-muted-foreground">{blockedReason}</p>
        </div>
      </div>
    );
  }

  if (!user?.accountId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <p className="text-lg text-muted-foreground">Có lỗi xảy ra. Vui lòng thử lại sau.</p>
      </div>
    );
  }

  return (
    <ChatWindow
      chatRoom={chatRoom}
      messages={[]}
      currentUserId={user?.accountId?.toString()}
      isChatBlocked={isBlockedAnyDirection}
      chatBlockedReason={blockedReason}
      onSendMessage={(text, files) => {
        if (isBlockedAnyDirection) {
          return;
        }

        return handleSendMessageToNewChat(recipientId, text, files, recipientVisibility);
      }}
    />
  );
}
