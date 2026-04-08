import { MessageType } from '@/types/model';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { FileIcon, UserPlus, UserMinus, Crown, ImageIcon, Users, MoreVertical, Undo2, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { MessageEvent, MessageTypeEnum } from '@/types/enum';
import { JSX, useMemo } from 'react';
import MarkdownDisplay from '@/components/common/MarkdownDisplay';

interface MessageBubbleProps {
  message: MessageType;
  isOwn: boolean;
  showAvatar?: boolean;
  senderName?: string;
  senderAvatar?: string;
  onRecall?: (messageId: string) => void | Promise<void>;
  isRecalling?: boolean;
}

export function MessageBubble({
  message,
  isOwn,
  showAvatar = false,
  senderName,
  senderAvatar,
  onRecall,
  isRecalling = false,
}: Readonly<MessageBubbleProps>) {
  const timeAgo = formatDistanceToNow(new Date(message.createdAt), {
    addSuffix: true,
    locale: vi,
  });
  const type = useMemo(() => message.messageType, [message.messageType]);
  const isRecalled = useMemo(() => message.isHidden, [message.isHidden]);

  const isMedia = useMemo(
    () =>
      !isRecalled &&
      (type === MessageTypeEnum.IMAGE || type === MessageTypeEnum.VIDEO || type === MessageTypeEnum.AUDIO),
    [isRecalled, type],
  );

  const isSystem = useMemo(() => type === MessageTypeEnum.SYSTEM, [type]);
  const disableRecallAction = isRecalled || isRecalling || !onRecall;

  if (!message.content && !isRecalled) return null;

  const getSystemMessageContent = () => {
    try {
      const systemData = JSON.parse(message.content);
      const event = systemData.event as MessageEvent;
      const actor = systemData.actor || 'Ai đó';
      const target = systemData.target;

      const eventIcons: Record<MessageEvent, JSX.Element> = {
        [MessageEvent.MEMBER_ADDED]: <UserPlus className="h-3.5 w-3.5" />,
        [MessageEvent.MEMBER_REMOVED]: <UserMinus className="h-3.5 w-3.5" />,
        [MessageEvent.MEMBER_LEFT]: <UserMinus className="h-3.5 w-3.5" />,
        [MessageEvent.ROLE_CHANGED]: <Crown className="h-3.5 w-3.5" />,
        [MessageEvent.GROUP_CREATED]: <Users className="h-3.5 w-3.5" />,
        [MessageEvent.GROUP_NAME_CHANGED]: <Users className="h-3.5 w-3.5" />,
        [MessageEvent.GROUP_AVATAR_CHANGED]: <ImageIcon className="h-3.5 w-3.5" />,
      };

      const eventMessages: Record<MessageEvent, string> = {
        [MessageEvent.MEMBER_ADDED]: `${actor} đã thêm ${target} vào nhóm`,
        [MessageEvent.MEMBER_REMOVED]: `${actor} đã xóa ${target} khỏi nhóm`,
        [MessageEvent.MEMBER_LEFT]: `${actor} đã rời khỏi nhóm`,
        [MessageEvent.ROLE_CHANGED]: `${actor} đã thay đổi vai trò của ${target} thành ${systemData.newRole || 'thành viên'}`,
        [MessageEvent.GROUP_CREATED]: `${actor} đã tạo nhóm`,
        [MessageEvent.GROUP_NAME_CHANGED]: `${actor} đã đổi tên nhóm thành "${target}"`,
        [MessageEvent.GROUP_AVATAR_CHANGED]: `${actor} đã thay đổi ảnh nhóm`,
      };

      return {
        icon: eventIcons[event],
        text: eventMessages[event] || message.content,
      };
    } catch {
      return {
        icon: <Users className="h-3.5 w-3.5" />,
        text: message.content,
      };
    }
  };

  const renderContent = () => {
    if (isRecalled) {
      return <span className="text-sm leading-relaxed italic text-muted-foreground">Tin nhắn đã được thu hồi</span>;
    }

    if (type === MessageTypeEnum.IMAGE) {
      return (
        <Image
          src={message.content}
          alt="Hình ảnh"
          className="max-w-xs max-h-96 rounded-xl object-cover border"
          width={300}
          height={300}
        />
      );
    }

    if (type === MessageTypeEnum.VIDEO) {
      return <video src={message.content} controls className="max-w-xs max-h-96 rounded-xl" />;
    }

    if (type === MessageTypeEnum.AUDIO) {
      return <audio src={message.content} controls className="max-w-xs" />;
    }

    if (type === MessageTypeEnum.FILE) {
      const fileName = message.content.split('/').pop() || 'file';
      return (
        <a href={message.content} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:underline">
          <FileIcon className="h-5 w-5" />
          <span className="text-sm truncate max-w-[200px]">{fileName}</span>
        </a>
      );
    }

    return (
      <MarkdownDisplay
        className="text-sm leading-relaxed whitespace-pre-wrap wrap-break-word"
        content={message.content}
      />
    );
  };

  if (isSystem) {
    const systemContent = getSystemMessageContent();
    return (
      <div className="flex justify-center w-full my-3">
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 text-muted-foreground">
          {systemContent.icon}
          <span className="text-xs font-medium">{systemContent.text}</span>
          <span className="text-xs opacity-70">• {timeAgo}</span>
        </div>
      </div>
    );
  }

  const handleRecall = async () => {
    if (!onRecall || disableRecallAction) return;
    await onRecall(message.messageId);
  };

  return (
    <div className={cn('flex w-full mb-2', isOwn ? 'justify-end' : 'justify-start')}>
      {!isOwn && showAvatar && (
        <Avatar className="h-10 w-10 mr-2 shrink-0 border">
          <AvatarImage src={senderAvatar || '/placeholder.svg'} alt={senderName} />
          <AvatarFallback>{senderName?.charAt(0) || 'U'}</AvatarFallback>
        </Avatar>
      )}
      <div className={cn('flex items-start gap-1', isOwn ? 'flex-row-reverse' : 'flex-row')}>
        <div className={cn('flex flex-col w-full', isOwn ? 'items-end' : 'items-start')}>
          {!isOwn && showAvatar && senderName && (
            <span className="text-xs font-medium text-muted-foreground mb-1 px-1">{senderName}</span>
          )}
          {isMedia ? (
            renderContent()
          ) : (
            <div
              className={cn(
                'rounded-2xl px-4 py-2',
                isRecalled
                  ? 'bg-muted text-muted-foreground border border-border/50'
                  : isOwn
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground',
              )}
            >
              {renderContent()}
            </div>
          )}
          <span className="text-xs text-muted-foreground mt-1 px-1">{timeAgo}</span>
        </div>

        {isOwn && !isSystem && !isRecalled && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-full mt-0.5"
                disabled={disableRecallAction}
              >
                {isRecalling ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreVertical className="h-4 w-4" />}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl">
              <DropdownMenuItem
                onClick={handleRecall}
                disabled={disableRecallAction}
                className="rounded-xl text-destructive focus:text-destructive"
              >
                <Undo2 className="h-4 w-4 text-destructive" />
                Thu hồi tin nhắn
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
}

export function MessageBubbleLoading() {
  return (
    <div className="flex justify-end">
      <div className={cn('max-w-[70%] rounded-2xl px-4 py-2', 'bg-primary text-primary-foreground rounded-2xl')}>
        <div className="flex items-center gap-1">
          <div
            className="w-2 h-2 bg-primary-foreground/60 rounded-full animate-bounce"
            style={{ animationDelay: '0ms' }}
          />
          <div
            className="w-2 h-2 bg-primary-foreground/60 rounded-full animate-bounce"
            style={{ animationDelay: '150ms' }}
          />
          <div
            className="w-2 h-2 bg-primary-foreground/60 rounded-full animate-bounce"
            style={{ animationDelay: '300ms' }}
          />
        </div>
      </div>
    </div>
  );
}
