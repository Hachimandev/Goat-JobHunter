"use client";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { NotificationType } from "@/types/model";
import { formatDateTime } from "@/utils/formatDate";
import { useMemo, useState } from "react";
import Image from "next/image";
import { getNotificationContent } from "@/utils/getNotificationContent";
import { NotificationTypeEnum } from "@/types/enum";
import { useRouter } from "next/navigation";

interface NotificationCardProps {
  notification: NotificationType;
  markAsRead: (id: number) => Promise<void>;
  variant?: "default" | "compact";
}

const NotificationCard = ({
                            notification,
                            markAsRead,
                            variant = "default"
                          }: NotificationCardProps) => {
  const router = useRouter();
  const sender = useMemo(() => notification.lastActor.fullName || notification.lastActor.username || "Người dùng ẩn danh", [notification.lastActor]);

  const { icon, message } = getNotificationContent(notification, {
    maxLength: variant === "compact" ? 30 : 80
  });

  const [imageError, setImageError] = useState(false);

  const hasAvatar = notification.lastActor.avatar && !imageError;

  const url = useMemo(() => {
    const isLink = [NotificationTypeEnum.REPLY, NotificationTypeEnum.COMMENT, NotificationTypeEnum.LIKE].includes(notification.type);
    if (isLink) {
      return `/blogs/${notification.blog.blogId}`;
    }
    return "#";
  }, [notification]);

  const handleClick = async () => {
    await markAsRead(notification.notificationId!);
    router.push(url);
  };

  if (variant === "compact") {
    return (
      <div
        className={cn(
          "px-4 py-3 hover:bg-accent/50 transition-colors group cursor-pointer group",
          !notification.seen && "bg-primary/5"
        )}
        onClick={handleClick}
      >
        <div className="flex gap-3">
          {hasAvatar ? (
            <div className="relative h-[72px] w-[72px]">
              <div className="h-16 w-16 rounded-full bg-muted overflow-hidden flex items-center justify-center">
                <Image
                  src={notification.lastActor.avatar}
                  alt={sender}
                  width={64}
                  height={64}
                  className="h-full w-full object-cover"
                  onError={() => setImageError(true)}
                />
              </div>
              <div className={"absolute bottom-0 right-0 p-1 rounded-full bg-background border"}>
                {icon}
              </div>
            </div>
          ) : (
            <div className="h-16 w-16 mr-2 rounded-full bg-muted flex items-center justify-center">
              {icon}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <p
                className={cn(
                  "text-sm",
                  !notification.seen
                    ? "font-semibold text-foreground"
                    : "text-muted-foreground"
                )}
              >
                {message}
              </p>
              {!notification.seen && (
                <span className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1 inline group-hover:hidden" />
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatDateTime(notification.createdAt)}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card
      className={cn(
        "p-4 cursor-pointer hover:shadow-md transition-shadow group",
        !notification.seen && "bg-primary/5 border-primary/30"
      )}
      onClick={handleClick}
    >
      <div className="flex items-start gap-4">
        {hasAvatar ? (
          <div className="relative h-[72px] w-[72px]">
            <div className="h-16 w-16 rounded-full bg-muted overflow-hidden flex items-center justify-center">
              <Image
                src={notification.lastActor.avatar}
                alt={sender}
                width={64}
                height={64}
                className="h-full w-full object-cover"
                onError={() => setImageError(true)}
              />
            </div>
            <div className={"absolute bottom-0 right-0 p-1 rounded-full bg-background border"}>
              {icon}
            </div>
          </div>
        ) : (
          <div className="h-16 w-16 mr-2 rounded-full bg-muted flex items-center justify-center">
            {icon}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <p
              className={cn(
                "text-sm",
                !notification.seen
                  ? "font-semibold text-foreground"
                  : "text-muted-foreground"
              )}
            >
              {message}
            </p>
            {!notification.seen && (
              <span className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1" />
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {formatDateTime(notification.createdAt)}
          </p>
        </div>
      </div>
    </Card>
  );
};

export default NotificationCard;
