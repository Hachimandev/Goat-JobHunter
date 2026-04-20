'use client';

import { CHAT_MESSAGE_PAGE_SIZE } from '@/constants/constant';
import { useFetchMessagesInChatRoomQuery, useLazyFetchMessagesInChatRoomQuery } from '@/services/chatRoom/chatRoomApi';
import type { FetchMessagesInChatRoomResponse } from '@/services/chatRoom/chatRoomType';
import type { MessageResponse } from '@/types/model';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

type UsePaginatedChatMessagesResult = {
  messages: MessageResponse[];
  currentPage: number;
  hasOlderMessages: boolean;
  isLoadingInitialMessages: boolean;
  isLoadingOlderMessages: boolean;
  isFetchingPageOne: boolean;
  isErrorInitialMessages: boolean;
  loadOlderMessages: () => Promise<void>;
};

const getMessageBatch = (response?: FetchMessagesInChatRoomResponse): MessageResponse[] => {
  return response?.data?.result || [];
};

const getTotalPages = (response?: FetchMessagesInChatRoomResponse): number => {
  return response?.data?.meta?.pages || 1;
};

const deduplicateAndSortMessages = (messages: MessageResponse[]): MessageResponse[] => {
  const uniqueMessages = new Map<string, MessageResponse>();

  messages.forEach((message) => {
    uniqueMessages.set(message.messageId, message);
  });

  return Array.from(uniqueMessages.values()).sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );
};

export function usePaginatedChatMessages(chatRoomId: number | null): UsePaginatedChatMessagesResult {
  const shouldSkip = chatRoomId === null || Number.isNaN(chatRoomId);

  const [olderMessages, setOlderMessages] = useState<MessageResponse[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasOlderMessages, setHasOlderMessages] = useState(false);
  const [isLoadingOlderMessages, setIsLoadingOlderMessages] = useState(false);

  const requestedPagesRef = useRef<Set<number>>(new Set([1]));
  const requestInFlightRef = useRef(false);
  const currentPageRef = useRef(1);

  const {
    data: pageOneData,
    isLoading: isLoadingInitialMessages,
    isFetching: isFetchingPageOne,
    isError: isErrorInitialMessages,
  } = useFetchMessagesInChatRoomQuery(
    {
      chatRoomId: chatRoomId ?? 0,
      page: 1,
      size: CHAT_MESSAGE_PAGE_SIZE,
    },
    {
      skip: shouldSkip,
    },
  );

  const [triggerFetchMessages] = useLazyFetchMessagesInChatRoomQuery();

  useEffect(() => {
    requestedPagesRef.current = new Set([1]);
    requestInFlightRef.current = false;
    currentPageRef.current = 1;

    setCurrentPage(1);
    setOlderMessages([]);
    setHasOlderMessages(false);
    setIsLoadingOlderMessages(false);
  }, [chatRoomId]);

  const liveMessages = useMemo(() => {
    return deduplicateAndSortMessages(getMessageBatch(pageOneData));
  }, [pageOneData]);

  useEffect(() => {
    if (!pageOneData?.data?.meta) {
      return;
    }

    const totalPages = getTotalPages(pageOneData);
    setHasOlderMessages(currentPageRef.current < totalPages);
  }, [pageOneData]);

  const messages = useMemo(() => {
    return deduplicateAndSortMessages([...olderMessages, ...liveMessages]);
  }, [olderMessages, liveMessages]);

  const loadOlderMessages = useCallback(async () => {
    if (shouldSkip || !chatRoomId || !hasOlderMessages || requestInFlightRef.current) {
      return;
    }

    const nextPage = currentPageRef.current + 1;

    if (requestedPagesRef.current.has(nextPage)) {
      return;
    }

    requestedPagesRef.current.add(nextPage);
    requestInFlightRef.current = true;
    setIsLoadingOlderMessages(true);

    try {
      const response = await triggerFetchMessages(
        {
          chatRoomId,
          page: nextPage,
          size: CHAT_MESSAGE_PAGE_SIZE,
        },
        true,
      ).unwrap();

      const nextBatch = getMessageBatch(response);

      if (nextBatch.length > 0) {
        setOlderMessages((previousMessages) => deduplicateAndSortMessages([...nextBatch, ...previousMessages]));
      }

      setCurrentPage(nextPage);
      currentPageRef.current = nextPage;

      const totalPages = getTotalPages(response);
      setHasOlderMessages(nextPage < totalPages);
    } catch (error) {
      requestedPagesRef.current.delete(nextPage);
      console.error('Failed to load older chat messages:', error);
    } finally {
      requestInFlightRef.current = false;
      setIsLoadingOlderMessages(false);
    }
  }, [chatRoomId, hasOlderMessages, shouldSkip, triggerFetchMessages]);

  return {
    messages,
    currentPage,
    hasOlderMessages,
    isLoadingInitialMessages: isLoadingInitialMessages && liveMessages.length === 0 && olderMessages.length === 0,
    isLoadingOlderMessages,
    isFetchingPageOne,
    isErrorInitialMessages,
    loadOlderMessages,
  };
}
