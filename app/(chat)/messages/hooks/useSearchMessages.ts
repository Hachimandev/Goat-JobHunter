import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDebounce } from '@/components/ui/MultipleSelector';
import { useLazySearchMessagesInChatRoomQuery } from '@/services/chatRoom/chatRoomApi';

interface UseSearchMessagesOptions {
  chatRoomId: number;
  minLength?: number;
  debounceMs?: number;
  pageSize?: number;
}

const isAbortLikeError = (error: unknown): boolean => {
  if (!error || typeof error !== 'object') {
    return false;
  }

  const candidate = error as { name?: string; error?: string; status?: string };
  return candidate.name === 'AbortError' || candidate.error === 'AbortError';
};

export function useSearchMessages(options: UseSearchMessagesOptions) {
  const { chatRoomId, minLength = 2, debounceMs = 450, pageSize = 50 } = options;
  const [searchTerm, setSearchTerm] = useState('');

  const debouncedSearchTerm = useDebounce(searchTerm, debounceMs);
  const normalizedSearchTerm = useMemo(() => debouncedSearchTerm.trim(), [debouncedSearchTerm]);
  const shouldShowResults = normalizedSearchTerm.length >= minLength;

  const [trigger, queryState] = useLazySearchMessagesInChatRoomQuery();
  const inFlightRequestRef = useRef<ReturnType<typeof trigger> | null>(null);

  const abortInFlight = useCallback(() => {
    if (!inFlightRequestRef.current) {
      return;
    }

    inFlightRequestRef.current.abort();
    inFlightRequestRef.current = null;
  }, []);

  useEffect(() => {
    return () => {
      abortInFlight();
    };
  }, [abortInFlight]);

  useEffect(() => {
    if (!chatRoomId || Number.isNaN(chatRoomId) || !shouldShowResults) {
      abortInFlight();
      return;
    }

    abortInFlight();

    const request = trigger(
      {
        chatRoomId,
        searchTerm: normalizedSearchTerm,
        page: 1,
        size: pageSize,
      },
      true,
    );

    inFlightRequestRef.current = request;

    return () => {
      if (inFlightRequestRef.current === request) {
        request.abort();
        inFlightRequestRef.current = null;
      }
    };
  }, [abortInFlight, chatRoomId, normalizedSearchTerm, pageSize, shouldShowResults, trigger]);

  const isError = shouldShowResults && queryState.isError && !isAbortLikeError(queryState.error);
  const isLoading = shouldShowResults && (queryState.isLoading || queryState.isFetching);
  const results = useMemo(() => {
    if (!shouldShowResults) {
      return [];
    }

    return queryState.data?.data?.result || [];
  }, [queryState.data, shouldShowResults]);
  const isEmpty = shouldShowResults && !isLoading && !isError && results.length === 0;
  const clearSearch = useCallback(() => {
    abortInFlight();
    setSearchTerm('');
  }, [abortInFlight]);

  return {
    searchTerm,
    setSearchTerm,
    debouncedSearchTerm,
    normalizedSearchTerm,
    results,
    isLoading,
    isError,
    error: queryState.error,
    isEmpty,
    shouldShowResults,
    minLength,
    clearSearch,
  };
}
