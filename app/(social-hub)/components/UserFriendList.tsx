import { useMemo } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useChatRooms } from '@/app/(chat)/messages/hooks/useChatRooms';
import ErrorMessage from '@/components/common/ErrorMessage';
import Link from 'next/link';
import { truncate } from 'lodash';

const LATEST_ROOMS_LIMIT = 10;

export function UserFriendList() {
  const { chatRooms, isLoading, isError } = useChatRooms();

  const latestRooms = useMemo(() => chatRooms.slice(0, LATEST_ROOMS_LIMIT), [chatRooms]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Liên hệ</CardTitle>
      </CardHeader>

      <CardContent className="mt-0!">
        {isLoading &&
          Array.from({ length: 4 }, (_, index) => (
            <div key={`user-friend-list-loading-${index}`} className="flex items-center gap-3">
              <Skeleton className="h-12 w-12 rounded-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ))}

        {isError && <ErrorMessage message="Không thể tải danh sách liên hệ." />}

        {!isLoading && !isError && latestRooms.length === 0 && (
          <p className="text-sm text-muted-foreground">Chưa có cuộc trò chuyện nào.</p>
        )}

        {!isLoading &&
          !isError &&
          latestRooms.map((room) => {
            const displayName = room.name?.trim() || 'Không tên';

            return (
              <Link
                key={room.roomId}
                href={`/messages/${room.roomId}`}
                className="w-full flex items-center gap-3 group text-left rounded-lg p-2 -m-2 transition-colors hover:bg-accent/40 mb-3"
              >
                <Avatar className="h-12 w-12">
                  <AvatarImage src={room.avatar || '/placeholder.svg'} alt={displayName} />
                  <AvatarFallback>{displayName.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                    {truncate(displayName, { length: 30 })}
                  </p>
                </div>
              </Link>
            );
          })}
      </CardContent>
    </Card>
  );
}
