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
import {
  FileIcon,
  UserPlus,
  UserMinus,
  Crown,
  ImageIcon,
  Users,
  MoreVertical,
  Forward,
  Reply,
  Undo2,
  Loader2,
  Trash2,
  Pin,
  PinIcon,
  PinOff,
} from 'lucide-react';
import Image from 'next/image';
import { MessageEvent, MessageTypeEnum } from '@/types/enum';
import { JSX, use, useMemo, useState } from 'react';
import MarkdownDisplay from '@/components/common/MarkdownDisplay';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { getMessageSenderDisplayName, getReplyContextPreviewText } from '@/utils/messageUtils';
import { extractMessageContent, extractMessageEvent, extractMessageId } from '@/utils/slug';

interface MessageBubbleProps {
  message: MessageType;
  isOwn: boolean;
  showAvatar?: boolean;
  senderName?: string;
  senderAvatar?: string;
  onReply?: (message: MessageType) => void;
  onNavigateToMessage?: (messageId: string) => void;
  onForward?: (message: MessageType) => void;
  onRecall?: (messageId: string) => void | Promise<void>;
  onDelete?: (messageId: string) => void | Promise<void>;
  onPin?: (messageId: string) => void | Promise<void>;
  onUnpin?: (messageId: string) => void | Promise<void>;
  isPinned?: boolean;
  isPinning?: boolean;
  isForwarding?: boolean;
  isRecalling?: boolean;
  isDeleting?: boolean;
}

