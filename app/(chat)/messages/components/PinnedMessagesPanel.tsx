import { PinnedMessage } from '@/types/model';
import { Button } from '@/components/ui/button';
import { ChevronDown, PinOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia } from '@/components/ui/empty';
import { PinnedMessageItem } from './PinnedMessageItem';

interface PinnedMessagesPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pinnedMessages: PinnedMessage[];
  isLoadingPinnedMessages: boolean;
  onUnpin: (messageId: string) => Promise<void> | void;
  isUnpinning: (messageId: string) => boolean;
  onNavigateToMessage?: (messageId: string) => void;
  readOnly?: boolean;
}

export function PinnedMessagesPanel({
  open,
  pinnedMessages,
  onUnpin,
  isUnpinning,
  onNavigateToMessage,
  readOnly = false,
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
            <EmptyDescription className="max-w-md text-pretty">
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
                readOnly={readOnly}
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
                    readOnly={readOnly}
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