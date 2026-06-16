import { Heart, MessageCircle, BellRing, Bell } from 'lucide-react';
import { NotificationType } from '@/types/model';
import { NotificationTypeEnum } from '@/types/enum';
import { truncate } from 'lodash';
import { extractPlainTextFromHtml } from '@/utils/extractPlainTextFromHtml';

interface NotificationContentOptions {
  maxLength?: number;
}

export const getNotificationContent = (notification: NotificationType, options: NotificationContentOptions = {}) => {
  const { maxLength = 80 } = options;

  const sender = notification.lastActor.fullName || notification.lastActor.username || 'Người dùng ẩn danh';
  const senderPostfix = notification.actorCount > 1 ? ` và ${notification.actorCount - 1} người khác` : '';
  const rawBlogContent =
    notification.blog?.contentPreview || notification.blog?.content || `bài viết #${notification.blog?.blogId ?? ''}`;
  const blog = extractPlainTextFromHtml(rawBlogContent).trim() || `bài viết #${notification.blog?.blogId ?? ''}`;
  const content = notification?.repliedOnComment?.comment || notification?.comment?.comment;

  switch (notification.type) {
    case NotificationTypeEnum.LIKE:
      return {
        icon: <Heart className="h-5 w-5 text-red-500" />,
        message: `${sender}${senderPostfix} đã thích bài viết của bạn: ${truncate(blog, { length: maxLength })}`,
      };
    case NotificationTypeEnum.COMMENT:
      return {
        icon: <MessageCircle className="h-5 w-5 text-blue-500" />,
        message: `${sender}${senderPostfix} đã bình luận về bài viết của bạn: ${truncate(blog, { length: maxLength })}`,
      };
    case NotificationTypeEnum.REPLY:
      return {
        icon: <MessageCircle className="h-5 w-5 text-green-500" />,
        message: `${sender}${senderPostfix} đã trả lời bình luận của bạn về bài viết ${blog}: ${truncate(content, { length: maxLength })}`,
      };
    case NotificationTypeEnum.FOLLOW:
      return {
        icon: <BellRing className="h-5 w-5 text-primary" />,
        message: `${sender}${senderPostfix} đã theo dõi bạn.`,
      };
    default:
      return {
        icon: <Bell className="h-5 w-5 text-primary" />,
        message: 'Bạn có thông báo mới',
      };
  }
};
