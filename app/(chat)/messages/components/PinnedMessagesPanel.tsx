import { PinnedMessage } from '@/types/model';
import { Button } from '@/components/ui/button';
import { ChevronDown, EllipsisVertical, Loader2, PinOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDateTime } from '@/utils/formatDate';
import { getMessageTypePreviewText } from '@/utils/messageUtils';
import { MessageTypeEnum } from '@/types/enum';
import { truncate } from 'lodash';
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia } from '@/components/ui/empty';

interface PinnedMessagesPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pinnedMessages: PinnedMessage[];
  isLoadingPinnedMessages: boolean;
  onUnpin: (messageId: string) => Promise<void> | void;
  isUnpinning: (messageId: string) => boolean;
  onNavigateToMessage?: (messageId: string) => void;
}

export function PinnedMessagesPanel({
  open,
  pinnedMessages,
  onUnpin,
  isUnpinning,
  onNavigateToMessage,
}: Readonly<PinnedMessagesPanelProps>) {
  const [isExpanded, setIsExpanded] = useState(false);
  const firstMessage = pinnedMessages[0];
  const shouldUseScrollableList = pinnedMessages.length > 3;

  useEffect(() => {
    return () => {
      setIsExpanded(false);
    };
  }, [open]);

  if (!open) return null;

  if (pinnedMessages.length === 0) {
    return (
      <div className="absolute top-16 bg-card border-b p-4 left-0 right-0 z-40 animate-in slide-in-from-top-2 duration-200">
        <Empty className="h-[50px]">
          <EmptyHeader>
            <EmptyMedia variant="icon" className="rounded-full">
              <PinOff className="h-6 w-6 text-muted-foreground" />
            </EmptyMedia>
            <EmptyDescription className="max-w-xs text-pretty">
              Không có tin nhắn nào được ghim trong cuộc trò chuyện này.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    );
  }

  return (
    <>
      <div className="absolute top-16 bg-card border-b p-2 left-0 right-0 z-40 animate-in slide-in-from-top-2 duration-200">
        <div>
          {!isExpanded && (
            <div className="w-full" title="Xem tin nhắn đã ghim" onClick={() => setIsExpanded(true)}>
              <PinnedMessageItem
                message={firstMessage}
                showViewAllButton={pinnedMessages.length > 1}
                onNavigateToMessage={onNavigateToMessage!}
                isExpanded={isExpanded}
                setIsExpanded={setIsExpanded}
              />
            </div>
          )}
        </div>

        {isExpanded && (
          <div className="">
            <Button
              className="w-full flex items-center justify-between h-8"
              title="Thu gọn"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <div className="text-sm font-semibold">Danh sách ghim</div>
              <ChevronDown className="h-6 w-6" />
            </Button>
            <ScrollArea className={cn('w-full', shouldUseScrollableList ? 'h-48' : 'h-auto')}>
              <div className={cn('space-y-2', shouldUseScrollableList && 'pr-2')}>
                {pinnedMessages.map((message) => (
                  <PinnedMessageItem
                    key={message.messageId}
                    message={message}
                    className="p-2 hover:bg-accent/30 rounded-xl"
                    onNavigateToMessage={onNavigateToMessage!}
                    onUnpin={onUnpin}
                    isUnpinning={isUnpinning}
                    isExpanded={isExpanded}
                    setIsExpanded={setIsExpanded}
                  />
                ))}
              </div>
            </ScrollArea>
          </div>
        )}
      </div>
    </>
  );
}

interface PinnedMessageItemProps {
  // Item to render
  message: PinnedMessage;

  // Whether to show the "View All" button for this item (only shown on the first item when there are multiple pinned messages)
  showViewAllButton?: boolean;

  // Additional class name for the item container
  className?: string;

  // Callback when the item is clicked to navigate to the original message
  onNavigateToMessage: (messageId: string) => void;

  // Callbacks and state for unpinning the message (if the user has permission to unpin)
  onUnpin?: (messageId: string) => Promise<void> | void;
  isUnpinning?: (messageId: string) => boolean;

  // State to control whether the pinned messages list is expanded or not
  isExpanded: boolean;
  setIsExpanded: (expanded: boolean) => void;
}

const PinnedMessageItem = ({
  message,
  showViewAllButton = false,
  className = '',
  onNavigateToMessage,
  onUnpin,
  isUnpinning,
  isExpanded,
  setIsExpanded,
}: PinnedMessageItemProps) => {
  const showActionButtons = Boolean(onUnpin) || Boolean(isUnpinning);

  const renderMessageContent = (message: PinnedMessage) => {
    const type = message.message.messageType;

    if (type === MessageTypeEnum.TEXT) {
      return truncate(message.message.content, { length: 100 });
    }

    return getMessageTypePreviewText(type);
  };

  return (
    <div
      className={`flex items-start gap-3 transition-colors cursor-pointer ${className}`}
      title="Xem tin nhắn gốc"
      onClick={() => {
        onNavigateToMessage?.(message.messageId);
        setIsExpanded(false);
      }}
    >
      <Avatar className="h-10 w-10">
        <AvatarImage
          src={message.message.sender?.avatar || '/placeholder.svg'}
          alt={message.message.sender?.fullName}
        />
        <AvatarFallback>{message.message.sender?.fullName.charAt(0)}</AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-bold">Ghim lúc {formatDateTime(message.pinnedAt)}</p>
            <div className="text-sm text-muted-foreground truncate flex gap-1">
              <div>
                {message.message.sender?.fullName || message.message.sender?.username || 'Người dùng'}
                {': '}
              </div>
              {renderMessageContent(message)}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {showViewAllButton && (
              <Button
                variant="ghost"
                size="icon-sm"
                className="rounded-full"
                title="Xem tất cả"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(!isExpanded);
                }}
              >
                <EllipsisVertical className="h-4 w-4" />
              </Button>
            )}
            {showActionButtons && (
              <Button
                variant="ghost"
                size="icon-sm"
                className="h-7 w-7 rounded-full"
                onClick={(e) => {
                  e.stopPropagation();
                  onUnpin?.(message.messageId);
                }}
                aria-label="Bỏ ghim tin nhắn"
                disabled={isUnpinning?.(message.messageId) ?? false}
              >
                {isUnpinning?.(message.messageId) ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <PinOff className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
