import { useUser } from "@/hooks/useUser";
import {
  useFollowRecruitersMutation,
  useUnfollowRecruitersMutation,
} from "@/services/user/userApi";
import { Recruiter } from "@/types/model";
import { useCallback } from "react";
import { toast } from "sonner";

const useRecruiterActions = () => {
  const { user, isSignedIn } = useUser();
  const [
    followRecruiters,
    {
      isLoading: isFollowing,
      isSuccess: isFollowSuccess,
      isError: isFollowError,
    },
  ] = useFollowRecruitersMutation();
  const [
    unfollowRecruiters,
    {
      isLoading: isUnfollowing,
      isSuccess: isUnfollowSuccess,
      isError: isUnfollowError,
    },
  ] = useUnfollowRecruitersMutation();

  // Toggle follow recruiter
  const handleToggleFollowRecruiter = async (
    e: React.MouseEvent,
    recruiter: Recruiter,
    isFollowed: boolean,
  ) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isSignedIn || !user) {
      toast.error("Bạn phải đăng nhập để thực hiện chức năng này.");
      return;
    }

    if (isFollowed) {
      await unfollowRecruiters({
        recruiterIds: [recruiter.accountId],
      });
    } else {
      await followRecruiters({
        recruiterIds: [recruiter.accountId],
      });
    }

    if (isFollowSuccess || isUnfollowSuccess) {
      toast.success(
        isFollowed
          ? "Đã hủy theo dõi nhà tuyển dụng."
          : "Đã theo dõi nhà tuyển dụng thành công.",
      );
    }

    if (isFollowError || isUnfollowError) {
      toast.error("Đã xảy ra lỗi. Vui lòng thử lại.");
    }
  };

  // Follow multiple recruiters
  const handleFollowRecruiters = useCallback(
    async (recruiterIds: number[]) => {
      try {
        await followRecruiters({ recruiterIds }).unwrap();

        toast.success("Theo dõi thành công!");
      } catch (error) {
        console.error("Failed to follow recruiters:", error);
        toast.error("Không thể theo dõi nhà tuyển dụng. Vui lòng thử lại sau");
        throw error;
      }
    },
    [followRecruiters],
  );

  // Unfollow multiple recruiters
  const handleUnfollowRecruiters = useCallback(
    async (recruiterIds: number[]) => {
      try {
        await unfollowRecruiters({ recruiterIds }).unwrap();

        toast.success("Hủy theo dõi thành công!");
      } catch (error) {
        console.error("Failed to unfollow recruiters:", error);
        toast.error(
          "Không thể hủy theo dõi nhà tuyển dụng. Vui lòng thử lại sau",
        );
        throw error;
      }
    },
    [unfollowRecruiters],
  );

  return {
    // States
    isFollowing,
    isUnfollowing,
    isLoading: isFollowing || isUnfollowing,

    // Actions
    handleToggleFollowRecruiter,
    handleFollowRecruiters,
    handleUnfollowRecruiters,
  };
};

export default useRecruiterActions;
