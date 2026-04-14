import useFriendActions from '@/hooks/useFriendActions';
import { useUser } from '@/hooks/useUser';
import {
  PairFriendshipState,
  selectFriendPairs,
  selectLastFriendshipRealtimeEventAt,
  selectPendingIncomingRequests,
  selectPendingOutgoingRequests,
} from '@/lib/features/friendshipSlice';
import { useAppSelector } from '@/lib/hooks';
import {
  useGetMyFriendshipsQuery,
  useGetMyReceivedFriendRequestsQuery,
  useGetMySentFriendRequestsQuery,
} from '@/services/friendship/friendshipApi';
import { FRIENDSHIP_DEFAULT_PAGE, FriendRequest, FriendRequestDirection } from '@/services/friendship/friendshipType';
import {
  extractFriendshipPaginationMeta,
  getFriendUserDisplayName,
  normalizeFriendRequestsPayload,
  normalizePairSnapshotsPayload,
  unwrapFriendshipResponseData,
} from '@/utils/friendshipUtils';
import { FriendRequestCardViewModel, toFriendRequestCardViewModel } from '@/utils/friendshipRequestViewModel';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const FRIENDSHIP_PAGE_SIZE = 10;
const FRIENDS_SORT = ['friendsSince,desc', 'relationshipId,desc'] as const;
const FRIEND_REQUEST_SORT = ['requestedAt,desc', 'requestId,desc'] as const;
const EMPTY_REQUESTS: FriendRequest[] = [];
const EMPTY_PAIRS: PairFriendshipState[] = [];

export type RequestCardViewModel = FriendRequestCardViewModel;

export type FriendCardViewModel = {
  targetId: number;
  displayName: string;
  avatar: string;
  isConnected: boolean;
};

