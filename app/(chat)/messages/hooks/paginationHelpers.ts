'use client';

import { useCallback, useRef, useState } from 'react';

type PaginatedResponse<TItem> = {
  data?: {
    result?: TItem[];
    meta?: {
      pages?: number;
    };
  };
};

type UseLoadMorePaginationStateOptions = {
  initialPage?: number;
};

type StartNextPageOptions = {
  shouldSkip?: boolean;
  requireHasMore?: boolean;
};

type UseLoadMorePaginationStateResult = {
  currentPage: number;
  hasMore: boolean;
  isFetchingNext: boolean;
  resetPagination: () => void;
  syncHasMoreFromTotalPages: (totalPages: number) => void;
  startNextPageFetch: (options?: StartNextPageOptions) => number | null;
  completeNextPageFetch: (nextPage: number, totalPages: number) => void;
  cancelNextPageFetch: (nextPage: number) => void;
  finishNextPageFetch: () => void;
};

const normalizePageNumber = (page?: number): number => {
  if (!page || Number.isNaN(page) || page < 1) {
    return 1;
  }

  return page;
};

export const getPaginatedResult = <TItem>(response?: PaginatedResponse<TItem>): TItem[] => {
  return response?.data?.result || [];
};

export const getPaginatedTotalPages = <TItem>(response?: PaginatedResponse<TItem>): number => {
  return normalizePageNumber(response?.data?.meta?.pages);
};

export function useLoadMorePaginationState(
  options: UseLoadMorePaginationStateOptions = {},
): UseLoadMorePaginationStateResult {
  const { initialPage = 1 } = options;
  const normalizedInitialPage = normalizePageNumber(initialPage);

  const [currentPage, setCurrentPage] = useState(normalizedInitialPage);
  const [hasMore, setHasMore] = useState(false);
  const [isFetchingNext, setIsFetchingNext] = useState(false);

  const requestedPagesRef = useRef<Set<number>>(new Set([normalizedInitialPage]));
  const requestInFlightRef = useRef(false);
  const currentPageRef = useRef(normalizedInitialPage);

  const resetPagination = useCallback(() => {
    requestedPagesRef.current = new Set([normalizedInitialPage]);
    requestInFlightRef.current = false;
    currentPageRef.current = normalizedInitialPage;

    setCurrentPage(normalizedInitialPage);
    setHasMore(false);
    setIsFetchingNext(false);
  }, [normalizedInitialPage]);

  const syncHasMoreFromTotalPages = useCallback((totalPages: number) => {
    const normalizedTotalPages = normalizePageNumber(totalPages);
    setHasMore(currentPageRef.current < normalizedTotalPages);
  }, []);

  const startNextPageFetch = useCallback(
    (options?: StartNextPageOptions): number | null => {
      const { shouldSkip = false, requireHasMore = true } = options || {};

      if (shouldSkip || requestInFlightRef.current || (requireHasMore && !hasMore)) {
        return null;
      }

      const nextPage = currentPageRef.current + 1;

      if (requestedPagesRef.current.has(nextPage)) {
        return null;
      }

      requestedPagesRef.current.add(nextPage);
      requestInFlightRef.current = true;
      setIsFetchingNext(true);

      return nextPage;
    },
    [hasMore],
  );

  const completeNextPageFetch = useCallback((nextPage: number, totalPages: number) => {
    const normalizedTotalPages = normalizePageNumber(totalPages);

    currentPageRef.current = nextPage;
    setCurrentPage(nextPage);
    setHasMore(nextPage < normalizedTotalPages);
  }, []);

  const cancelNextPageFetch = useCallback((nextPage: number) => {
    requestedPagesRef.current.delete(nextPage);
  }, []);

  const finishNextPageFetch = useCallback(() => {
    requestInFlightRef.current = false;
    setIsFetchingNext(false);
  }, []);

  return {
    currentPage,
    hasMore,
    isFetchingNext,
    resetPagination,
    syncHasMoreFromTotalPages,
    startNextPageFetch,
    completeNextPageFetch,
    cancelNextPageFetch,
    finishNextPageFetch,
  };
}
