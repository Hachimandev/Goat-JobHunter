'use client';

import { CHAT_DETAIL_ASSET_PAGE_SIZE } from '@/constants/constant';
import {
  useFetchFilesInChatRoomQuery,
  useFetchMediaInChatRoomQuery,
  useLazyFetchFilesInChatRoomQuery,
  useLazyFetchMediaInChatRoomQuery,
} from '@/services/chatRoom/chatRoomApi';
import type { FetchChatRoomAssetsRequest, FetchMessagesInChatRoomResponse } from '@/services/chatRoom/chatRoomType';
import type { MessageResponse } from '@/types/model';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

type ChatRoomAssetType = 'media' | 'files';

type UsePaginatedChatRoomAssetsOptions = {
  chatRoomId: number | null;
  assetType: ChatRoomAssetType;
  enabled: boolean;
};

type UsePaginatedChatRoomAssetsResult = {
  assets: MessageResponse[];
  currentPage: number;
  hasMore: boolean;
  isLoadingInitial: boolean;
  isFetchingNext: boolean;
  isError: boolean;
  loadMore: () => Promise<void>;
};

const getAssetBatch = (response?: FetchMessagesInChatRoomResponse): MessageResponse[] => {
  return response?.data?.result || [];
};

const getTotalPages = (response?: FetchMessagesInChatRoomResponse): number => {
  return response?.data?.meta?.pages || 1;
};

const mergeUniqueAssets = (messages: MessageResponse[]): MessageResponse[] => {
  const uniqueMessages = new Map<string, MessageResponse>();

  messages.forEach((message) => {
    if (!uniqueMessages.has(message.messageId)) {
      uniqueMessages.set(message.messageId, message);
    }
  });

  return Array.from(uniqueMessages.values());
};

export function usePaginatedChatRoomAssets({
  chatRoomId,
  assetType,
  enabled,
}: UsePaginatedChatRoomAssetsOptions): UsePaginatedChatRoomAssetsResult {
  const shouldSkip = !enabled || chatRoomId === null || Number.isNaN(chatRoomId);

  const [olderAssets, setOlderAssets] = useState<MessageResponse[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isFetchingNext, setIsFetchingNext] = useState(false);

  const requestedPagesRef = useRef<Set<number>>(new Set([1]));
  const requestInFlightRef = useRef(false);
  const currentPageRef = useRef(1);

  const filesPageOneQuery = useFetchFilesInChatRoomQuery(
    {
      chatRoomId: chatRoomId ?? 0,
      page: 1,
      size: CHAT_DETAIL_ASSET_PAGE_SIZE,
    },
    {
      skip: shouldSkip || assetType !== 'files',
    },
  );

  const mediaPageOneQuery = useFetchMediaInChatRoomQuery(
    {
      chatRoomId: chatRoomId ?? 0,
      page: 1,
      size: CHAT_DETAIL_ASSET_PAGE_SIZE,
    },
    {
      skip: shouldSkip || assetType !== 'media',
    },
  );

  const [triggerFetchFiles] = useLazyFetchFilesInChatRoomQuery();
  const [triggerFetchMedia] = useLazyFetchMediaInChatRoomQuery();

  const activePageOneQuery = assetType === 'media' ? mediaPageOneQuery : filesPageOneQuery;

  useEffect(() => {
    requestedPagesRef.current = new Set([1]);
    requestInFlightRef.current = false;
    currentPageRef.current = 1;

    setCurrentPage(1);
    setHasMore(false);
    setOlderAssets([]);
    setIsFetchingNext(false);
  }, [assetType, chatRoomId, enabled]);

  const liveAssets = useMemo(() => {
    return getAssetBatch(activePageOneQuery.data);
  }, [activePageOneQuery.data]);

  const assets = useMemo(() => {
    return mergeUniqueAssets([...liveAssets, ...olderAssets]);
  }, [liveAssets, olderAssets]);

  useEffect(() => {
    if (shouldSkip || !activePageOneQuery.data?.data?.meta) {
      return;
    }

    const totalPages = getTotalPages(activePageOneQuery.data);
    setHasMore(currentPageRef.current < totalPages);
  }, [activePageOneQuery.data, shouldSkip]);

  const loadMore = useCallback(async () => {
    if (shouldSkip || !chatRoomId || !hasMore || requestInFlightRef.current) {
      return;
    }

    const nextPage = currentPageRef.current + 1;

    if (requestedPagesRef.current.has(nextPage)) {
      return;
    }

    requestedPagesRef.current.add(nextPage);
    requestInFlightRef.current = true;
    setIsFetchingNext(true);

    const nextQueryArgs: FetchChatRoomAssetsRequest = {
      chatRoomId,
      page: nextPage,
      size: CHAT_DETAIL_ASSET_PAGE_SIZE,
    };

    try {
      const response =
        assetType === 'media'
          ? await triggerFetchMedia(nextQueryArgs, true).unwrap()
          : await triggerFetchFiles(nextQueryArgs, true).unwrap();

      const nextBatch = getAssetBatch(response);

      if (nextBatch.length > 0) {
        setOlderAssets((previousAssets) => mergeUniqueAssets([...previousAssets, ...nextBatch]));
      }

      setCurrentPage(nextPage);
      currentPageRef.current = nextPage;
      setHasMore(nextPage < getTotalPages(response));
    } catch (error) {
      requestedPagesRef.current.delete(nextPage);
      console.error(`Failed to load ${assetType} page in chat detail panel:`, error);
    } finally {
      requestInFlightRef.current = false;
      setIsFetchingNext(false);
    }
  }, [assetType, chatRoomId, hasMore, shouldSkip, triggerFetchFiles, triggerFetchMedia]);

  return {
    assets,
    currentPage,
    hasMore,
    isLoadingInitial: activePageOneQuery.isLoading && assets.length === 0,
    isFetchingNext,
    isError: activePageOneQuery.isError,
    loadMore,
  };
}