export type FriendsInboxPagination = {
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

type UseFriendsInboxPageResult = {
  user: ReturnType<typeof useUser>['user'];
  isSignedIn: boolean;
  isLoadingRequests: boolean;
  isLoadRequestsError: boolean;
  isMutating: boolean;
  friendCards: FriendCardViewModel[];
  incomingRequestCards: RequestCardViewModel[];
  outgoingRequestCards: RequestCardViewModel[];
  friendsPagination: FriendsInboxPagination;
  receivedPagination: FriendsInboxPagination;
  sentPagination: FriendsInboxPagination;
  handleRetry: () => void;
  handleAcceptFriendRequest: (requestId: number) => Promise<boolean>;
  handleRejectFriendRequest: (requestId: number) => Promise<boolean>;
  handleCancelFriendRequest: (requestId: number) => Promise<boolean>;
};

const clampPage = (page: number, totalPages: number): number => {
  if (!Number.isFinite(page)) {
    return 1;
  }

  const normalizedTotal = Math.max(totalPages, 1);
  const normalizedPage = Math.trunc(page);

  return Math.min(Math.max(normalizedPage, 1), normalizedTotal);
};

export default function useFriendsInboxPage(): UseFriendsInboxPageResult {
  const { user, isSignedIn } = useUser();
  const currentUserId = user?.accountId ?? 0;
  const skipReadQuery = !isSignedIn || !user;

  const [friendsPage, setFriendsPage] = useState(FRIENDSHIP_DEFAULT_PAGE);
  const [receivedPage, setReceivedPage] = useState(FRIENDSHIP_DEFAULT_PAGE);
  const [sentPage, setSentPage] = useState(FRIENDSHIP_DEFAULT_PAGE);

  const friendshipsQueryParams = useMemo(
    () => ({
      page: friendsPage,
      size: FRIENDSHIP_PAGE_SIZE,
      sort: FRIENDS_SORT,
    }),
    [friendsPage],
  );

  const receivedQueryParams = useMemo(
    () => ({
      page: receivedPage,
      size: FRIENDSHIP_PAGE_SIZE,
      sort: FRIEND_REQUEST_SORT,
    }),
    [receivedPage],
  );

  const sentQueryParams = useMemo(
    () => ({
      page: sentPage,
      size: FRIENDSHIP_PAGE_SIZE,
      sort: FRIEND_REQUEST_SORT,
    }),
    [sentPage],
  );

  const {
    data: friendshipsResponse,
    isLoading: isLoadingFriendships,
    isFetching: isFetchingFriendships,
    isError: isErrorFriendships,
    refetch: refetchFriendships,
  } = useGetMyFriendshipsQuery(friendshipsQueryParams, {
    skip: skipReadQuery,
  });

  const {
    data: receivedResponse,
    isLoading: isLoadingReceived,
    isFetching: isFetchingReceived,
    isError: isErrorReceived,
    refetch: refetchReceived,
  } = useGetMyReceivedFriendRequestsQuery(receivedQueryParams, {
    skip: skipReadQuery,
  });

  const {
    data: sentResponse,
    isLoading: isLoadingSent,
    isFetching: isFetchingSent,
    isError: isErrorSent,
    refetch: refetchSent,
  } = useGetMySentFriendRequestsQuery(sentQueryParams, {
    skip: skipReadQuery,
  });

  const lastRealtimeEventAt = useAppSelector(selectLastFriendshipRealtimeEventAt);
  const lastHandledRealtimeEventAtRef = useRef<string | null>(null);

  const friendshipsMeta = useMemo(() => extractFriendshipPaginationMeta(friendshipsResponse), [friendshipsResponse]);

  const receivedMeta = useMemo(() => extractFriendshipPaginationMeta(receivedResponse), [receivedResponse]);

  const sentMeta = useMemo(() => extractFriendshipPaginationMeta(sentResponse), [sentResponse]);

  const friendPageTargetIds = useMemo(() => {
    const snapshots = normalizePairSnapshotsPayload(unwrapFriendshipResponseData(friendshipsResponse), {
      currentUserId,
    });

    return new Set(snapshots.map((snapshot) => snapshot.targetAccountId));
  }, [friendshipsResponse, currentUserId]);

  const incomingPageRequestIds = useMemo(() => {
    const requests = normalizeFriendRequestsPayload(unwrapFriendshipResponseData(receivedResponse), {
      currentUserId,
      directionHint: FriendRequestDirection.RECEIVED,
    });

    return new Set(requests.map((request) => request.requestId));
  }, [receivedResponse, currentUserId]);

  const outgoingPageRequestIds = useMemo(() => {
    const requests = normalizeFriendRequestsPayload(unwrapFriendshipResponseData(sentResponse), {
      currentUserId,
      directionHint: FriendRequestDirection.SENT,
    });

    return new Set(requests.map((request) => request.requestId));
  }, [sentResponse, currentUserId]);

  const allIncomingRequests = useAppSelector((state) =>
    currentUserId > 0 ? selectPendingIncomingRequests(state, currentUserId) : EMPTY_REQUESTS,
  );
  const allOutgoingRequests = useAppSelector((state) =>
    currentUserId > 0 ? selectPendingOutgoingRequests(state, currentUserId) : EMPTY_REQUESTS,
  );
  const allFriendPairs = useAppSelector((state) => (currentUserId > 0 ? selectFriendPairs(state) : EMPTY_PAIRS));

  const incomingRequests = useMemo(
    () => allIncomingRequests.filter((request) => incomingPageRequestIds.has(request.requestId)),
    [allIncomingRequests, incomingPageRequestIds],
  );

  const outgoingRequests = useMemo(
    () => allOutgoingRequests.filter((request) => outgoingPageRequestIds.has(request.requestId)),
    [allOutgoingRequests, outgoingPageRequestIds],
  );

  const friendPairs = useMemo(
    () => allFriendPairs.filter((pair) => friendPageTargetIds.has(pair.targetAccountId)),
    [allFriendPairs, friendPageTargetIds],
  );

  const { handleAcceptFriendRequest, handleRejectFriendRequest, handleCancelFriendRequest, isMutating } =
    useFriendActions();

  const friendCards = useMemo<FriendCardViewModel[]>(
    () =>
      friendPairs.map((friendPair) => ({
        targetId: friendPair.targetAccountId,
        displayName: getFriendUserDisplayName(friendPair.targetUser, 'Người dùng'),
        avatar: friendPair.targetUser?.avatar || '/placeholder.svg',
        isConnected: Boolean(friendPair.friendsSince),
      })),
    [friendPairs],
  );

  const incomingRequestCards = useMemo<RequestCardViewModel[]>(
    () => incomingRequests.map((request) => toFriendRequestCardViewModel(request, true)),
    [incomingRequests],
  );

  const outgoingRequestCards = useMemo<RequestCardViewModel[]>(
    () => outgoingRequests.map((request) => toFriendRequestCardViewModel(request, false)),
    [outgoingRequests],
  );

  const handleRetry = useCallback(() => {
    refetchFriendships();
    refetchReceived();
    refetchSent();
  }, [refetchFriendships, refetchReceived, refetchSent]);

  useEffect(() => {
    if (skipReadQuery || !lastRealtimeEventAt) {
      return;
    }

    if (lastHandledRealtimeEventAtRef.current === lastRealtimeEventAt) {
      return;
    }

    lastHandledRealtimeEventAtRef.current = lastRealtimeEventAt;

    const shouldResetToFirstPage =
      friendsPage !== FRIENDSHIP_DEFAULT_PAGE ||
      receivedPage !== FRIENDSHIP_DEFAULT_PAGE ||
      sentPage !== FRIENDSHIP_DEFAULT_PAGE;

    if (shouldResetToFirstPage) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFriendsPage(FRIENDSHIP_DEFAULT_PAGE);
      setReceivedPage(FRIENDSHIP_DEFAULT_PAGE);
      setSentPage(FRIENDSHIP_DEFAULT_PAGE);
      return;
    }

    handleRetry();
  }, [friendsPage, handleRetry, lastRealtimeEventAt, receivedPage, sentPage, skipReadQuery]);

  const totalFriendPages = Math.max(friendshipsMeta.pages, 1);
  const totalReceivedPages = Math.max(receivedMeta.pages, 1);
  const totalSentPages = Math.max(sentMeta.pages, 1);

  const friendsPagination = useMemo<FriendsInboxPagination>(
    () => ({
      page: clampPage(friendshipsMeta.page, totalFriendPages),
      totalPages: totalFriendPages,
      totalItems: friendshipsMeta.total,
      isFetching: isFetchingFriendships,
      hasNextPage: friendshipsMeta.page < totalFriendPages,
      hasPreviousPage: friendshipsMeta.page > 1,
      onPageChange: (page) => {
        if (isFetchingFriendships) {
          return;
        }

        const nextPage = clampPage(page, totalFriendPages);
        setFriendsPage(nextPage - 1);
      },
      onNextPage: () => {
        if (isFetchingFriendships || friendshipsMeta.page >= totalFriendPages) {
          return;
        }

        setFriendsPage((prev) => Math.min(prev + 1, Math.max(totalFriendPages - 1, FRIENDSHIP_DEFAULT_PAGE)));
      },
      onPreviousPage: () => {
        if (isFetchingFriendships || friendshipsMeta.page <= 1) {
          return;
        }

        setFriendsPage((prev) => Math.max(prev - 1, FRIENDSHIP_DEFAULT_PAGE));
      },
    }),
    [friendshipsMeta.page, friendshipsMeta.total, isFetchingFriendships, totalFriendPages],
  );

  const receivedPagination = useMemo<FriendsInboxPagination>(
    () => ({
      page: clampPage(receivedMeta.page, totalReceivedPages),
      totalPages: totalReceivedPages,
      totalItems: receivedMeta.total,
      isFetching: isFetchingReceived,
      hasNextPage: receivedMeta.page < totalReceivedPages,
      hasPreviousPage: receivedMeta.page > 1,
      onPageChange: (page) => {
        if (isFetchingReceived) {
          return;
        }

        const nextPage = clampPage(page, totalReceivedPages);
        setReceivedPage(nextPage - 1);
      },
      onNextPage: () => {
        if (isFetchingReceived || receivedMeta.page >= totalReceivedPages) {
          return;
        }

        setReceivedPage((prev) => Math.min(prev + 1, Math.max(totalReceivedPages - 1, FRIENDSHIP_DEFAULT_PAGE)));
      },
      onPreviousPage: () => {
        if (isFetchingReceived || receivedMeta.page <= 1) {
          return;
        }

        setReceivedPage((prev) => Math.max(prev - 1, FRIENDSHIP_DEFAULT_PAGE));
      },
    }),
    [isFetchingReceived, receivedMeta.page, receivedMeta.total, totalReceivedPages],
  );

  const sentPagination = useMemo<FriendsInboxPagination>(
    () => ({
      page: clampPage(sentMeta.page, totalSentPages),
      totalPages: totalSentPages,
      totalItems: sentMeta.total,
      isFetching: isFetchingSent,
      hasNextPage: sentMeta.page < totalSentPages,
      hasPreviousPage: sentMeta.page > 1,
      onPageChange: (page) => {
        if (isFetchingSent) {
          return;
        }

        const nextPage = clampPage(page, totalSentPages);
        setSentPage(nextPage - 1);
      },
      onNextPage: () => {
        if (isFetchingSent || sentMeta.page >= totalSentPages) {
          return;
        }

        setSentPage((prev) => Math.min(prev + 1, Math.max(totalSentPages - 1, FRIENDSHIP_DEFAULT_PAGE)));
      },
      onPreviousPage: () => {
        if (isFetchingSent || sentMeta.page <= 1) {
          return;
        }

        setSentPage((prev) => Math.max(prev - 1, FRIENDSHIP_DEFAULT_PAGE));
      },
    }),
    [isFetchingSent, sentMeta.page, sentMeta.total, totalSentPages],
  );

  const isLoadingRequests = useMemo(
    () => isLoadingFriendships || isLoadingReceived || isLoadingSent,
    [isLoadingFriendships, isLoadingReceived, isLoadingSent],
  );

  const isLoadRequestsError = useMemo(
    () => isErrorFriendships || isErrorReceived || isErrorSent,
    [isErrorFriendships, isErrorReceived, isErrorSent],
  );

  return {
    user,
    isSignedIn,
    isLoadingRequests,
    isLoadRequestsError,
    isMutating,
    friendCards,
    incomingRequestCards,
    outgoingRequestCards,
    friendsPagination,
    receivedPagination,
    sentPagination,
    handleRetry,
    handleAcceptFriendRequest,
    handleRejectFriendRequest,
    handleCancelFriendRequest,
  };
}
