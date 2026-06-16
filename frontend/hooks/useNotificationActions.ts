import { useMarkNotificationsAsSeenMutation } from "@/services/notification/notificationApi";
import { toast } from "sonner";
import { useUser } from "@/hooks/useUser";

const useNotificationActions = () => {
  const { user, isSignedIn } = useUser();
  const [markAsRead, { isLoading }] = useMarkNotificationsAsSeenMutation();

  const handleMarkAsRead = async (id: number) => {
    if (!isSignedIn || !user) {
      toast.error("Vui lòng đăng nhập để thực hiện hành động này");
      return;
    }

    try {
      await markAsRead([id]).unwrap();
      toast.success("Đã đánh dấu là đã đọc");
    } catch (error) {
      console.log(error);
      toast.error("Đánh dấu đã đọc thất bại. Vui lòng thử lại sau");
    }
  };

  const handleMarkAllAsRead = async (unreadNotificationIds: number[]) => {
    if (!unreadNotificationIds.length) {
      return;
    }

    if (!isSignedIn || !user) {
      toast.error("Vui lòng đăng nhập để thực hiện hành động này");
      return;
    }

    try {
      await markAsRead(unreadNotificationIds).unwrap();
      toast.success("Đã đánh dấu là đã đọc");
    } catch (error) {
      console.log(error);
      toast.error("Đánh dấu đã đọc thất bại. Vui lòng thử lại sau");
    }
  };

  return {
    handleMarkAsRead,
    handleMarkAllAsRead,
    isMarkingAsRead: isLoading
  };
};
export default useNotificationActions;
