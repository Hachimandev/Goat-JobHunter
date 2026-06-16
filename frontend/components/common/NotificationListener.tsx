"use client";

import { useUser } from "@/hooks/useUser";
import { useSubscribeNotificationsQuery } from "@/services/notification/notificationApi";


export default function NotificationListener() {
  const { isSignedIn, user } = useUser();

  // Chỉ subscribe khi user đã đăng nhập
  useSubscribeNotificationsQuery(undefined, {
    skip: !isSignedIn || !user,
  });

  return null;
}
