'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChatRoom } from '@/types/model';
import { ChatRoomType } from '@/types/enum';
import { Info, Phone, Pin, Search, Users, Video } from 'lucide-react';

interface ChatHeaderProps {
  chatRoom: ChatRoom;
  onToggleDetails: () => void;
  isDetailsOpen: boolean;
  onShowPinnedMessages: () => void;
  onOpenSearch: () => void;
  pinnedMessagesCount: number;
  readOnly?: boolean;
  disableCallActions?: boolean;
  onStartVoiceCall?: () => void;
  onStartVideoCall?: () => void;
}

export function ChatHeader({
  chatRoom,
  onToggleDetails,
  isDetailsOpen,
  onShowPinnedMessages,
  onOpenSearch,
  pinnedMessagesCount = 0,
  readOnly = false,
  disableCallActions = false,
  onStartVoiceCall,
  onStartVideoCall,
}: Readonly<ChatHeaderProps>) {
  const isGroup = chatRoom.type === ChatRoomType.GROUP;
  const isCallDisabled = readOnly || disableCallActions;

  return (
    <div className="h-16 border-b border-border bg-card flex items-center justify-between px-4">
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={chatRoom.avatar || '/placeholder.svg'} alt={chatRoom.name} />
          <AvatarFallback>{chatRoom.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-semibold text-sm">{chatRoom.name}</h2>
            {isGroup && (
              <Badge variant="secondary" className="text-xs flex items-center gap-1">
                <Users className="h-3 w-3" />
                {chatRoom.memberCount}
              </Badge>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-full"
          disabled={isCallDisabled || !onStartVoiceCall}
          onClick={onStartVoiceCall}
          title="Bắt đầu cuộc gọi thoại"
        >
          <Phone className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-full"
          disabled={isCallDisabled || !onStartVideoCall}
          onClick={onStartVideoCall}
          title="Bắt đầu cuộc gọi video"
        >
          <Video className="h-5 w-5" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-full relative"
          onClick={onShowPinnedMessages}
          title={`${pinnedMessagesCount} tin nhắn được ghim`}
        >
          <Pin className="h-5 w-5" />
          {pinnedMessagesCount > 0 && (
            <Badge
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
              variant="destructive"
            >
              {pinnedMessagesCount}
            </Badge>
          )}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-full"
          onClick={onOpenSearch}
          title="Tìm kiếm tin nhắn"
        >
          <Search className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-full"
          onClick={onToggleDetails}
          data-active={isDetailsOpen}
        >
          <Info className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
