'use client';

import CustomPagination from '@/components/common/CustomPagination';
import ErrorMessage from '@/components/common/ErrorMessage';
import FriendRequestInfoRow from '@/components/common/FriendRequestInfoRow';
import LoaderSpin from '@/components/common/LoaderSpin';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import useBlockedUsersPage from '@/hooks/useBlockedUsersPage';
import { ShieldBan, Undo2 } from 'lucide-react';

export default function BlockedUsersPage() {
  const {
    user,
    isSignedIn,
    isLoadingBlockedUsers,
    isFetchBlockedUsersError,
    isMutating,
    blockedUserCards,
    pagination,
    handleRetry,
    handleUnblockUser,
  } = useBlockedUsersPage();

  if (!isSignedIn || !user) {
    return <ErrorMessage message="Vui lòng đăng nhập để xem danh sách đã chặn." />;
  }

  if (isLoadingBlockedUsers) {
    return <LoaderSpin />;
  }

  if (isFetchBlockedUsersError) {
    return <ErrorMessage message="Không thể tải danh sách đã chặn." onRetry={handleRetry} />;
  }

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <Card className="gap-2!">
        <CardHeader>
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            <ShieldBan className="h-5 w-5" />
            Danh sách đã chặn
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {blockedUserCards.length === 0 && (
            <p className="text-sm text-muted-foreground">Bạn chưa chặn người dùng nào.</p>
          )}

          {blockedUserCards.map((blockedUserCard) => {
            return (
              <FriendRequestInfoRow
                key={blockedUserCard.targetId}
                targetId={blockedUserCard.targetId}
                displayName={blockedUserCard.displayName}
                avatar={blockedUserCard.avatar}
                subtitle={blockedUserCard.headline ?? 'Đang nằm trong danh sách chặn của bạn'}
                actions={
                  <>
                    <Badge variant="secondary" className="rounded-xl hidden sm:inline-flex">
                      Đã chặn
                    </Badge>

                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-xl"
                      onClick={() => {
                        void handleUnblockUser(blockedUserCard.targetId);
                      }}
                      disabled={isMutating}
                    >
                      <Undo2 className="mr-1 h-4 w-4" />
                      Bỏ chặn
                    </Button>
                  </>
                }
              />
            );
          })}

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
        </CardContent>
      </Card>
    </div>
  );
}
