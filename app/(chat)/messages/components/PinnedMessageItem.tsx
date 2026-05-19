import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MessageTypeEnum } from "@/types/enum";
import { PinnedMessage } from "@/types/model";
import { formatDateTime } from "@/utils/formatDate";
import { getMessageSenderDisplayName, getMessageTypePreviewText } from "@/utils/messageUtils";
import { truncate } from "lodash";
import { EllipsisVertical, Loader2, PinOff } from "lucide-react";

interface PinnedMessageItemProps {
  message: PinnedMessage;
  showViewAllButton?: boolean;
  className?: string;
  onNavigateToMessage: (messageId: string) => void;
  onUnpin?: (messageId: string) => Promise<void> | void;
  isUnpinning?: (messageId: string) => boolean;
  isExpanded: boolean;
  setIsExpanded: (expanded: boolean) => void;
  readOnly?: boolean;
}

export function PinnedMessageItem ({
  message,
  showViewAllButton = false,
  className = '',
  onNavigateToMessage,
  onUnpin,
  isUnpinning,
  isExpanded,
  setIsExpanded,
  readOnly = false,
}: PinnedMessageItemProps) {
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
          alt={getMessageSenderDisplayName(message.message.sender)}
        />
        <AvatarFallback>{getMessageSenderDisplayName(message.message.sender).charAt(0)}</AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-bold">Ghim lúc {formatDateTime(message.pinnedAt)}</p>
            <div className="text-sm text-muted-foreground truncate flex gap-1">
              <div>
                {getMessageSenderDisplayName(message.message.sender)}
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
                disabled={isUnpinning?.(message.messageId) || readOnly}
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