"use client";

import NotificationCard from "@/app/(main)/components/NotificationCard";
import ErrorMessage from "@/components/common/ErrorMessage";
import LoaderSpin from "@/components/common/LoaderSpin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle
} from "@/components/ui/empty";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useGetLatestNotificationsQuery } from "@/services/notification/notificationApi";
import { Bell, BellRing, CheckCheck } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import useNotificationActions from "@/hooks/useNotificationActions";

export default function NotificationPopup() {
  const { data, isLoading, isError, isSuccess, refetch } =
    useGetLatestNotificationsQuery();
  const notifications = useMemo(() => data?.data || [], [data]);
  const unreadCount = notifications.filter((n) => !n.seen).length;

  const { handleMarkAllAsRead, handleMarkAsRead } = useNotificationActions();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-10 w-10 rounded-full bg-muted"
        >
          <Bell className="h-5 w-5" />
          <Badge
            className="absolute -top-1 -right-1 h-5 w-5 rounded-full text-xs font-semibold flex items-center justify-center p-0">
            {unreadCount > 9 ? "9+" : unreadCount}
          </Badge>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0 rounded-xl" align="end">

        {isLoading &&
          <>
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="font-semibold text-foreground">Thông báo</h3>
            </div>
            <LoaderSpin />
          </>
        }

        {isError &&
          <div>
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="font-semibold text-foreground">Thông báo</h3>
            </div>
            <div className="p-4">
              <ErrorMessage message="Đã có lỗi xảy ra khi tải các thông báo. Vui lòng thử lại sau" onRetry={refetch} variant="compact" />
            </div>
          </div>
        }

        {isSuccess &&
          <>
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="font-semibold text-foreground">Thông báo</h3>
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-primary hover:text-primary/80 rounded-xl"
                  onClick={() => handleMarkAllAsRead(notifications.filter(n => !n.seen).map(n => n.notificationId))}
                >
                  <CheckCheck className="h-4 w-4 mr-1" />
                  Đánh dấu tất cả đã đọc
                </Button>
              )}
            </div>

            <ScrollArea
              className={cn(notifications.length > 0 ? "h-[400px]" : "h-[250px]")}
            >
              <div className="divide-y divide-border">
                {isSuccess &&
                  notifications?.map((notification) => (
                    <NotificationCard
                      key={notification.notificationId}
                      notification={notification}
                      markAsRead={handleMarkAsRead}
                      variant="compact"
                    />
                  ))}
              </div>

              {isSuccess && notifications.length === 0 && <EmptyMuted />}
            </ScrollArea>

            <div className="p-3 border-t border-border">
              <Link href="/profile?tab=notifications">
                <Button variant="default" className="w-full text-sm rounded-xl">
                  <Bell className="h-4 w-4 ml-2" />
                  Xem tất cả thông báo
                </Button>
              </Link>
            </div>
          </>
        }

      </PopoverContent>
    </Popover>
  );
}

export function EmptyMuted() {
  return (
    <Empty className="h-full bg-linear-to-b from-30%">
      <EmptyHeader>
        <EmptyMedia variant="icon" className="bg-white">
          <BellRing />
        </EmptyMedia>
        <EmptyTitle>Không có thông báo nào</EmptyTitle>
        <EmptyDescription>Hãy kiểm tra lại sau</EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
