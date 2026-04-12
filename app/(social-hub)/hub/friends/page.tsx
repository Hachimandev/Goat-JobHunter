'use client';

import CustomPagination from '@/components/common/CustomPagination';
import ErrorMessage from '@/components/common/ErrorMessage';
import LoaderSpin from '@/components/common/LoaderSpin';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import useFriendsInboxPage, { FriendsInboxPagination } from '@/hooks/useFriendsInboxPage';
import { Check, Inbox, Send, UserRound, Users, X } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

type FriendTabValue = 'friends' | 'received' | 'sent';

type PaginationFooterProps = {
  pagination: FriendsInboxPagination;
};

function PaginationFooter({ pagination }: Readonly<PaginationFooterProps>) {
  return (
    <CustomPagination
      currentPage={pagination.page}
      totalPages={pagination.totalPages}
      onPageChange={pagination.onPageChange}
      onNextPage={pagination.onNextPage}
      onPreviousPage={pagination.onPreviousPage}
      hasNextPage={pagination.hasNextPage}
      hasPreviousPage={pagination.hasPreviousPage}
      visiblePageRange={2}
    />
  );
}

export default function FriendRequestsInboxPage() {
  const [activeTab, setActiveTab] = useState<FriendTabValue>('friends');

  const {
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
  } = useFriendsInboxPage();

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
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as FriendTabValue)} className="w-full gap-4">
        <TabsList className="grid h-10 w-full grid-cols-3">
          <TabsTrigger value="friends" className="gap-2">
            <Users className="h-4 w-4" />
            <span>Bạn bè</span>
          </TabsTrigger>
          <TabsTrigger value="received" className="gap-2">
            <Inbox className="h-4 w-4" />
            <span>Đã nhận</span>
          </TabsTrigger>
          <TabsTrigger value="sent" className="gap-2">
            <Send className="h-4 w-4" />
            <span>Đã gửi</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="friends">
          <Card className="gap-2!">
            <CardHeader className="">
              <CardTitle className="text-xl font-semibold">Bạn bè</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {friendCards.length === 0 && <p className="text-sm text-muted-foreground">Bạn chưa có bạn bè nào.</p>}

              {friendCards.map((friendCard) => {
                return (
                  <div
                    key={friendCard.targetId}
                    className="flex items-center justify-between gap-3 rounded-xl border p-3"
                  >
                    <Link href={`/hub/users/${friendCard.targetId}`} className="min-w-0 flex items-center gap-3">
                      <Avatar className="h-12 w-12 border">
                        <AvatarImage src={friendCard.avatar} alt={friendCard.displayName} />
                        <AvatarFallback>
                          <UserRound className="h-5 w-5" />
                        </AvatarFallback>
                      </Avatar>

                      <div className="min-w-0">
                        <p className="truncate font-medium">{friendCard.displayName}</p>
                        <p className="truncate text-sm text-muted-foreground">
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

              <PaginationFooter pagination={friendsPagination} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="received">
          <Card className="gap-2!">
            <CardHeader className="">
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
                    <Link href={`/hub/users/${requestCard.targetId}`} className="min-w-0 flex items-center gap-3">
                      <Avatar className="h-12 w-12 border">
                        <AvatarImage src={requestCard.avatar} alt={requestCard.displayName} />
                        <AvatarFallback>
                          <UserRound className="h-5 w-5" />
                        </AvatarFallback>
                      </Avatar>

                      <div className="min-w-0">
                        <p className="truncate font-medium">{requestCard.displayName}</p>
                        <p className="truncate text-sm text-muted-foreground">Lời mời đang chờ phản hồi</p>
                      </div>
                    </Link>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        className="rounded-xl"
                        onClick={() => handleAcceptFriendRequest(requestCard.requestId)}
                        disabled={isMutating}
                      >
                        <Check className="mr-1 h-4 w-4" />
                        Chấp nhận
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-xl"
                        onClick={() => handleRejectFriendRequest(requestCard.requestId)}
                        disabled={isMutating}
                      >
                        <X className="mr-1 h-4 w-4" />
                        Từ chối
                      </Button>
                    </div>
                  </div>
                );
              })}

              <PaginationFooter pagination={receivedPagination} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sent">
          <Card className="gap-2!">
            <CardHeader className="">
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
                    <Link href={`/hub/users/${requestCard.targetId}`} className="min-w-0 flex items-center gap-3">
                      <Avatar className="h-12 w-12 border">
                        <AvatarImage src={requestCard.avatar} alt={requestCard.displayName} />
                        <AvatarFallback>
                          <UserRound className="h-5 w-5" />
                        </AvatarFallback>
                      </Avatar>

                      <div className="min-w-0">
                        <p className="truncate font-medium">{requestCard.displayName}</p>
                        <p className="truncate text-sm text-muted-foreground">Đang chờ người kia phản hồi</p>
                      </div>
                    </Link>

                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="hidden rounded-xl sm:inline-flex">
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

              <PaginationFooter pagination={sentPagination} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
