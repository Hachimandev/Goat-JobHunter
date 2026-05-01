import { MessageResponse } from '@/types/model';
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
  EyeOff,
  Trash2,
  Pin,
  PinIcon,
  PinOff,
  BarChart,
  Shield,
  Languages,
  Volume2,
  X,
} from 'lucide-react';
import Image from 'next/image';
import { MessageEvent, MessageTypeEnum, PollEvent } from '@/types/enum';
import { JSX, useMemo, useState } from 'react';
import { useFetchPollByIdInChatRoomQuery } from '@/services/poll/pollApi';
import PollCard from './PollCard';
import MarkdownDisplay from '@/components/common/MarkdownDisplay';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { getMessageSenderDisplayName, getReplyContextPreviewText } from '@/utils/messageUtils';
import { extractMessageContent, extractMessageEvent, extractMessageId } from '@/utils/slug';
import FriendActionButtons from '@/components/common/FriendActionButtons';
import { getMessageMediaPhotos } from '@/utils/formatChatMediaForPhotoAlbum';
import { MessageMediaGallery } from './MessageMediaGallery';
import { UserHoverCard } from '@/app/(social-hub)/hub/fyp/component/UserHoverCard';
import CallCard from './CallCard';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useTranslateMessageMutation } from '@/services/ai/conversationApi';
import { IBackendError } from '@/types/api';
import { Popover, PopoverAnchor, PopoverContent } from '@/components/ui/popover';
import { COUNTRY_OPTIONS } from '@/constants/constant';

interface MessageBubbleProps {
  message: MessageResponse;
  isOwn: boolean;
  showAvatar?: boolean;
  senderName?: string;
  senderAvatar?: string;
  onReply?: (message: MessageResponse) => void;
  onNavigateToMessage?: (messageId: string) => void;
  onNavigateToPoll?: (pollId: string) => void;
  onForward?: (message: MessageResponse) => void;
  onHide?: (messageId: string) => void | Promise<void>;
  onRecall?: (messageId: string) => void | Promise<void>;
  onDelete?: (messageId: string) => void | Promise<void>;
  onPin?: (messageId: string) => void | Promise<void>;
  onUnpin?: (messageId: string) => void | Promise<void>;
  isPinned?: boolean;
  isPinning?: boolean;
  isForwarding?: boolean;
  isHiding?: boolean;
  isRecalling?: boolean;
  isDeleting?: boolean;
  showPoll?: boolean;
}

