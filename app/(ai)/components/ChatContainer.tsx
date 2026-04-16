import { Loader2, Send } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageTypeRole } from '@/types/enum';
import { MessageType } from '@/types/model';

interface ChatContainerProps {
  messages: MessageType[];
  inputMessage: string;
  isLoading: boolean;
  isCreatingConversation?: boolean;
  parseMarkdown: (content: string) => string;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
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
  isCreatingConversation = false,
  parseMarkdown,
  messagesEndRef,
  onInputChange,
  onSendMessage,
  onKeyDown,
  welcomeMessage,
  showInput = true,
}: ChatContainerProps) => {
  return (
    <div className="flex flex-col h-full relative">
      <ScrollArea className="flex-1 px-6 h-full pb-12">
        <div className="py-4 min-h-full flex flex-col">
          {messages.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              {welcomeMessage || <p className="text-muted-foreground text-sm">Bắt đầu cuộc trò chuyện của bạn...</p>}
            </div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-4 w-full">
              {messages.map((message) => (
                <div
                  key={message.messageId}
                  className={cn('flex', message.role === MessageTypeRole.User ? 'justify-end' : 'justify-start')}
                >
                  <div
                    className={cn(
                      'max-w-[80%] rounded-xl px-4 py-2 prose prose-sm wrap-break-word',
                      message.role === MessageTypeRole.User ? 'bg-primary text-white prose-invert' : 'bg-muted',
                    )}
                    dangerouslySetInnerHTML={{
                      __html: parseMarkdown(message.content),
                    }}
                  />
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
      </ScrollArea>

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
