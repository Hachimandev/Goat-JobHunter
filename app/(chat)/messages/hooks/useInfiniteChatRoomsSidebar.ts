'use client';

import { CHAT_ROOM_SIDEBAR_PAGE_SIZE } from '@/constants/constant';
import {
  useCountUnreadMessagesByCurrentAccountQuery,
  useFetchChatRoomsQuery,
  useLazyCountUnreadMessagesByCurrentAccountQuery,
  useLazyFetchChatRoomsQuery,
} from '@/services/chatRoom/chatRoomApi';
import type { CountUnreadMessagesResponse, FetchChatRoomsResponse } from '@/services/chatRoom/chatRoomType';
import type { ChatRoom } from '@/types/model';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

type UseInfiniteChatRoomsSidebarOptions = {
  isSignedIn?: boolean;
  accountId?: number | null;
};

type UseInfiniteChatRoomsSidebarResult = {
  chatRooms: ChatRoom[];
  unreadCountsMap: Map<number, number>;
  total: number;
  isLoading: boolean;
  isError: boolean;
  isFetchingNext: boolean;
  hasMore: boolean;
  loadMoreChatRooms: () => Promise<void>;
  refetch: () => Promise<unknown>;
  refetchUnreadMessages: () => Promise<unknown>;
};

const getChatRoomsBatch = (response?: FetchChatRoomsResponse): ChatRoom[] => {
  return response?.data?.result || [];
};

const getTotalPages = (response?: FetchChatRoomsResponse): number => {
  return response?.data?.meta?.pages || 1;
};

const getUnreadCountsMap = (response?: CountUnreadMessagesResponse): Map<number, number> => {
  const unreadMap = new Map<number, number>();

  response?.data?.forEach((item) => {
    unreadMap.set(item.chatRoomId, item.unreadCount);
  });

  return unreadMap;
};

const mergeChatRooms = (liveRooms: ChatRoom[], olderRooms: ChatRoom[]): ChatRoom[] => {
  const mergedRooms = new Map<number, ChatRoom>();

  liveRooms.forEach((room) => {
    mergedRooms.set(room.roomId, room);
  });

  olderRooms.forEach((room) => {
    if (!mergedRooms.has(room.roomId)) {
      mergedRooms.set(room.roomId, room);
    }
  });

  return Array.from(mergedRooms.values());
};

