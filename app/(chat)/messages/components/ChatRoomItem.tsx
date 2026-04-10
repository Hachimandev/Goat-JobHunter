import { ChatRoom } from '@/types/model';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users } from 'lucide-react';
import { ChatRoomType } from '@/types/enum';
import { formatLastMessageTime } from '@/utils/formatDate';
import { cn } from '@/lib/utils';
import { useMemo } from 'react';
import { truncate } from 'lodash';

interface ConversationItemProps {
  chatRoom: ChatRoom;
  active: boolean;
  onClick: () => void;
}

export function ChatRoomItem({ chatRoom, active, onClick }: Readonly<ConversationItemProps>) {
  const isGroup = chatRoom.type === ChatRoomType.GROUP;
  const chatRoomTitle = chatRoom.name;
  const avatarFallback = chatRoomTitle.charAt(0).toUpperCase();
  const formattedTime = formatLastMessageTime(chatRoom.lastMessageTime);

  const chatRoomPreview = useMemo(() => {
    // Nếu không có lastMessagePreview
    if (!chatRoom.lastMessagePreview) {
      return 'Chưa có tin nhắn nào';
    }

    // Nhóm chat thì hiện tên nhóm
    if (isGroup) {
      return `${chatRoom.name}: ${chatRoom.lastMessagePreview}`;
    }

    // Không phải nhóm chat, hiện tên người gửi cuối cùng, nếu là người dùng hiện tại thì hiển thị "Bạn"
    if (chatRoom.currentUserSentLastMessage) {
      return `Bạn: ${chatRoom.lastMessagePreview}`;
    }

    // Ngược lại hiện tên người gửi cuối cùng
    return `${chatRoomTitle}: ${chatRoom.lastMessagePreview}`;
  }, [chatRoom.currentUserSentLastMessage, chatRoom.lastMessagePreview, chatRoom.name, chatRoomTitle, isGroup]);

  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors w-full',
        active && 'bg-accent/50',
        !active && 'hover:bg-accent/50',
      )}
    >
      <div className="relative">
        <Avatar className={cn('h-12 w-12 border', active && 'border-gray-300')}>
          <AvatarImage src={chatRoom.avatar || undefined} alt={chatRoomTitle} />
          <AvatarFallback>{avatarFallback}</AvatarFallback>
        </Avatar>
        {isGroup && (
          <div className="absolute -bottom-1 -right-1 bg-primary rounded-full p-1">
            <Users className="h-3 w-3 text-primary-foreground" />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <span className="font-medium truncate">{chatRoomTitle}</span>
          {formattedTime && <span className="text-xs text-muted-foreground shrink-0">{formattedTime}</span>}
        </div>
        <p className="text-sm text-muted-foreground truncate text-start">{truncate(chatRoomPreview, { length: 30 })}</p>
      </div>
    </button>
  );
}
