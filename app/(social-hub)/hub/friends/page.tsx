'use client';

import ErrorMessage from '@/components/common/ErrorMessage';
import LoaderSpin from '@/components/common/LoaderSpin';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import useFriendActions from '@/hooks/useFriendActions';
import { useUser } from '@/hooks/useUser';
import {
  selectFriendPairs,
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
import { Check, UserRound, X } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useMemo, useState } from 'react';

const DEFAULT_AVATAR = '/placeholder.svg';
const DEFAULT_USER_NAME = 'Người dùng';
const FRIENDSHIP_PAGE_SIZE = 10;
const FRIENDS_SORT = ['friendsSince,desc', 'relationshipId,desc'] as const;
const FRIEND_REQUEST_SORT = ['requestedAt,desc', 'requestId,desc'] as const;

type RequestCardViewModel = {
  requestId: number;
  targetId: number;
  displayName: string;
  avatar: string;
};

type FriendCardViewModel = {
  targetId: number;
  displayName: string;
  avatar: string;
  isConnected: boolean;
};

const toRequestCardViewModel = (request: FriendRequest, incoming: boolean): RequestCardViewModel => {
  const summary = request.counterpart ?? (incoming ? request.sender : request.receiver);
  const fallbackTargetId = incoming ? request.senderId : request.receiverId;

  return {
    requestId: request.requestId,
    targetId: summary?.accountId ?? fallbackTargetId,
    displayName: getFriendUserDisplayName(summary, DEFAULT_USER_NAME),
    avatar: summary?.avatar || DEFAULT_AVATAR,
  };
};

