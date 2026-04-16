import { Check, Copy, Loader2, Send } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { MessageTypeRole } from '@/types/enum';
import { AIMessageViewModel } from '@/services/ai/conversationType';
import { useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

interface ChatContainerProps {
  messages: AIMessageViewModel[];
  inputMessage: string;
  isLoading: boolean;
  isFetchingHistory?: boolean;
  hasMoreHistory?: boolean;
  isCreatingConversation?: boolean;
  parseMarkdown: (content: string) => string;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  onLoadMoreHistory?: () => void;
  onRetryMessage?: (messageId: string) => void;
  onInputChange: (value: string) => void;
  onSendMessage: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  welcomeMessage?: React.ReactNode;
  showInput?: boolean;
}

export const ChatContainer = ({
  messages,
  inputMessage,
  isLoading,
  isFetchingHistory = false,
  hasMoreHistory = false,
  isCreatingConversation = false,
  parseMarkdown,
  messagesEndRef,
  onLoadMoreHistory,
  onRetryMessage,
  onInputChange,
  onSendMessage,
  onKeyDown,
  welcomeMessage,
  showInput = true,
}: ChatContainerProps) => {
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const copiedTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleCopyMessage = async (messageId: string, content: string) => {
    if (!content.trim()) {
      return;
    }

    try {
      await navigator.clipboard.writeText(content);
      setCopiedMessageId(messageId);

      if (copiedTimeoutRef.current) {
        clearTimeout(copiedTimeoutRef.current);
      }

      copiedTimeoutRef.current = setTimeout(() => {
        setCopiedMessageId(null);
      }, 1500);
    } catch (error) {
      console.error('Failed to copy message content:', error);
      toast.error('Không thể sao chép nội dung tin nhắn.');
    }
  };

  const handleHistoryScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (!onLoadMoreHistory || !hasMoreHistory || isFetchingHistory || isLoading) {
      return;
    }

    if (e.currentTarget.scrollTop <= 80) {
      onLoadMoreHistory();
    }
  };

  const messagesWithUserFlag = useMemo(() => {
    return messages.map((message) => ({
      ...message,
      isUser: message.role === MessageTypeRole.User,
    }));
  }, [messages]);

  return (
    <div className="flex flex-col h-full relative">
      <div className="flex-1 px-6 h-full pb-12 overflow-y-auto" onScroll={handleHistoryScroll}>
        <div className="py-4 min-h-full flex flex-col">
          {messages.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              {welcomeMessage || <p className="text-muted-foreground text-sm">Bắt đầu cuộc trò chuyện của bạn...</p>}
            </div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-4 w-full">
              {isFetchingHistory && (
                <div className="flex justify-center">
                  <div className="max-w-[80%] rounded-xl px-4 py-2 bg-muted flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                  </div>
                </div>
              )}

              {messagesWithUserFlag.map((message) => (
                <div key={message.id} className={cn('group space-y-1 w-fit', message.isUser ? 'ml-auto' : 'mr-auto')}>
                  <div className={cn('flex', message.isUser ? 'justify-end' : 'justify-start')}>
                    <div
                      className={cn(
                        'w-full rounded-2xl px-4 py-2 prose prose-sm wrap-break-word shadow',
                        message.isUser ? 'bg-primary text-white prose-invert' : 'bg-muted',
                        message.status === 'failed' && 'border border-destructive/50',
                      )}
                      dangerouslySetInnerHTML={{
                        __html: parseMarkdown(message.content),
                      }}
                    />
                  </div>

                  <div className={cn('flex', message.isUser ? 'justify-end' : 'justify-start')}>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      className={cn(
                        'rounded-full shrink-0 transition-opacity',
                        message.isUser
                          ? copiedMessageId === message.id
                            ? 'opacity-100 pointer-events-auto'
                            : 'opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto'
                          : 'opacity-100 pointer-events-auto',
                      )}
                      onClick={() => handleCopyMessage(message.id, message.content)}
                      title="Sao chép nội dung"
                    >
                      {copiedMessageId === message.id ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    </Button>
                  </div>

                  {message.status === 'failed' && message.isUser && (
                    <div className="flex items-center justify-end gap-2">
                      <span className="text-xs text-destructive">{message.errorMessage || 'Gửi thất bại'}</span>
                      {onRetryMessage && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 rounded-lg text-xs"
                          onClick={() => onRetryMessage(message.id)}
                          disabled={isLoading}
                        >
                          Thử lại
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="max-w-[80%] rounded-xl px-4 py-2 bg-muted flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm text-muted-foreground">Đang suy nghĩ...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {showInput && (
        <div className="px-6 py-4 shrink-0 absolute bottom-0 left-0 right-0">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 bg-card rounded-2xl border border-border p-1 transition-all hover:shadow-xl focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 shadow-lg">
              <Input
                placeholder="Nhập câu hỏi của bạn..."
                value={inputMessage}
                onChange={(e) => onInputChange(e.target.value)}
                onKeyDown={onKeyDown}
                disabled={isLoading || isCreatingConversation}
                className="flex-1 bg-transparent border-none text-base focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/60"
              />
              <Button
                size="icon"
                variant="ghost"
                className="h-10 w-10 rounded-xl shrink-0"
                onClick={onSendMessage}
                disabled={isLoading || !inputMessage.trim() || isCreatingConversation}
              >
                {isLoading || isCreatingConversation ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
