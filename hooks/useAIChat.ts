import { useEffect, useRef, useState } from 'react';
import { useAiChatMutation } from '@/services/ai/conversationApi';
import DOMPurify from 'dompurify';
import { marked } from 'marked';
import { toast } from 'sonner';
import { AIMessageViewModel } from '@/services/ai/conversationType';
import { MessageTypeRole } from '@/types/enum';
import { extractApiErrorMessage } from '@/utils/apiError';
import { useUser } from '@/hooks/useUser';

marked.setOptions({
  breaks: true,
  gfm: true,
});

const createLocalMessageId = () => `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const createLocalAiMessageNumericId = () => -(Date.now() + Math.floor(Math.random() * 1000));

export function useAIChat() {
  const { isSignedIn } = useUser();
  const [inputMessage, setInputMessage] = useState('');
  const [chat, { isLoading }] = useAiChatMutation();
  const [messages, setMessages] = useState<AIMessageViewModel[]>([]);
  const [isWaitingAIResponse, setIsWaitingAIResponse] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastMessageIdRef = useRef<string | null>(null);

  // Auto scroll to bottom
  useEffect(() => {
    const currentLastMessageId = messages[messages.length - 1]?.id ?? null;
    const hasLastMessageChanged = currentLastMessageId !== lastMessageIdRef.current;

    if (hasLastMessageChanged || isLoading || isWaitingAIResponse) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }

    lastMessageIdRef.current = currentLastMessageId;
  }, [messages, isLoading, isWaitingAIResponse]);

  const sendMessage = async (conversationId: number, content: string, existingMessageId?: string) => {
    if (!isSignedIn) {
      toast.error('Vui lòng đăng nhập để trò chuyện với AI.');
      return false;
    }

    if (!conversationId) {
      toast.error('Không tìm thấy cuộc trò chuyện hợp lệ.');
      return false;
    }

    const trimmedMessage = content.trim();
    if (!trimmedMessage) {
      toast.error('Vui lòng nhập tin nhắn.');
      return false;
    }

    const optimisticMessageId = existingMessageId ?? createLocalMessageId();

    if (existingMessageId) {
      setMessages((prevMessages) =>
        prevMessages.map((message) =>
          message.id === existingMessageId
            ? {
                ...message,
                status: 'pending' as const,
                errorMessage: undefined,
              }
            : message,
        ),
      );
    } else {
      const now = new Date().toISOString();
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          id: optimisticMessageId,
          aiMessageId: createLocalAiMessageNumericId(),
          role: MessageTypeRole.User,
          content: trimmedMessage,
          createdAt: now,
          updatedAt: now,
          status: 'pending' as const,
        },
      ]);
      setInputMessage('');
    }

    setIsWaitingAIResponse(true);

    try {
      const result = await chat({ message: trimmedMessage, conversationId }).unwrap();
      const now = new Date().toISOString();

      setMessages((prevMessages) => [
        ...prevMessages.map((message) =>
          message.id === optimisticMessageId
            ? {
                ...message,
                status: 'sent' as const,
                errorMessage: undefined,
              }
            : message,
        ),
        {
          id: createLocalMessageId(),
          aiMessageId: createLocalAiMessageNumericId(),
          role: MessageTypeRole.AI,
          content: result,
          createdAt: now,
          updatedAt: now,
          status: 'sent' as const,
        },
      ]);

      return true;
    } catch (error) {
      const errorMessage = extractApiErrorMessage(error, 'Không thể gửi tin nhắn tới AI.');

      setMessages((prevMessages) =>
        prevMessages.map((message) =>
          message.id === optimisticMessageId
            ? {
                ...message,
                status: 'failed' as const,
                errorMessage,
              }
            : message,
        ),
      );

      toast.error(errorMessage);
      console.error('Error during AI chat:', error);
      return false;
    } finally {
      setIsWaitingAIResponse(false);
    }
  };

  const handleChat = async (conversationId?: number) => {
    if (!conversationId) {
      toast.error('Vui lòng tạo cuộc trò chuyện trước khi gửi tin nhắn.');
      return false;
    }

    return sendMessage(conversationId, inputMessage);
  };

  const retryMessage = async (messageId: string, conversationId: number) => {
    const retryTarget = messages.find((message) => message.id === messageId && message.status === 'failed');

    if (!retryTarget) {
      return false;
    }

    return sendMessage(conversationId, retryTarget.content, retryTarget.id);
  };

  const parseMarkdown = (content: string) => {
    const html = marked.parse(content);
    // @ts-expect-error DOMPurify types issue
    return DOMPurify.sanitize(html);
  };

  return {
    inputMessage,
    setInputMessage,

    messagesEndRef,
    parseMarkdown,

    isLoading,
    isWaitingAIResponse,
    handleChat,
    retryMessage,

    messages,
    setMessages,
  };
}
