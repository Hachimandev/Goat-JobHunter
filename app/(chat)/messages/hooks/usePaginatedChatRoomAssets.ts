'use client';

import { CHAT_DETAIL_ASSET_PAGE_SIZE } from '@/constants/constant';
import {
  useFetchFilesInChatRoomQuery,
  useFetchMediaInChatRoomQuery,
  useLazyFetchFilesInChatRoomQuery,
  useLazyFetchMediaInChatRoomQuery,
} from '@/services/chatRoom/chatRoomApi';
import type { FetchChatRoomAssetsRequest } from '@/services/chatRoom/chatRoomType';
import type { MessageResponse } from '@/types/model';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getPaginatedResult, getPaginatedTotalPages, useLoadMorePaginationState } from './paginationHelpers';

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
  const {
    currentPage,
    hasMore,
    isFetchingNext,
    resetPagination,
    syncHasMoreFromTotalPages,
    startNextPageFetch,
    completeNextPageFetch,
    cancelNextPageFetch,
    finishNextPageFetch,
  } = useLoadMorePaginationState();

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
    resetPagination();
    setOlderAssets([]);
  }, [assetType, chatRoomId, enabled, resetPagination]);

  const liveAssets = useMemo(() => {
    return getPaginatedResult(activePageOneQuery.data);
  }, [activePageOneQuery.data]);

  const assets = useMemo(() => {
    return mergeUniqueAssets([...liveAssets, ...olderAssets]);
  }, [liveAssets, olderAssets]);

  useEffect(() => {
    if (shouldSkip || !activePageOneQuery.data?.data?.meta) {
      return;
    }

    syncHasMoreFromTotalPages(getPaginatedTotalPages(activePageOneQuery.data));
  }, [activePageOneQuery.data, shouldSkip, syncHasMoreFromTotalPages]);

  const loadMore = useCallback(async () => {
    if (shouldSkip || !chatRoomId) {
      return;
    }

    const nextPage = startNextPageFetch({ shouldSkip });
    if (nextPage === null) {
      return;
    }

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

      const nextBatch = getPaginatedResult(response);

      if (nextBatch.length > 0) {
        setOlderAssets((previousAssets) => mergeUniqueAssets([...previousAssets, ...nextBatch]));
      }

      completeNextPageFetch(nextPage, getPaginatedTotalPages(response));
    } catch (error) {
      cancelNextPageFetch(nextPage);
      console.error(`Failed to load ${assetType} page in chat detail panel:`, error);
    } finally {
      finishNextPageFetch();
    }
  }, [
    assetType,
    cancelNextPageFetch,
    chatRoomId,
    completeNextPageFetch,
    finishNextPageFetch,
    shouldSkip,
    startNextPageFetch,
    triggerFetchFiles,
    triggerFetchMedia,
  ]);

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