export function useInfiniteChatRoomsSidebar(
  options: UseInfiniteChatRoomsSidebarOptions = {},
): UseInfiniteChatRoomsSidebarResult {
  const { isSignedIn = false, accountId = null } = options;
  const shouldSkip = !isSignedIn;

  const [olderChatRooms, setOlderChatRooms] = useState<ChatRoom[]>([]);
  const [olderUnreadCountsMap, setOlderUnreadCountsMap] = useState<Map<number, number>>(new Map());
  const [hasMore, setHasMore] = useState(false);
  const [isFetchingNext, setIsFetchingNext] = useState(false);

  const requestedPagesRef = useRef<Set<number>>(new Set([1]));
  const requestInFlightRef = useRef(false);
  const currentPageRef = useRef(1);

  const {
    data: pageOneChatRoomsResponse,
    isLoading: isLoadingPageOne,
    isError: isChatRoomsError,
    refetch: refetchPageOneChatRooms,
  } = useFetchChatRoomsQuery(
    {
      page: 1,
      size: CHAT_ROOM_SIDEBAR_PAGE_SIZE,
    },
    {
      skip: shouldSkip,
    },
  );

  const { data: pageOneUnreadCountsResponse, refetch: refetchPageOneUnreadCounts } =
    useCountUnreadMessagesByCurrentAccountQuery(
      {
        page: 1,
        size: CHAT_ROOM_SIDEBAR_PAGE_SIZE,
      },
      {
        skip: shouldSkip,
      },
    );

  const [triggerFetchChatRooms] = useLazyFetchChatRoomsQuery();
  const [triggerFetchUnreadCounts] = useLazyCountUnreadMessagesByCurrentAccountQuery();

  useEffect(() => {
    requestedPagesRef.current = new Set([1]);
    requestInFlightRef.current = false;
    currentPageRef.current = 1;

    setHasMore(false);
    setOlderChatRooms([]);
    setOlderUnreadCountsMap(new Map());
    setIsFetchingNext(false);
  }, [accountId, isSignedIn]);

  const liveChatRooms = useMemo(() => getChatRoomsBatch(pageOneChatRoomsResponse), [pageOneChatRoomsResponse]);
  const liveUnreadCountsMap = useMemo(
    () => getUnreadCountsMap(pageOneUnreadCountsResponse),
    [pageOneUnreadCountsResponse],
  );

  const chatRooms = useMemo(() => mergeChatRooms(liveChatRooms, olderChatRooms), [liveChatRooms, olderChatRooms]);

  const unreadCountsMap = useMemo(() => {
    const mergedMap = new Map<number, number>(olderUnreadCountsMap);

    liveUnreadCountsMap.forEach((count, chatRoomId) => {
      mergedMap.set(chatRoomId, count);
    });

    return mergedMap;
  }, [liveUnreadCountsMap, olderUnreadCountsMap]);

  useEffect(() => {
    if (shouldSkip || !pageOneChatRoomsResponse?.data?.meta) {
      return;
    }

    setHasMore(currentPageRef.current < getTotalPages(pageOneChatRoomsResponse));
  }, [pageOneChatRoomsResponse, shouldSkip]);

  const loadMoreChatRooms = useCallback(async () => {
    if (shouldSkip || !hasMore || requestInFlightRef.current) {
      return;
    }

    const nextPage = currentPageRef.current + 1;

    if (requestedPagesRef.current.has(nextPage)) {
      return;
    }

    requestedPagesRef.current.add(nextPage);
    requestInFlightRef.current = true;
    setIsFetchingNext(true);

    try {
      const nextPageChatRoomsResponse = await triggerFetchChatRooms(
        {
          page: nextPage,
          size: CHAT_ROOM_SIDEBAR_PAGE_SIZE,
        },
        true,
      ).unwrap();

      const nextBatch = getChatRoomsBatch(nextPageChatRoomsResponse);

      if (nextBatch.length > 0) {
        setOlderChatRooms((previousRooms) => {
          const previousRoomIds = new Set(previousRooms.map((room) => room.roomId));
          const uniqueNewRooms = nextBatch.filter((room) => !previousRoomIds.has(room.roomId));
          return [...previousRooms, ...uniqueNewRooms];
        });
      }

      try {
        const nextPageUnreadResponse = await triggerFetchUnreadCounts(
          {
            page: nextPage,
            size: CHAT_ROOM_SIDEBAR_PAGE_SIZE,
          },
          true,
        ).unwrap();

        if (nextPageUnreadResponse?.data && nextPageUnreadResponse.data.length > 0) {
          setOlderUnreadCountsMap((previousMap) => {
            const mergedMap = new Map(previousMap);
            nextPageUnreadResponse?.data?.forEach((item) => {
              mergedMap.set(item.chatRoomId, item.unreadCount);
            });
            return mergedMap;
          });
        }
      } catch (error) {
        console.error('Failed to load unread counts for sidebar page:', error);
      }

      currentPageRef.current = nextPage;
      setHasMore(nextPage < getTotalPages(nextPageChatRoomsResponse));
    } catch (error) {
      requestedPagesRef.current.delete(nextPage);
      console.error('Failed to load next sidebar chat rooms page:', error);
    } finally {
      requestInFlightRef.current = false;
      setIsFetchingNext(false);
    }
  }, [hasMore, shouldSkip, triggerFetchChatRooms, triggerFetchUnreadCounts]);

  const refetch = useCallback(async () => {
    return await refetchPageOneChatRooms();
  }, [refetchPageOneChatRooms]);

  const refetchUnreadMessages = useCallback(async () => {
    return await refetchPageOneUnreadCounts();
  }, [refetchPageOneUnreadCounts]);

  return {
    chatRooms,
    unreadCountsMap,
    total: pageOneChatRoomsResponse?.data?.meta?.total || 0,
    isLoading: isLoadingPageOne && chatRooms.length === 0,
    isError: isChatRoomsError,
    isFetchingNext,
    hasMore,
    loadMoreChatRooms,
    refetch,
    refetchUnreadMessages,
  };
}
