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
import { FriendRequest } from '@/services/friendship/friendshipType';
import { Check, UserRound, X } from 'lucide-react';
import Link from 'next/link';

const formatRequesterName = (request: FriendRequest, isIncoming: boolean): string => {
  if (isIncoming) {
    return request.requester?.fullName || request.requester?.username || `Người dùng #${request.requesterId}`;
  }

  return request.recipient?.fullName || request.recipient?.username || `Người dùng #${request.recipientId}`;
};

const formatRequesterAvatar = (request: FriendRequest, isIncoming: boolean): string => {
  if (isIncoming) {
    return request.requester?.avatar || '/placeholder.svg';
  }

  return request.recipient?.avatar || '/placeholder.svg';
};

const formatTargetId = (request: FriendRequest, isIncoming: boolean): number => {
  return isIncoming ? request.requesterId : request.recipientId;
};

const formatFriendName = (targetAccountId: number, fullName?: string, username?: string): string => {
  return fullName || username || `Người dùng #${targetAccountId}`;
};

export default function FriendRequestsInboxPage() {
  const { user, isSignedIn } = useUser();
  const currentUserId = user?.accountId ?? 0;
  const skipReadQuery = !isSignedIn || !user;

  const friendshipsQuery = useGetMyFriendshipsQuery(undefined, {
    skip: skipReadQuery,
  });
  const receivedQuery = useGetMyReceivedFriendRequestsQuery(undefined, {
    skip: skipReadQuery,
  });
  const sentQuery = useGetMySentFriendRequestsQuery(undefined, {
    skip: skipReadQuery,
  });

  const isLoadingRequests =
    friendshipsQuery.isLoading ||
    friendshipsQuery.isFetching ||
    receivedQuery.isLoading ||
    receivedQuery.isFetching ||
    sentQuery.isLoading ||
    sentQuery.isFetching;

  const isLoadRequestsError = friendshipsQuery.isError || receivedQuery.isError || sentQuery.isError;

  const incomingRequests = useAppSelector((state) =>
    currentUserId > 0 ? selectPendingIncomingRequests(state, currentUserId) : [],
  );
  const outgoingRequests = useAppSelector((state) =>
    currentUserId > 0 ? selectPendingOutgoingRequests(state, currentUserId) : [],
  );
  const friendPairs = useAppSelector((state) => (currentUserId > 0 ? selectFriendPairs(state) : []));

  const { handleAcceptFriendRequest, handleRejectFriendRequest, handleCancelFriendRequest, isMutating } =
    useFriendActions();

  const handleRetry = () => {
    friendshipsQuery.refetch();
    receivedQuery.refetch();
    sentQuery.refetch();
  };

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
          {friendPairs.length === 0 && <p className="text-sm text-muted-foreground">Bạn chưa có bạn bè nào.</p>}

          {friendPairs.map((friendPair) => {
            const displayName = formatFriendName(
              friendPair.targetAccountId,
              friendPair.targetUser?.fullName,
              friendPair.targetUser?.username,
            );

            return (
              <div
                key={friendPair.targetAccountId}
                className="flex items-center justify-between gap-3 rounded-xl border p-3"
              >
                <Link href={`/hub/users/${friendPair.targetAccountId}`} className="flex items-center gap-3 min-w-0">
                  <Avatar className="h-12 w-12 border">
                    <AvatarImage src={friendPair.targetUser?.avatar || '/placeholder.svg'} alt={displayName} />
                    <AvatarFallback>
                      <UserRound className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>

                  <div className="min-w-0">
                    <p className="font-medium truncate">{displayName}</p>
                    <p className="text-sm text-muted-foreground truncate">
                      {friendPair.friendsSince ? 'Đã trở thành bạn bè' : 'Đang trong danh sách bạn bè'}
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
          {incomingRequests.length === 0 && (
            <p className="text-sm text-muted-foreground">Bạn chưa có lời mời kết bạn nào.</p>
          )}

          {incomingRequests.map((request) => {
            const displayName = formatRequesterName(request, true);
            const targetId = formatTargetId(request, true);

            return (
              <div key={request.requestId} className="flex items-center justify-between gap-3 rounded-xl border p-3">
                <Link href={`/hub/users/${targetId}`} className="flex items-center gap-3 min-w-0">
                  <Avatar className="h-12 w-12 border">
                    <AvatarImage src={formatRequesterAvatar(request, true)} alt={displayName} />
                    <AvatarFallback>
                      <UserRound className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>

                  <div className="min-w-0">
                    <p className="font-medium truncate">{displayName}</p>
                    <p className="text-sm text-muted-foreground truncate">Lời mời đang chờ phản hồi</p>
                  </div>
                </Link>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    className="rounded-xl"
                    onClick={() => handleAcceptFriendRequest(request.requestId)}
                    disabled={isMutating}
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Chấp nhận
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-xl"
                    onClick={() => handleRejectFriendRequest(request.requestId)}
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
          {outgoingRequests.length === 0 && (
            <p className="text-sm text-muted-foreground">Bạn chưa gửi lời mời kết bạn nào.</p>
          )}

          {outgoingRequests.map((request) => {
            const displayName = formatRequesterName(request, false);
            const targetId = formatTargetId(request, false);

            return (
              <div key={request.requestId} className="flex items-center justify-between gap-3 rounded-xl border p-3">
                <Link href={`/hub/users/${targetId}`} className="flex items-center gap-3 min-w-0">
                  <Avatar className="h-12 w-12 border">
                    <AvatarImage src={formatRequesterAvatar(request, false)} alt={displayName} />
                    <AvatarFallback>
                      <UserRound className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>

                  <div className="min-w-0">
                    <p className="font-medium truncate">{displayName}</p>
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
                    onClick={() => handleCancelFriendRequest(request.requestId)}
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
