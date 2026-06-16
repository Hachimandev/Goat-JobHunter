'use client';

import { X, MessageCircle, Send, ExternalLink, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useState } from 'react';
import { useAIChat } from '@/hooks/useAIChat';
import { MessageTypeRole } from '@/types/enum';
import { useConversationActions } from '@/hooks/useConversationActions';
import { useUser } from '@/hooks/useUser';
import { toast } from 'sonner';

export function AIChatPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [isCreatingConversation, setIsCreatingConversation] = useState(false);
  const { isSignedIn } = useUser();
  const { handleCreateConversation } = useConversationActions();
  const {
    inputMessage,
    setInputMessage,

    messages,

    isLoading,
    messagesEndRef,

    parseMarkdown,

    handleChat,
  } = useAIChat();

  const ensureConversationId = async () => {
    if (conversationId) {
      return conversationId;
    }

    setIsCreatingConversation(true);

    try {
      const result = await handleCreateConversation();
      const createdConversationId = result?.data?.conversationId;

      if (!createdConversationId) {
        toast.error('Không thể tạo cuộc trò chuyện mới.');
        return null;
      }

      setConversationId(createdConversationId);
      return createdConversationId;
    } finally {
      setIsCreatingConversation(false);
    }
  };

  const handleSendMessage = async () => {
    if (!isSignedIn) {
      toast.error('Vui lòng đăng nhập để trò chuyện với AI.');
      return;
    }

    const ensuredConversationId = await ensureConversationId();
    if (!ensuredConversationId) {
      return;
    }

    await handleChat(ensuredConversationId);
  };

  const isSending = isLoading || isCreatingConversation;

  const handleKeyDown = async (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      await handleSendMessage();
    }
  };

  return (
    <>
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          size="icon"
          className="fixed bottom-6 right-6 w-12 h-12 rounded-full shadow-lg hover:shadow-xl transition-all z-50"
          aria-label="Open AI Chat"
        >
          <MessageCircle className="w-8 h-8" />
        </Button>
      )}

      {isOpen && (
        <Card className="fixed bottom-6 right-6 w-96 h-[600px] shadow-2xl flex flex-col z-50 py-0 rounded-xl gap-0">
          <div className="flex items-center justify-between p-4 border-b bg-primary text-white rounded-t-lg">
            <div className="flex items-center gap-2">
              <h3 className="text-base">Trợ lý AI</h3>
              <Link href="/chat" title="Mở trong cửa sổ chat mới" target="_blank" className="hover:text-gray-300">
                <ExternalLink className="w-4 h-4" />
              </Link>
            </div>
            <Button
              onClick={() => setIsOpen(false)}
              variant="ghost"
              size="icon"
              className="hover:bg-white/20 text-white h-8 w-8 rounded-full"
              aria-label="Close chat"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          <ScrollArea className="flex-1 p-4 overflow-y-auto bg-gray-50">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 text-sm">
                <p>
                  Chào bạn! Tôi là trợ lý AI thông minh của &#34;Goat Tìm Kiếm Việc Làm&#34;, rất vui được hỗ trợ bạn.
                </p>
              </div>
            ) : (
              <div className="space-y-4 h-full">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn('flex', message.role === MessageTypeRole.User ? 'justify-end' : 'justify-start')}
                  >
                    <div
                      className={cn(
                        'max-w-[80%] rounded-xl px-4 py-2 text-sm prose prose-sm',
                        message.role === MessageTypeRole.User
                          ? 'bg-primary text-white prose-invert'
                          : 'bg-white border',
                      )}
                      dangerouslySetInnerHTML={{
                        __html: parseMarkdown(message.content),
                      }}
                    />
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="max-w-[80%] rounded-lg px-4 py-2 bg-white border flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm text-gray-500">Đang suy nghĩ...</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </ScrollArea>

          <div className="p-4 border-t bg-white rounded-b-lg">
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder={isSignedIn ? 'Nhập tin nhắn...' : 'Đăng nhập để trò chuyện với AI'}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isSending || !isSignedIn}
                className="flex-1 rounded-xl"
              />
              <Button
                size="icon"
                className="rounded-xl"
                onClick={handleSendMessage}
                disabled={isSending || !isSignedIn || !inputMessage.trim()}
              >
                {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </Card>
      )}
    </>
  );
}
