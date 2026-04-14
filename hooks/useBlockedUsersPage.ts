import useFriendActions from '@/hooks/useFriendActions';
import { useUser } from '@/hooks/useUser';
import { selectLastFriendshipRealtimeEventAt } from '@/lib/features/friendshipSlice';
import { useAppSelector } from '@/lib/hooks';
import { useGetMyBlockedUsersQuery } from '@/services/friendship/friendshipApi';
import { FRIENDSHIP_DEFAULT_PAGE, FRIENDSHIP_DEFAULT_SIZE } from '@/services/friendship/friendshipType';
import {
  extractFriendshipPaginationMeta,
  getFriendUserDisplayName,
  normalizeFriendUserSnippetsPayload,
  unwrapFriendshipResponseData,
} from '@/utils/friendshipUtils';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const BLOCKED_USERS_PAGE_SIZE = FRIENDSHIP_DEFAULT_SIZE;

export type BlockedUsersPagination = {
  page: number;
  totalPages: number;
  totalItems: number;
  isFetching: boolean;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  onPageChange: (page: number) => void;
  onNextPage: () => void;
  onPreviousPage: () => void;
};

export type BlockedUserCardViewModel = {
  targetId: number;
  displayName: string;
  avatar: string;
  headline: string | null;
};

type UseBlockedUsersPageResult = {
  user: ReturnType<typeof useUser>['user'];
  isSignedIn: boolean;
  isLoadingBlockedUsers: boolean;
  isFetchBlockedUsersError: boolean;
  isMutating: boolean;
  blockedUserCards: BlockedUserCardViewModel[];
  pagination: BlockedUsersPagination;
  handleRetry: () => void;
  handleUnblockUser: (targetUserId: number) => Promise<boolean>;
};

const clampPage = (page: number, totalPages: number): number => {
  if (!Number.isFinite(page)) {
    return 1;
  }

  const normalizedTotal = Math.max(totalPages, 1);
  const normalizedPage = Math.trunc(page);

  return Math.min(Math.max(normalizedPage, 1), normalizedTotal);
};

export default function useBlockedUsersPage(): UseBlockedUsersPageResult {
  const { user, isSignedIn } = useUser();
  const skipReadQuery = !isSignedIn || !user;
  const [blockedPage, setBlockedPage] = useState(FRIENDSHIP_DEFAULT_PAGE);

  const blockedQueryParams = useMemo(
    () => ({
      page: blockedPage,
      size: BLOCKED_USERS_PAGE_SIZE,
      sort: ['blockedAt,desc'],
    }),
    [blockedPage],
  );

  const {
    data: blockedResponse,
    isLoading: isLoadingBlocked,
    isFetching: isFetchingBlocked,
    isError: isErrorBlocked,
    refetch: refetchBlocked,
  } = useGetMyBlockedUsersQuery(blockedQueryParams, {
    skip: skipReadQuery,
  });

  const blockedMeta = useMemo(() => extractFriendshipPaginationMeta(blockedResponse), [blockedResponse]);

  const blockedUsers = useMemo(() => {
    return normalizeFriendUserSnippetsPayload(unwrapFriendshipResponseData(blockedResponse));
  }, [blockedResponse]);

  const blockedUserCards = useMemo<BlockedUserCardViewModel[]>(
    () =>
      blockedUsers.map((blockedUser) => ({
        targetId: blockedUser.accountId,
        displayName: getFriendUserDisplayName(blockedUser, 'Người dùng'),
        avatar: blockedUser.avatar || '/placeholder.svg',
        headline: blockedUser.headline ?? null,
      })),
    [blockedUsers],
  );

  const { handleUnblockUser, isMutating } = useFriendActions();

  const handleRetry = useCallback(() => {
    void refetchBlocked();
  }, [refetchBlocked]);

  const lastRealtimeEventAt = useAppSelector(selectLastFriendshipRealtimeEventAt);
  const lastHandledRealtimeEventAtRef = useRef<string | null>(null);

  useEffect(() => {
    if (skipReadQuery || !lastRealtimeEventAt) {
      return;
    }

    if (lastHandledRealtimeEventAtRef.current === lastRealtimeEventAt) {
      return;
    }

    lastHandledRealtimeEventAtRef.current = lastRealtimeEventAt;

    if (blockedPage !== FRIENDSHIP_DEFAULT_PAGE) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setBlockedPage(FRIENDSHIP_DEFAULT_PAGE);
      return;
    }

    handleRetry();
  }, [blockedPage, handleRetry, lastRealtimeEventAt, skipReadQuery]);

  const totalBlockedPages = Math.max(blockedMeta.pages, 1);

  const pagination = useMemo<BlockedUsersPagination>(
    () => ({
      page: clampPage(blockedMeta.page, totalBlockedPages),
      totalPages: totalBlockedPages,
      totalItems: blockedMeta.total,
      isFetching: isFetchingBlocked,
      hasNextPage: blockedMeta.page < totalBlockedPages,
      hasPreviousPage: blockedMeta.page > 1,
      onPageChange: (page) => {
        if (isFetchingBlocked) {
          return;
        }

        const nextPage = clampPage(page, totalBlockedPages);
        setBlockedPage(nextPage - 1);
      },
      onNextPage: () => {
        if (isFetchingBlocked || blockedMeta.page >= totalBlockedPages) {
          return;
        }

        setBlockedPage((prev) => Math.min(prev + 1, Math.max(totalBlockedPages - 1, FRIENDSHIP_DEFAULT_PAGE)));
      },
      onPreviousPage: () => {
        if (isFetchingBlocked || blockedMeta.page <= 1) {
          return;
        }

        setBlockedPage((prev) => Math.max(prev - 1, FRIENDSHIP_DEFAULT_PAGE));
      },
    }),
    [blockedMeta.page, blockedMeta.total, isFetchingBlocked, totalBlockedPages],
  );

  return {
    user,
    isSignedIn,
    isLoadingBlockedUsers: isLoadingBlocked,
    isFetchBlockedUsersError: isErrorBlocked,
    isMutating,
    blockedUserCards,
    pagination,
    handleRetry,
    handleUnblockUser,
  };
}
