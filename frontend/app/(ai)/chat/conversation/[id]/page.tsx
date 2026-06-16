'use client';

import { useAIChat } from '@/hooks/useAIChat';
import { useParams } from 'next/navigation';
import { useGetConversationMessagesQuery } from '@/services/ai/conversationApi';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ErrorMessage from '@/components/common/ErrorMessage';
import { ChatContainer } from '@/app/(ai)/components/ChatContainer';
import { AI_MESSAGE_PAGE_SIZE } from '@/constants/constant';
import { AIMessage } from '@/services/ai/conversationType';

export default function ConversationPage() {
  const params = useParams();
  const conversationId = useMemo(() => Number(params.id), [params.id]);
  const [page, setPage] = useState(1);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [shouldAutoSendPendingMessage, setShouldAutoSendPendingMessage] = useState(false);
  const requestedPagesRef = useRef<Set<number>>(new Set([1]));

  const {
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
  } = useAIChat();

  const { data, isError, isFetching } = useGetConversationMessagesQuery(
    {
      conversationId,
      page,
      size: AI_MESSAGE_PAGE_SIZE,
    },
    {
      skip: !conversationId || Number.isNaN(conversationId),
    },
  );

  useEffect(() => {
    if (!conversationId || Number.isNaN(conversationId)) {
      return;
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPage(1);
    setHasMoreMessages(true);
    setMessages([]);
    requestedPagesRef.current = new Set([1]);
  }, [conversationId, setMessages]);

  useEffect(() => {
    const pendingMessage = sessionStorage.getItem('pendingMessage');
    if (pendingMessage && conversationId) {
      sessionStorage.removeItem('pendingMessage');
      setInputMessage(pendingMessage);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShouldAutoSendPendingMessage(true);
    }
  }, [conversationId, setInputMessage]);

  useEffect(() => {
    const paginationData = data?.data;
    if (!paginationData?.result) {
      return;
    }

    const normalizedMessages = [...paginationData.result].reverse().map((message: AIMessage) => ({
      ...message,
      id: `server-${message.aiMessageId}`,
      status: 'sent' as const,
    }));

    setMessages((prevMessages) => {
      if (page === 1) {
        return normalizedMessages;
      }

      const existingIds = new Set(
        prevMessages.filter((message) => message.aiMessageId > 0).map((message) => message.aiMessageId),
      );

      const uniqueOlderMessages = normalizedMessages.filter((message) => !existingIds.has(message.aiMessageId));

      return [...uniqueOlderMessages, ...prevMessages];
    });

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHasMoreMessages(page < (paginationData.meta?.pages ?? 1));
  }, [data, page, setMessages]);

  const handleLoadMoreMessages = useCallback(() => {
    if (isFetching || !hasMoreMessages) {
      return;
    }

    setPage((previousPage) => {
      const nextPage = previousPage + 1;
      if (requestedPagesRef.current.has(nextPage)) {
        return previousPage;
      }

      requestedPagesRef.current.add(nextPage);
      return nextPage;
    });
  }, [hasMoreMessages, isFetching]);

  useEffect(() => {
    if (shouldAutoSendPendingMessage && inputMessage && conversationId && !isLoading && !isWaitingAIResponse) {
      const timer = setTimeout(() => {
        setShouldAutoSendPendingMessage(false);
        handleChat(conversationId);
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [shouldAutoSendPendingMessage, inputMessage, conversationId, isLoading, isWaitingAIResponse, handleChat]);

  const handleRetryMessage = async (messageId: string) => {
    await retryMessage(messageId, conversationId);
  };

  const handleKeyDown = async (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      await handleChat(conversationId);
    }
  };

  if (isError) {
    return (
      <div className="p-4">
        <ErrorMessage message="Không thể tải tin nhắn cuộc trò chuyện." variant="card" />
      </div>
    );
  }

  return (
    <ChatContainer
      messages={messages}
      inputMessage={inputMessage}
      isLoading={isLoading || isWaitingAIResponse}
      isFetchingHistory={isFetching && page > 1}
      hasMoreHistory={hasMoreMessages}
      parseMarkdown={parseMarkdown}
      messagesEndRef={messagesEndRef}
      onLoadMoreHistory={handleLoadMoreMessages}
      onRetryMessage={handleRetryMessage}
      onInputChange={setInputMessage}
      onSendMessage={() => handleChat(conversationId)}
      onKeyDown={handleKeyDown}
    />
  );
}
