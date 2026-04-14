'use client';

import { PinnedMessage } from '@/types/model';
import { Button } from '@/components/ui/button';
import { ChevronDown, PinOff } from 'lucide-react';
import { MessageTypeEnum } from '@/types/enum';
import MarkdownDisplay from '@/components/common/MarkdownDisplay';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface PinnedMessagesPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pinnedMessages: PinnedMessage[];
  isLoadingPinnedMessages?: boolean;
  onUnpin?: (messageId: string) => Promise<void> | void;
  isUnpinning?: (messageId: string) => boolean;
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
  const firstMessage =pinnedMessages[0];

  if (!open || !firstMessage) return null;

  const renderMessageContent = (message: PinnedMessage) => {
    const type = message.message.messageType;

    if (type === MessageTypeEnum.IMAGE) {
      return (
        <div className="flex gap-2 items-center">
          <Image
            src={message.message.content}
            alt="Pinned image"
            className="max-w-xs max-h-48 rounded-lg object-cover border"
            width={20}
            height={20}
          />
          <p>Ảnh</p>
        </div>
      );
    }

    if (type === MessageTypeEnum.VIDEO) {
      return (
        <div className="flex gap-2 items-center">
          <video src={message.message.content} controls className="max-w-xs max-h-48 rounded-lg" />
          <p>Video</p>
        </div>
      );
    }

    if (type === MessageTypeEnum.AUDIO) {
      return (
        <div className="flex gap-2 items-center">
          <audio src={message.message.content} controls className="max-w-xs" />
          <p>Audio</p>
        </div>
      );
    }

    if (type === MessageTypeEnum.FILE) {
      const fileName = message.message.content.split('/').pop() || 'file';
      return (
        <a
          href={message.message.content}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 text-blue-500 hover:underline"
        >
          📁 {fileName}
        </a>
      );
    }

    return <MarkdownDisplay className="text-sm text-foreground line-clamp-2" content={message.message.content} />;
  };

  return (
    <>
      <div className="fixed top-18 left-1/2 -translate-x-[46%] w-full max-w-[48%] bg-card border border-border rounded-lg shadow-lg z-40 animate-in slide-in-from-top-2 duration-200">
        <div>
          {!isExpanded && (
            <div
              className="flex items-start gap-3 p-2 rounded-md hover:bg-muted/60 transition-colors cursor-pointer"
              onClick={() => {
                onNavigateToMessage?.(firstMessage.messageId);
                setIsExpanded(false);
              }}
            >
              <Image
                src={firstMessage.message.sender?.avatar || '/placeholder.svg'}
                alt={firstMessage.message.sender?.fullName || 'avatar'}
                className="h-9 w-9 rounded-full object-cover flex-shrink-0"
                width={36}
                height={36}
              />

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-bold">
                      Tin nhắn {new Date(firstMessage.pinnedAt).toLocaleString('vi-VN')}
                    </p>
                    <div className="text-sm text-muted-foreground truncate flex gap-8">
                      <div>
                        {firstMessage.message.sender?.fullName ||
                          firstMessage.message.sender?.username ||
                          'Người dùng không xác định'}
                        {': '}
                      </div>
                      {renderMessageContent(firstMessage)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {pinnedMessages.length > 1 && (
                      <Button
                        variant="default"
                        size="sm"
                        className="h-7 px-2 rounded-md text-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsExpanded(!isExpanded);
                        }}
                      >
                        +{pinnedMessages.length} ghim
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={(e) => {
                        e.stopPropagation();
                        onUnpin?.(firstMessage.messageId);
                      }}
                      aria-label="Bỏ ghim tin nhắn"
                      disabled={isUnpinning?.(firstMessage.messageId) ?? false}
                    >
                      <PinOff className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {isExpanded && (
          <div className="border-t bg-muted/30 max-h-96">
            <Button
              size="sm"
              className="w-full flex items-center justify-between"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <div className="text-sm font-semibold">Danh sách ghim ({pinnedMessages.length})</div>
              <div>
                <p className="text-sm font-semibold flex">
                  Thu gọn
                  <ChevronDown
                    className={cn('h-5 w-5 transition-transform text-sm font-semibold', isExpanded && 'rotate-180')}
                  />
                </p>
              </div>
            </Button>
            <ScrollArea className="h-full">
              <div className="space-y-2">
                {pinnedMessages.map((message) => (
                  <div
                    key={message.messageId}
                    className="flex items-start gap-3 p-2 rounded-md hover:bg-muted/60 transition-colors cursor-pointer"
                    onClick={() => {
                      onNavigateToMessage?.(message.messageId);
                      setIsExpanded(false);
                    }}
                  >
                    <Image
                      src={message.message.sender?.avatar || '/placeholder.svg'}
                      alt={message.message.sender?.fullName || 'avatar'}
                      className="h-9 w-9 rounded-full object-cover flex-shrink-0"
                      width={36}
                      height={36}
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-bold">
                            Tin nhắn {new Date(message.pinnedAt).toLocaleString('vi-VN')}
                          </p>
                          <div className="text-sm text-muted-foreground truncate flex gap-8">
                            <div>
                              {message.message.sender?.fullName ||
                                message.message.sender?.username ||
                                'Người dùng không xác định'}
                              {': '}
                            </div>
                            {renderMessageContent(message)}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={(e) => {
                              e.stopPropagation();
                              onUnpin?.(message.messageId);
                            }}
                            aria-label="Bỏ ghim tin nhắn"
                            disabled={isUnpinning?.(message.messageId) ?? false}
                          >
                            <PinOff className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}
      </div>
    </>
  );
}
