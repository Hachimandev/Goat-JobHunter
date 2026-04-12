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
import { FriendRequest, getFriendUserDisplayName } from '@/services/friendship/friendshipType';
import { Check, UserRound, X } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useMemo } from 'react';

const DEFAULT_AVATAR = '/placeholder.svg';
const DEFAULT_USER_NAME = 'Người dùng';

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
  const summary = incoming ? request.requester : request.recipient;

  return {
    requestId: request.requestId,
    targetId: incoming ? request.requesterId : request.recipientId,
    displayName: getFriendUserDisplayName(summary, DEFAULT_USER_NAME),
    avatar: summary?.avatar || DEFAULT_AVATAR,
  };
};

export default function FriendRequestsInboxPage() {
  const { user, isSignedIn } = useUser();
  const currentUserId = user?.accountId ?? 0;
  const skipReadQuery = !isSignedIn || !user;

  const {
    isLoading: isLoadingFriendships,
    isFetching: isFetchingFriendships,
    isError: isErrorFriendships,
    refetch: refetchFriendships,
  } = useGetMyFriendshipsQuery(undefined, {
    skip: skipReadQuery,
  });

  const {
    isLoading: isLoadingReceived,
    isFetching: isFetchingReceived,
    isError: isErrorReceived,
    refetch: refetchReceived,
  } = useGetMyReceivedFriendRequestsQuery(undefined, {
    skip: skipReadQuery,
  });

  const {
    isLoading: isLoadingSent,
    isFetching: isFetchingSent,
    isError: isErrorSent,
    refetch: refetchSent,
  } = useGetMySentFriendRequestsQuery(undefined, {
    skip: skipReadQuery,
  });

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

  const incomingRequests = useAppSelector((state) =>
    currentUserId > 0 ? selectPendingIncomingRequests(state, currentUserId) : [],
  );
  const outgoingRequests = useAppSelector((state) =>
    currentUserId > 0 ? selectPendingOutgoingRequests(state, currentUserId) : [],
  );
  const friendPairs = useAppSelector((state) => (currentUserId > 0 ? selectFriendPairs(state) : []));

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
        </CardContent>
      </Card>
    </div>
  );
}