export function MessageBubble({
  message,
  isOwn,
  showAvatar = false,
  showPoll = false,
  senderName,
  senderAvatar,
  onReply,
  onNavigateToMessage,
  onNavigateToPoll,
  onForward,
  onHide,
  onRecall,
  onDelete,
  onPin,
  onUnpin,
  isPinned = false,
  isPinning = false,
  isForwarding = false,
  isHiding = false,
  isRecalling = false,
  isDeleting = false,
}: Readonly<MessageBubbleProps>) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);
  const [isTranslateDialogOpen, setIsTranslateDialogOpen] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [selectedTargetLang, setSelectedTargetLang] = useState<string>('Vietnamese');
  const [translatedText, setTranslatedText] = useState<string | null>(null);
  const [translateMessage, { isLoading: isTranslating }] = useTranslateMessageMutation();

  const getSpeechLang = (language: string) => {
    const langCode = COUNTRY_OPTIONS.find((option) => option.language === language)?.langCode;

    if (langCode) {
      return langCode;
    }

    return 'en-US';
  };

  const timeAgo = formatDistanceToNow(new Date(message.createdAt), {
    addSuffix: true,
    locale: vi,
  });
  const type = useMemo(() => message.messageType, [message.messageType]);
  const isForwarded = useMemo(() => Boolean(message.isForwarded), [message.isForwarded]);
  const isRecalled = useMemo(() => message.isHidden, [message.isHidden]);
  const mediaPhotos = useMemo(() => getMessageMediaPhotos(message), [message]);

  const isMedia = useMemo(
    () =>
      !isRecalled &&
      (type === MessageTypeEnum.IMAGE ||
        type === MessageTypeEnum.VIDEO ||
        type === MessageTypeEnum.AUDIO ||
        type === MessageTypeEnum.MEDIA),
    [isRecalled, type],
  );
  const isContactCard = useMemo(() => !isRecalled && type === MessageTypeEnum.CONTACT_CARD, [isRecalled, type]);
  const isCall = useMemo(() => !isRecalled && type === MessageTypeEnum.CALL, [isRecalled, type]);
  const shouldRenderDetachedBubble = isMedia || isContactCard || isCall;

  const isSystem = useMemo(() => type === MessageTypeEnum.SYSTEM, [type]);
  const isText = useMemo(() => type === MessageTypeEnum.TEXT, [type]);
  const isReplyableType = useMemo(
    () =>
      type === MessageTypeEnum.TEXT ||
      type === MessageTypeEnum.IMAGE ||
      type === MessageTypeEnum.VIDEO ||
      type === MessageTypeEnum.AUDIO ||
      type === MessageTypeEnum.MEDIA ||
      type === MessageTypeEnum.FILE ||
      type === MessageTypeEnum.CONTACT_CARD,
    [type],
  );
  const isPinMessage = useMemo(
    () =>
      extractMessageEvent(message.content) === MessageEvent.MESSAGE_PINNED ||
      extractMessageEvent(message.content) === MessageEvent.MESSAGE_UNPINNED,
    [message.content],
  );
  const isPoll = useMemo(() => type === MessageTypeEnum.POLL, [type]);
  const disableReplyAction = isDeleting || isRecalling || isForwarding || isHiding || isPinning || !onReply;
  const disableForwardAction = isForwarding || isHiding || isRecalled || !onForward;
  const disableHideAction = isHiding || !onHide;
  const disableRecallAction = isRecalled || isRecalling || isHiding || !onRecall;
  const disableDeleteAction = isDeleting || isRecalling || isHiding || !onDelete;
  const disablePinAction = isPinning || isRecalling || isHiding || !onPin || !onUnpin;
  const canShowReplyAction = isReplyableType && !isSystem && !isRecalled && !!onReply;
  const canShowForwardAction = !isSystem && !isRecalled && !!onForward;
  const canShowHideAction = !isSystem && !!onHide;
  const canShowRecallAction = isOwn && !isRecalled && !!onRecall;
  const canShowDeleteAction = isOwn && !!onDelete;
  const canShowPinAction = !isSystem && !isRecalled && !!onPin && !!onUnpin;
  const canShowOwnerActions = isOwn && !isSystem && (canShowRecallAction || canShowDeleteAction);
  const canShowActionMenu = canShowReplyAction || canShowForwardAction || canShowHideAction || canShowOwnerActions;
  const canShowTranslateAction = isText && !isSystem && !isRecalled;

  const pollId = isPoll ? extractMessageId(message.content) : null;
  const { data: pollResponse } = useFetchPollByIdInChatRoomQuery(
    { chatRoomId: message.chatRoomId, pollId: pollId || '' },
    { skip: !pollId || !showPoll },
  );
  const fetchedPoll = pollResponse?.data;

  if (!message.content && !isRecalled && type !== MessageTypeEnum.CONTACT_CARD && mediaPhotos.length === 0) return null;

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
        [MessageEvent.GROUP_PRIVACY_CHANGED]: <Shield className="h-3.5 w-3.5" />,
        [MessageEvent.GROUP_DISSOLVED]: <Users className="h-3.5 w-3.5" />,
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

  const getPollMessageContent = () => {
    const finalContent = extractMessageContent(message.content) || 'Có một sự kiện hệ thống xảy ra';
    try {
      const messageEvent = extractMessageEvent(message.content) as PollEvent;

      const eventIcons: Record<PollEvent, JSX.Element> = {
        [PollEvent.POLL_CREATED]: <BarChart className="h-3.5 w-3.5" />,
        [PollEvent.POLL_VOTED]: <BarChart className="h-3.5 w-3.5" />,
        [PollEvent.POLL_UNVOTED]: <BarChart className="h-3.5 w-3.5" />,
        [PollEvent.POLL_OPTION_ADDED]: <BarChart className="h-3.5 w-3.5" />,
        [PollEvent.POLL_CLOSED]: <BarChart className="h-3.5 w-3.5" />,
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

    if (type === MessageTypeEnum.MEDIA) {
      if (mediaPhotos.length > 0) {
        return <MessageMediaGallery photos={mediaPhotos} />;
      }

      return <span className="text-sm leading-relaxed text-muted-foreground">Phương tiện không khả dụng</span>;
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

    if (type === MessageTypeEnum.CONTACT_CARD) {
      const { contactCard } = message;
      const accountId = contactCard?.accountId;
      const displayName =
        (contactCard?.fullName && contactCard.fullName.trim()) ||
        (contactCard?.username && contactCard.username.trim()) ||
        `Người dùng`;
      const secondaryText =
        (contactCard?.username && contactCard.username.trim() && `@${contactCard.username.trim()}`) ||
        (contactCard?.headline && contactCard.headline.trim());
      const showActionButton = !!accountId;
      const fallbackInitial = displayName.charAt(0).toUpperCase();
      return (
        <div
          className={cn(
            'max-w-xs w-6xl rounded-xl border bg-card/90 p-3 shadow-sm',
            isOwn ? 'border-primary/40' : 'border-border',
          )}
        >
          <div className="flex items-start gap-3">
            <Avatar className="h-12 w-12 border shrink-0">
              <AvatarImage src={contactCard?.avatar || '/placeholder.svg'} alt={displayName} />
              <AvatarFallback>{fallbackInitial}</AvatarFallback>
            </Avatar>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-foreground">{displayName}</p>
              <p className="truncate text-xs text-muted-foreground">{secondaryText}</p>
            </div>
          </div>

          {!contactCard && (
            <p className="mt-2 text-xs text-muted-foreground">
              Thông tin danh thiếp không đầy đủ. Vui lòng thử lại sau.
            </p>
          )}
          {showActionButton && <FriendActionButtons targetUserId={accountId} className="mt-3" />}
        </div>
      );
    }

    if (type === MessageTypeEnum.CALL) {
      return <CallCard callContext={message.callContext} isOwn={isOwn} />;
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
      <div className="flex justify-center w-full my-2">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/50 text-muted-foreground">
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

  if (isPoll) {
    const pollContent = getPollMessageContent();
    return (
      <div>
        <div className="flex justify-center my-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/50 text-muted-foreground">
            {pollContent.icon}
            <span className="text-xs font-medium">{pollContent.text}</span>
            <span
              className="text-xs font-medium text-primary cursor-pointer"
              onClick={() => {
                if (!pollId) return;
                if (onNavigateToPoll) {
                  onNavigateToPoll(pollId);
                  return;
                }
              }}
            >
              Xem
            </span>
            <span className="text-xs opacity-70">• {timeAgo}</span>
          </div>
        </div>

        {showPoll && fetchedPoll && fetchedPoll.pollId === pollId && <PollCard poll={fetchedPoll} />}
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

  const handleHide = async () => {
    if (!onHide || disableHideAction) return;
    await onHide(message.messageId);
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

  const handleTranslate = async () => {
    if (!canShowTranslateAction || !message.chatRoomId || !message.messageId) return;
    try {
      const response = await translateMessage({
        content: message.content,
        targetLang: selectedTargetLang,
      }).unwrap();
      const text = response?.data?.translatedText;
      if (!text) {
        toast.error('Không thể dịch tin nhắn.');
        return;
      }
      setTranslatedText(text);
    } catch (error) {
      const errorMessage = (error as IBackendError)?.data?.message || 'Đã có lỗi xảy ra';
      toast.error(errorMessage);
    }
  };

  const stopSpeaking = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }

    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  const handleSpeakTranslated = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      toast.error('Trình duyệt không hỗ trợ đọc văn bản.');
      return;
    }

    if (isSpeaking) {
      stopSpeaking();
      return;
    }

    if (!translatedText?.trim()) {
      toast.info('Hãy dịch tin nhắn trước khi phát âm.');
      return;
    }

    const utterance = new SpeechSynthesisUtterance(translatedText);
    utterance.lang = getSpeechLang(selectedTargetLang);
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => {
      setIsSpeaking(false);
      toast.error('Không thể phát âm văn bản.');
    };

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
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
          'w-full text-left border-l-2 rounded-md px-2 py-0.5 mb-1.5 transition-colors',
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
      <div className={cn('flex w-full mb-1.5', isOwn ? 'justify-end' : 'justify-start')}>
        {!isOwn && showAvatar && (
          <UserHoverCard
            userId={message.sender.accountId}
            fullName={senderName || `User ${message.sender.accountId}`}
            avatar={senderAvatar}
          >
            <Avatar className="h-10 w-10 mr-2 shrink-0 border">
              <AvatarImage src={senderAvatar || '/placeholder.svg'} alt={senderName} />
              <AvatarFallback>{senderName?.charAt(0) || 'U'}</AvatarFallback>
            </Avatar>
          </UserHoverCard>
        )}
        <div className={cn('flex items-start gap-1', isOwn ? 'flex-row-reverse' : 'flex-row')}>
          <div className={cn('flex flex-col w-full', isOwn ? 'items-end' : 'items-start')}>
            <p className="flex">
              {!isOwn && showAvatar && senderName && (
                <>
                  {isForwarded && <Forward className="h-3 w-3" />}
                  <span className="text-xs font-medium text-muted-foreground mb-0.5 px-1">{senderName}</span>
                </>
              )}
              {isForwarded && (
                <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground mb-0.5 px-1">
                  {isOwn && <Forward className="h-3 w-3" />}
                  {isOwn ? 'Bạn đã chuyển tiếp tin nhắn' : 'đã chuyển tiếp tin nhắn'}
                </span>
              )}
            </p>
            {shouldRenderDetachedBubble ? (
              <>
                {renderReplyContext()}
                {renderContent()}
              </>
            ) : (
              <div
                className={cn(
                  'rounded-2xl px-3.5 py-1.5',
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
            <span className="text-xs text-muted-foreground mt-0.5 px-1">{timeAgo}</span>
          </div>

          <Popover
            open={isTranslateDialogOpen}
            onOpenChange={(open) => {
              setIsTranslateDialogOpen(open);
              if (!open) {
                stopSpeaking();
              }
            }}
          >
            {canShowActionMenu && (
              <DropdownMenu open={isActionMenuOpen} onOpenChange={setIsActionMenuOpen} modal={false}>
                <PopoverAnchor asChild>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 rounded-full mt-0.5"
                      disabled={isDeleting || isRecalling || isForwarding || isHiding || isPinning}
                    >
                      {isRecalling || isDeleting || isForwarding || isHiding || isPinning ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <MoreVertical className="h-4 w-4" />
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                </PopoverAnchor>
                <DropdownMenuContent
                  align="end"
                  className="rounded-xl cursor-pointer"
                  onCloseAutoFocus={(e) => e.preventDefault()}
                >
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

                  {canShowTranslateAction && (
                    <DropdownMenuItem
                      onSelect={(e) => {
                        e.preventDefault();
                        setIsActionMenuOpen(false);
                        requestAnimationFrame(() => {
                          setIsTranslateDialogOpen(true);
                        });
                      }}
                      className="rounded-xl cursor-pointer"
                    >
                      <Languages className="h-4 w-4" />
                      Dịch tin nhắn
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

                  {canShowHideAction && (
                    <DropdownMenuItem
                      onClick={handleHide}
                      variant="destructive"
                      disabled={disableHideAction}
                      className="rounded-xl cursor-pointer"
                    >
                      <EyeOff className="h-4 w-4" />
                      Ẩn với tôi
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

            <PopoverContent
              align="center"
              side={isOwn ? 'left' : 'right'}
              className="w-[500px] p-0 rounded-xl shadow-xl overflow-hidden"
              onOpenAutoFocus={(e) => e.preventDefault()}
            >
              <div className="bg-background">
                <div className="flex items-center justify-between px-3 py-2 border-b">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Languages className="h-4 w-4 text-muted-foreground" />
                    Dịch tin nhắn
                  </div>

                  <div className="flex items-center gap-2 rounded-xl">
                    <Select value={selectedTargetLang} onValueChange={setSelectedTargetLang}>
                      <SelectTrigger className="h-3 text-xs font-semibold p-2 w-[200px] border-none shadow-none cursor-pointer rounded-full bg-primary/30">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        {COUNTRY_OPTIONS.map((option) => (
                          <SelectItem key={option.language} value={option.language} className="cursor-pointer">
                            {option.language}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7"
                      onClick={handleTranslate}
                      disabled={isTranslating}
                      title="Dịch"
                    >
                      {isTranslating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Languages className="h-4 w-4" />}
                    </Button>

                    <Button
                      title={isSpeaking ? 'Dừng đọc' : 'Đọc bản dịch'}
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7"
                      onClick={handleSpeakTranslated}
                    >
                      <Volume2 className={cn('h-4 w-4', isSpeaking && 'text-primary')} />
                    </Button>

                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7"
                      onClick={() => {
                        stopSpeaking();
                        setTranslatedText(null);
                        setIsTranslateDialogOpen(false);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="px-3 py-3 space-y-3">
                  <div className="text-sm leading-relaxed font-semibold">
                    <MarkdownDisplay content={message.content} />
                  </div>
                  {translatedText && (
                    <>
                      <div className="border-t pt-3 text-sm leading-relaxed text-primary font-semibold">
                        <MarkdownDisplay content={translatedText} />
                      </div>
                    </>
                  )}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Xóa tin nhắn"
        description="Tin nhắn sẽ bị xóa vĩnh viễn và không thể khôi phục."
        confirmText="Xóa"
        cancelText="Hủy"
        confirmBtnClass="bg-destructive hover:bg-destructive/90"
        disableCancel={isDeleting}
        disableConfirm={disableDeleteAction}
        isLoading={isDeleting}
        onConfirm={handleDelete}
      />
    </>
  );
}

interface MessageBubbleLoadingProps {
  contentPreview?: string;
  fileCount?: number;
  replySenderName?: string;
  replyPreviewText?: string;
}

export function MessageBubbleLoading({
  contentPreview,
  fileCount = 0,
  replySenderName,
  replyPreviewText,
}: Readonly<MessageBubbleLoadingProps>) {
  const hasReplyContext = Boolean(replySenderName && replyPreviewText);
  const hasContent = Boolean(contentPreview) && fileCount === 0;
  const hasFiles = fileCount > 0;
  const shouldShowSendingDots = hasFiles;

  let attachmentText = '';

  if (hasFiles) {
    attachmentText = fileCount === 1 ? '[1 tệp đính kèm]' : `[${fileCount} tệp đính kèm]`;
  }

  const hasRenderablePreview = hasReplyContext || hasContent;

  return (
    <div className="flex justify-end mb-1.5">
      <div className="flex flex-col items-end max-w-[70%]">
        <div className={cn('w-full rounded-2xl px-3.5 py-1.5', 'bg-primary text-primary-foreground rounded-2xl')}>
          {hasRenderablePreview && (
            <div className="space-y-1.5">
              {hasReplyContext && (
                <div className="w-full text-left border-l-2 rounded-md px-2 py-0.5 bg-primary-foreground/15 border-primary-foreground/40 text-primary-foreground">
                  <p className="text-xs font-semibold text-primary-foreground/90">{replySenderName}</p>
                  <p className="text-xs line-clamp-2 text-primary-foreground/85">{replyPreviewText}</p>
                </div>
              )}

              {hasContent && (
                <p className="text-sm leading-relaxed whitespace-pre-wrap wrap-break-word">{contentPreview}</p>
              )}

              {hasFiles && <p className="text-xs text-primary-foreground/85">{attachmentText}</p>}
            </div>
          )}

          {shouldShowSendingDots && (
            <div className="flex items-center gap-1 mt-0.5 px-1" aria-label="Đang gửi tệp đính kèm">
              <div
                className="w-1.5 h-1.5 bg-muted-foreground/80 rounded-full animate-bounce"
                style={{ animationDelay: '0ms' }}
              />
              <div
                className="w-1.5 h-1.5 bg-muted-foreground/80 rounded-full animate-bounce"
                style={{ animationDelay: '150ms' }}
              />
              <div
                className="w-1.5 h-1.5 bg-muted-foreground/80 rounded-full animate-bounce"
                style={{ animationDelay: '300ms' }}
              />
            </div>
          )}
        </div>

        {!shouldShowSendingDots && <span className="text-xs text-muted-foreground mt-0.5 px-1">Đã gửi</span>}
      </div>
    </div>
  );
}
