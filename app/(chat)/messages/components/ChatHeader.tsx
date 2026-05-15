'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CallSession, ChatRoom } from '@/types/model';
import { CallStatusEnum, ChatRoomType } from '@/types/enum';
import { Info, Phone, PhoneCall, Pin, Search, Users, Video, Bell } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { usePresenceStatus } from '@/hooks/usePresenceStatus';
import { formatActivityTime } from '@/utils/formatDate';

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
  showOngoingCallInfo?: boolean;
  callSession?: CallSession | null;
  ongoingParticipantsCount?: number;
  canJoinOngoingCall?: boolean;
  isJoiningOngoingCall?: boolean;
  onJoinOngoingCall?: () => void;
  onOpenReminder?: () => void;
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
  showOngoingCallInfo = false,
  callSession = null,
  ongoingParticipantsCount = 0,
  canJoinOngoingCall = false,
  isJoiningOngoingCall = false,
  onJoinOngoingCall,
}: Readonly<ChatHeaderProps>) {
  const isGroup = chatRoom.type === ChatRoomType.GROUP;
  const isCallDisabled = readOnly || disableCallActions;
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [viewMode, setViewMode] = useState<'full' | 'compact' | 'icon'>('full');

  const presence = usePresenceStatus(!isGroup ? chatRoom.counterpartAccountId : null);
  const activityTime = formatActivityTime(presence?.lastHeartbeatAt);
  const isOnline = presence?.online;
  const hasActivity = activityTime?.length > 0;

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    const observer = new ResizeObserver((entries) => {
      const width = entries[0].contentRect.width;
      if (width < 600) {
        setViewMode('icon');
      } else if (width < 900) {
        setViewMode('compact');
      } else {
        setViewMode('full');
      }
    });

    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
    };
  }, [containerRef]);

  const showActiveGroupCallAction = showOngoingCallInfo && callSession?.status === CallStatusEnum.ACTIVE;

  return (
    <div className="h-16 border-b border-border bg-card flex items-center justify-between px-4" ref={containerRef}>
      <div className="flex items-center gap-3">
        <div className="relative">
          <Avatar className="h-10 w-10">
            <AvatarImage src={chatRoom.avatar || '/placeholder.svg'} alt={chatRoom.name} />
            <AvatarFallback>{chatRoom.name.charAt(0)}</AvatarFallback>
          </Avatar>
          {!isGroup && (
            <div
              className={cn(
                'absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white',
                isOnline ? 'bg-emerald-500' : 'bg-slate-400',
              )}
              title={isOnline ? 'Đang hoạt động' : 'Chưa hoạt động'}
            />
          )}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <div>
              <h2 className="font-semibold text-sm">{chatRoom.name}</h2>
              {isOnline && (
                <div className="rounded-full border-white text-xs text-primary font-bold truncate">
                  Đang hoạt động
                </div>
              )}
              {!isGroup && !isOnline && hasActivity && (
                <div className="rounded-full border-white text-xs text-muted-foreground font-bold truncate">
                  {activityTime}
                </div>
              )}
            </div>
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
        {showActiveGroupCallAction ? (
          <Button
            variant="default"
            size={viewMode !== 'icon' ? 'default' : 'icon'}
            className="rounded-full"
            disabled={isJoiningOngoingCall || !onJoinOngoingCall || !canJoinOngoingCall}
            onClick={() => {
              if (canJoinOngoingCall && onJoinOngoingCall) {
                void onJoinOngoingCall();
              }
            }}
            title="Tham gia cuộc gọi"
          >
            <PhoneCall className="h-4 w-4 shrink-0" />
            <p className={cn('text-sm font-medium', viewMode === 'icon' && 'hidden')}>
              Cuộc gọi nhóm đang diễn ra{' '}
              <span className={cn(viewMode !== 'full' && 'hidden')}>· {ongoingParticipantsCount} người tham gia</span>
            </p>
          </Button>
        ) : (
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
        )}
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
          onClick={() => onOpenReminder && onOpenReminder()}
          title="Tạo nhắc hẹn"
        >
          <Bell className="h-5 w-5" />
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

{
  /* {showOngoingCallInfo && (
            <div className="mt-2 rounded-xl border border-emerald-300/50 bg-emerald-500/10 px-3 py-2 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <PhoneCall className="h-4 w-4 text-emerald-400 shrink-0" />
                <p className="text-xs text-emerald-100 truncate">
                  Cuộc gọi nhóm đang diễn ra · {ongoingParticipantsCount} người tham gia
                </p>
              </div>

              {canJoinOngoingCall && (
                <Button
                  size="sm"
                  className="h-7 px-3 bg-emerald-400 hover:bg-emerald-300 text-black text-xs font-semibold"
                  disabled={isJoiningOngoingCall || !onJoinOngoingCall}
                  onClick={onJoinOngoingCall}
                >
                  {isJoiningOngoingCall ? 'Dang tham gia...' : 'Tham gia'}
                </Button>
              )}
            </div>
          )} */
}
