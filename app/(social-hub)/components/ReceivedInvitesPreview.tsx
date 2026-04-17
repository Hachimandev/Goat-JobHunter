import FriendRequestInfoRow from '@/components/common/FriendRequestInfoRow';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import useLatestReceivedInvites from '@/hooks/useLatestReceivedInvites';
import { Inbox } from 'lucide-react';
import Link from 'next/link';

export function ReceivedInvitesPreview() {
  const { isSignedIn, invites, showViewAll } = useLatestReceivedInvites();

  if (!isSignedIn) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Inbox className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-bold text-foreground">Lời mời đã nhận</h3>
          </div>

          {showViewAll ? (
            <Link href="/hub/friends" className="text-xs font-semibold text-primary hover:underline">
              Xem tất cả
            </Link>
          ) : null}
        </div>
      </CardHeader>

      <CardContent className="space-y-2">
        {invites.length === 0 ? (
          <p className="text-sm text-muted-foreground">Bạn không có lời mời nào.</p>
        ) : (
          invites.map((invite) => (
            <FriendRequestInfoRow
              key={invite.requestId}
              targetId={invite.targetId}
              displayName={invite.displayName}
              avatar={invite.avatar}
              subtitle="Đang chờ phản hồi"
              className="rounded-lg px-2 py-2"
              avatarClassName="h-10 w-10"
            />
          ))
        )}
      </CardContent>
    </Card>
  );
}
