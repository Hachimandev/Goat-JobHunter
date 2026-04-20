'use client';

import { CHAT_MESSAGE_PAGE_SIZE } from '@/constants/constant';
import { useFetchMessagesInChatRoomQuery, useLazyFetchMessagesInChatRoomQuery } from '@/services/chatRoom/chatRoomApi';
import type { MessageResponse } from '@/types/model';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getPaginatedResult, getPaginatedTotalPages, useLoadMorePaginationState } from './paginationHelpers';

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
  const {
    currentPage,
    hasMore: hasOlderMessages,
    isFetchingNext: isLoadingOlderMessages,
    resetPagination,
    syncHasMoreFromTotalPages,
    startNextPageFetch,
    completeNextPageFetch,
    cancelNextPageFetch,
    finishNextPageFetch,
  } = useLoadMorePaginationState();

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
    resetPagination();
    setOlderMessages([]);
  }, [chatRoomId, resetPagination]);

  const liveMessages = useMemo(() => {
    return deduplicateAndSortMessages(getPaginatedResult(pageOneData));
  }, [pageOneData]);

  useEffect(() => {
    if (!pageOneData?.data?.meta) {
      return;
    }

    syncHasMoreFromTotalPages(getPaginatedTotalPages(pageOneData));
  }, [pageOneData, syncHasMoreFromTotalPages]);

  const messages = useMemo(() => {
    return deduplicateAndSortMessages([...olderMessages, ...liveMessages]);
  }, [olderMessages, liveMessages]);

  const loadOlderMessages = useCallback(async () => {
    if (shouldSkip || !chatRoomId) {
      return;
    }

    const nextPage = startNextPageFetch({ shouldSkip });
    if (nextPage === null) {
      return;
    }

    try {
      const response = await triggerFetchMessages(
        {
          chatRoomId,
          page: nextPage,
          size: CHAT_MESSAGE_PAGE_SIZE,
        },
        true,
      ).unwrap();

      const nextBatch = getPaginatedResult(response);

      if (nextBatch.length > 0) {
        setOlderMessages((previousMessages) => deduplicateAndSortMessages([...nextBatch, ...previousMessages]));
      }

      completeNextPageFetch(nextPage, getPaginatedTotalPages(response));
    } catch (error) {
      cancelNextPageFetch(nextPage);
      console.error('Failed to load older chat messages:', error);
    } finally {
      finishNextPageFetch();
    }
  }, [
    cancelNextPageFetch,
    chatRoomId,
    completeNextPageFetch,
    finishNextPageFetch,
    shouldSkip,
    startNextPageFetch,
    triggerFetchMessages,
  ]);

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