export function MessageBubble({
  message,
  isOwn,
  showAvatar = false,
  senderName,
  senderAvatar,
  onReply,
  onNavigateToMessage,
  onForward,
  onRecall,
  onDelete,
  onPin,
  onUnpin,
  isPinned = false,
  isPinning = false,
  isForwarding = false,
  isRecalling = false,
  isDeleting = false,
}: Readonly<MessageBubbleProps>) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const timeAgo = formatDistanceToNow(new Date(message.createdAt), {
    addSuffix: true,
    locale: vi,
  });
  const type = useMemo(() => message.messageType, [message.messageType]);
  const isForwarded = useMemo(() => Boolean(message.isForwarded), [message.isForwarded]);
  const isRecalled = useMemo(() => message.isHidden, [message.isHidden]);

  const isMedia = useMemo(
    () =>
      !isRecalled &&
      (type === MessageTypeEnum.IMAGE || type === MessageTypeEnum.VIDEO || type === MessageTypeEnum.AUDIO),
    [isRecalled, type],
  );

  const isSystem = useMemo(() => type === MessageTypeEnum.SYSTEM, [type]);
  const isReplyableType = useMemo(
    () =>
      type === MessageTypeEnum.TEXT ||
      type === MessageTypeEnum.IMAGE ||
      type === MessageTypeEnum.VIDEO ||
      type === MessageTypeEnum.AUDIO ||
      type === MessageTypeEnum.FILE,
    [type],
  );
  const isPinMessage = useMemo(
    () =>
      extractMessageEvent(message.content) === MessageEvent.MESSAGE_PINNED ||
      extractMessageEvent(message.content) === MessageEvent.MESSAGE_UNPINNED,
    [message.content],
  );
  const disableReplyAction = isDeleting || isRecalling || isForwarding || isPinning || !onReply;
  const disableForwardAction = isForwarding || isRecalled || !onForward;
  const disableRecallAction = isRecalled || isRecalling || !onRecall;
  const disableDeleteAction = isDeleting || isRecalling || !onDelete;
  const disablePinAction = isPinning || isRecalling || !onPin || !onUnpin;
  const canShowReplyAction = isReplyableType && !isSystem && !isRecalled && !!onReply;
  const canShowForwardAction = !isSystem && !isRecalled && !!onForward;
  const canShowRecallAction = isOwn && !isRecalled && !!onRecall;
  const canShowDeleteAction = isOwn && !!onDelete;
  const canShowPinAction = !isSystem && !isRecalled && !!onPin && !!onUnpin;
  const canShowOwnerActions = isOwn && !isSystem && (canShowRecallAction || canShowDeleteAction);
  const canShowActionMenu = canShowReplyAction || canShowForwardAction || canShowOwnerActions;

  if (!message.content && !isRecalled) return null;

  const getSystemMessageContent = () => {
    const finalContent = extractMessageContent(message.content) || 'Có một sự kiện hệ thống xảy ra';
    try {
      const messageEvent = extractMessageEvent(message.content) as MessageEvent;

      const eventIcons: Record<MessageEvent, JSX.Element> = {
        [MessageEvent.MEMBER_ADDED]: <UserPlus className="h-3.5 w-3.5" />,
        [MessageEvent.MEMBER_REMOVED]: <UserMinus className="h-3.5 w-3.5" />,
        [MessageEvent.MEMBER_LEFT]: <UserMinus className="h-3.5 w-3.5" />,
        [MessageEvent.ROLE_CHANGED]: <Crown className="h-3.5 w-3.5" />,
        [MessageEvent.GROUP_CREATED]: <Users className="h-3.5 w-3.5" />,
        [MessageEvent.GROUP_NAME_CHANGED]: <Users className="h-3.5 w-3.5" />,
        [MessageEvent.GROUP_AVATAR_CHANGED]: <ImageIcon className="h-3.5 w-3.5" />,
        [MessageEvent.MESSAGE_PINNED]: <PinIcon className="h-3.5 w-3.5" />,
        [MessageEvent.MESSAGE_UNPINNED]: <PinOff className="h-3.5 w-3.5" />,
      };

      return {
        icon: eventIcons[messageEvent],
        text: finalContent,
      };
    } catch {
      return {
        icon: <Users className="h-3.5 w-3.5" />,
        text: finalContent,
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
          {isPinMessage && (
            <span
              className="text-xs font-medium text-primary cursor-pointer"
              onClick={() => {
                const messageId = extractMessageId(message.content);
                if (messageId && onNavigateToMessage) {
                  onNavigateToMessage(messageId);
                }
              }}
            >
              Xem
            </span>
          )}
          <span className="text-xs opacity-70">• {timeAgo}</span>
        </div>
      </div>
    );
  }

  const handleRecall = async () => {
    if (!onRecall || disableRecallAction) return;
    await onRecall(message.messageId);
  };

  const handleForward = () => {
    if (!onForward || disableForwardAction) return;
    onForward(message);
  };

  const handleReply = () => {
    if (!onReply || disableReplyAction) return;
    onReply(message);
  };

  const handlePin = async () => {
    if (disablePinAction) return;
    if (isPinned && onUnpin) {
      await onUnpin(message.messageId);
    } else if (!isPinned && onPin) {
      await onPin(message.messageId);
    }
  };

  const handleDelete = async () => {
    if (!onDelete || disableDeleteAction) return;
    await onDelete(message.messageId);
    setIsDeleteDialogOpen(false);
  };

  const renderReplyContext = () => {
    if (!message.replyToMessageId || !message.replyContext) {
      return null;
    }

    const replyContext = message.replyContext;
    const originalSenderName = getMessageSenderDisplayName(replyContext.originalSender);
    const previewText = getReplyContextPreviewText(replyContext);

    const canNavigate = Boolean(replyContext.originalMessageId && onNavigateToMessage);

    return (
      <button
        type="button"
        className={cn(
          'w-full text-left border-l-2 rounded-md px-2 py-1 mb-2 transition-colors',
          isOwn
            ? 'bg-primary-foreground/15 border-primary-foreground/40 text-primary-foreground'
            : 'bg-muted/70 border-border text-foreground',
          canNavigate ? 'cursor-pointer hover:opacity-90' : 'cursor-default',
        )}
        onClick={() => {
          if (canNavigate) {
            onNavigateToMessage?.(replyContext.originalMessageId);
          }
        }}
        disabled={!canNavigate}
      >
        <p className={cn('text-xs font-semibold', isOwn ? 'text-primary-foreground/90' : 'text-muted-foreground')}>
          {originalSenderName}
        </p>
        <p className={cn('text-xs line-clamp-2', isOwn ? 'text-primary-foreground/85' : 'text-muted-foreground')}>
          {previewText}
        </p>
      </button>
    );
  };

  return (
    <>
      <div className={cn('flex w-full mb-2', isOwn ? 'justify-end' : 'justify-start')}>
        {!isOwn && showAvatar && (
          <Avatar className="h-10 w-10 mr-2 shrink-0 border">
            <AvatarImage src={senderAvatar || '/placeholder.svg'} alt={senderName} />
            <AvatarFallback>{senderName?.charAt(0) || 'U'}</AvatarFallback>
          </Avatar>
        )}
        <div className={cn('flex items-start gap-1', isOwn ? 'flex-row-reverse' : 'flex-row')}>
          <div className={cn('flex flex-col w-full', isOwn ? 'items-end' : 'items-start')}>
            <p className="flex">
              {!isOwn && showAvatar && senderName && (
                <>
                  {isForwarded && <Forward className="h-3 w-3" />}
                  <span className="text-xs font-medium text-muted-foreground mb-1 px-1">{senderName}</span>
                </>
              )}
              {isForwarded && (
                <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground mb-1 px-1">
                  {isOwn && <Forward className="h-3 w-3" />}
                  {isOwn ? 'Bạn đã chuyển tiếp tin nhắn' : 'đã chuyển tiếp tin nhắn'}
                </span>
              )}
            </p>
            {isMedia ? (
              <>
                {renderReplyContext()}
                {renderContent()}
              </>
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
                {renderReplyContext()}
                {renderContent()}
              </div>
            )}
            <span className="text-xs text-muted-foreground mt-1 px-1">{timeAgo}</span>
          </div>

          {canShowActionMenu && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-full mt-0.5"
                  disabled={isDeleting || isRecalling || isForwarding || isPinning}
                >
                  {isRecalling || isDeleting || isForwarding || isPinning ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <MoreVertical className="h-4 w-4" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-xl cursor-pointer">
                {canShowReplyAction && (
                  <DropdownMenuItem
                    onClick={handleReply}
                    disabled={disableReplyAction}
                    className="rounded-xl cursor-pointer"
                  >
                    <Reply className="h-4 w-4" />
                    Trả lời
                  </DropdownMenuItem>
                )}

                {canShowForwardAction && (
                  <DropdownMenuItem
                    onClick={handleForward}
                    disabled={disableForwardAction}
                    className="rounded-xl cursor-pointer"
                  >
                    <Forward className="h-4 w-4" />
                    Chuyển tiếp
                  </DropdownMenuItem>
                )}

                {canShowPinAction && (
                  <DropdownMenuItem
                    onClick={handlePin}
                    disabled={disablePinAction}
                    className="rounded-xl cursor-pointer"
                  >
                    <Pin className="h-4 w-4" />
                    {isPinned ? 'Bỏ ghim' : 'Ghim tin nhắn'}
                  </DropdownMenuItem>
                )}

                {canShowRecallAction && (
                  <DropdownMenuItem
                    onClick={handleRecall}
                    disabled={disableRecallAction}
                    className="rounded-xl text-destructive focus:text-destructive cursor-pointer"
                  >
                    <Undo2 className="h-4 w-4 text-destructive" />
                    Thu hồi tin nhắn
                  </DropdownMenuItem>
                )}

                {canShowDeleteAction && (
                  <DropdownMenuItem
                    onClick={() => setIsDeleteDialogOpen(true)}
                    disabled={disableDeleteAction}
                    className="rounded-xl text-destructive focus:text-destructive cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                    Xóa tin nhắn
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Xóa tin nhắn"
        description="Tin nhắn sẽ bị xóa vĩnh viễn và không thể khôi phục."
        confirmText="Xóa"
        cancelText="Hủy"
        confirmBtnClass="bg-destructive text-destructive-foreground hover:bg-destructive/90"
        disableCancel={isDeleting}
        disableConfirm={disableDeleteAction}
        isLoading={isDeleting}
        onConfirm={handleDelete}
      />
    </>
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