export default function FriendRequestsInboxPage() {
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

  const friendshipsMeta = useMemo(
    () =>
      extractFriendshipPaginationMeta(friendshipsResponse, {
        page: friendsPage + 1,
        pageSize: FRIENDSHIP_PAGE_SIZE,
      }),
    [friendshipsResponse, friendsPage],
  );

  const receivedMeta = useMemo(
    () =>
      extractFriendshipPaginationMeta(receivedResponse, {
        page: receivedPage + 1,
        pageSize: FRIENDSHIP_PAGE_SIZE,
      }),
    [receivedResponse, receivedPage],
  );

  const sentMeta = useMemo(
    () =>
      extractFriendshipPaginationMeta(sentResponse, {
        page: sentPage + 1,
        pageSize: FRIENDSHIP_PAGE_SIZE,
      }),
    [sentResponse, sentPage],
  );

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

  const isLoadingRequests = useMemo(
    () =>
      isLoadingFriendships ||
      isFetchingFriendships ||
      isLoadingReceived ||
      isFetchingReceived ||
      isLoadingSent ||
      isFetchingSent,
    [isFetchingFriendships, isFetchingReceived, isFetchingSent, isLoadingFriendships, isLoadingReceived, isLoadingSent],
  );

  const isLoadRequestsError = useMemo(
    () => isErrorFriendships || isErrorReceived || isErrorSent,
    [isErrorFriendships, isErrorReceived, isErrorSent],
  );

  const incomingRequests = useAppSelector((state) => {
    if (currentUserId <= 0) {
      return [];
    }

    const requests = selectPendingIncomingRequests(state, currentUserId);
    return requests.filter((request) => incomingPageRequestIds.has(request.requestId));
  });

  const outgoingRequests = useAppSelector((state) => {
    if (currentUserId <= 0) {
      return [];
    }

    const requests = selectPendingOutgoingRequests(state, currentUserId);
    return requests.filter((request) => outgoingPageRequestIds.has(request.requestId));
  });

  const friendPairs = useAppSelector((state) => {
    if (currentUserId <= 0) {
      return [];
    }

    const pairs = selectFriendPairs(state);
    return pairs.filter((pair) => friendPageTargetIds.has(pair.targetAccountId));
  });

  const { handleAcceptFriendRequest, handleRejectFriendRequest, handleCancelFriendRequest, isMutating } =
    useFriendActions();

  const friendCards = useMemo<FriendCardViewModel[]>(
    () =>
      friendPairs.map((friendPair) => ({
        targetId: friendPair.targetAccountId,
        displayName: getFriendUserDisplayName(friendPair.targetUser, DEFAULT_USER_NAME),
        avatar: friendPair.targetUser?.avatar || DEFAULT_AVATAR,
        isConnected: Boolean(friendPair.friendsSince),
      })),
    [friendPairs],
  );

  const incomingRequestCards = useMemo<RequestCardViewModel[]>(
    () => incomingRequests.map((request) => toRequestCardViewModel(request, true)),
    [incomingRequests],
  );

  const outgoingRequestCards = useMemo<RequestCardViewModel[]>(
    () => outgoingRequests.map((request) => toRequestCardViewModel(request, false)),
    [outgoingRequests],
  );

  const handleRetry = useCallback(() => {
    refetchFriendships();
    refetchReceived();
    refetchSent();
  }, [refetchFriendships, refetchReceived, refetchSent]);

  const totalFriendPages = Math.max(friendshipsMeta.pages, 1);
  const totalReceivedPages = Math.max(receivedMeta.pages, 1);
  const totalSentPages = Math.max(sentMeta.pages, 1);

  if (!isSignedIn || !user) {
    return <ErrorMessage message="Vui lòng đăng nhập để xem lời mời kết bạn." />;
  }

  if (isLoadingRequests) {
    return <LoaderSpin />;
  }

  if (isLoadRequestsError) {
    return <ErrorMessage message="Không thể tải dữ liệu bạn bè." onRetry={handleRetry} />;
  }

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xl font-semibold">Bạn bè</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {friendCards.length === 0 && <p className="text-sm text-muted-foreground">Bạn chưa có bạn bè nào.</p>}

          {friendCards.map((friendCard) => {
            return (
              <div key={friendCard.targetId} className="flex items-center justify-between gap-3 rounded-xl border p-3">
                <Link href={`/hub/users/${friendCard.targetId}`} className="flex items-center gap-3 min-w-0">
                  <Avatar className="h-12 w-12 border">
                    <AvatarImage src={friendCard.avatar} alt={friendCard.displayName} />
                    <AvatarFallback>
                      <UserRound className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>

                  <div className="min-w-0">
                    <p className="font-medium truncate">{friendCard.displayName}</p>
                    <p className="text-sm text-muted-foreground truncate">
                      {friendCard.isConnected ? 'Đã trở thành bạn bè' : 'Đang trong danh sách bạn bè'}
                    </p>
                  </div>
                </Link>

                <Badge variant="secondary" className="rounded-xl">
                  Bạn bè
                </Badge>
              </div>
            );
          })}

          <div className="flex items-center justify-between border-t pt-3">
            <p className="text-xs text-muted-foreground">
              Trang {friendshipsMeta.page} / {totalFriendPages} - {friendshipsMeta.total} kết quả
            </p>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setFriendsPage(Math.max(friendshipsMeta.page - 2, FRIENDSHIP_DEFAULT_PAGE))}
                disabled={friendshipsMeta.page <= 1 || isFetchingFriendships}
              >
                Trước
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  setFriendsPage(
                    Math.min(friendshipsMeta.page, Math.max(totalFriendPages - 1, FRIENDSHIP_DEFAULT_PAGE)),
                  )
                }
                disabled={friendshipsMeta.page >= totalFriendPages || isFetchingFriendships}
              >
                Sau
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xl font-semibold">Lời mời đã nhận</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {incomingRequestCards.length === 0 && (
            <p className="text-sm text-muted-foreground">Bạn chưa có lời mời kết bạn nào.</p>
          )}

          {incomingRequestCards.map((requestCard) => {
            return (
              <div
                key={requestCard.requestId}
                className="flex items-center justify-between gap-3 rounded-xl border p-3"
              >
                <Link href={`/hub/users/${requestCard.targetId}`} className="flex items-center gap-3 min-w-0">
                  <Avatar className="h-12 w-12 border">
                    <AvatarImage src={requestCard.avatar} alt={requestCard.displayName} />
                    <AvatarFallback>
                      <UserRound className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>

                  <div className="min-w-0">
                    <p className="font-medium truncate">{requestCard.displayName}</p>
                    <p className="text-sm text-muted-foreground truncate">Lời mời đang chờ phản hồi</p>
                  </div>
                </Link>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    className="rounded-xl"
                    onClick={() => handleAcceptFriendRequest(requestCard.requestId)}
                    disabled={isMutating}
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Chấp nhận
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-xl"
                    onClick={() => handleRejectFriendRequest(requestCard.requestId)}
                    disabled={isMutating}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Từ chối
                  </Button>
                </div>
              </div>
            );
          })}

          <div className="flex items-center justify-between border-t pt-3">
            <p className="text-xs text-muted-foreground">
              Trang {receivedMeta.page} / {totalReceivedPages} - {receivedMeta.total} kết quả
            </p>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setReceivedPage(Math.max(receivedMeta.page - 2, FRIENDSHIP_DEFAULT_PAGE))}
                disabled={receivedMeta.page <= 1 || isFetchingReceived}
              >
                Trước
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  setReceivedPage(
                    Math.min(receivedMeta.page, Math.max(totalReceivedPages - 1, FRIENDSHIP_DEFAULT_PAGE)),
                  )
                }
                disabled={receivedMeta.page >= totalReceivedPages || isFetchingReceived}
              >
                Sau
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xl font-semibold">Lời mời đã gửi</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {outgoingRequestCards.length === 0 && (
            <p className="text-sm text-muted-foreground">Bạn chưa gửi lời mời kết bạn nào.</p>
          )}

          {outgoingRequestCards.map((requestCard) => {
            return (
              <div
                key={requestCard.requestId}
                className="flex items-center justify-between gap-3 rounded-xl border p-3"
              >
                <Link href={`/hub/users/${requestCard.targetId}`} className="flex items-center gap-3 min-w-0">
                  <Avatar className="h-12 w-12 border">
                    <AvatarImage src={requestCard.avatar} alt={requestCard.displayName} />
                    <AvatarFallback>
                      <UserRound className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>

                  <div className="min-w-0">
                    <p className="font-medium truncate">{requestCard.displayName}</p>
                    <p className="text-sm text-muted-foreground truncate">Đang chờ người kia phản hồi</p>
                  </div>
                </Link>

                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="rounded-xl hidden sm:inline-flex">
                    Pending
                  </Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-xl"
                    onClick={() => handleCancelFriendRequest(requestCard.requestId)}
                    disabled={isMutating}
                  >
                    Hủy lời mời
                  </Button>
                </div>
              </div>
            );
          })}

          <div className="flex items-center justify-between border-t pt-3">
            <p className="text-xs text-muted-foreground">
              Trang {sentMeta.page} / {totalSentPages} - {sentMeta.total} kết quả
            </p>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setSentPage(Math.max(sentMeta.page - 2, FRIENDSHIP_DEFAULT_PAGE))}
                disabled={sentMeta.page <= 1 || isFetchingSent}
              >
                Trước
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  setSentPage(Math.min(sentMeta.page, Math.max(totalSentPages - 1, FRIENDSHIP_DEFAULT_PAGE)))
                }
                disabled={sentMeta.page >= totalSentPages || isFetchingSent}
              >
                Sau
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
