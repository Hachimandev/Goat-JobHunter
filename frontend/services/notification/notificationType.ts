import type { IBackendRes, IModelPaginate } from "@/types/api";
import type { NotificationType } from "@/types/model";

export type LatestNotificationsResponse = IBackendRes<NotificationType[]>;

export type MarkNotificationsAsSeenResponse = IBackendRes<{
  userId: number;
  seenNotificationIds: number[];
}>;

export type NotificationPaginationRequest = {
  page?: number;
  size?: number;
};

export type NotificationPaginationResponse = IBackendRes<
  IModelPaginate<NotificationType>
>;