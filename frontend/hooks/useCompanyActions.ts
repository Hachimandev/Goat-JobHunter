import { useFollowCompaniesMutation, useUnfollowCompaniesMutation } from '@/services/user/userApi';
import { useUser } from './useUser';
import { Company } from '@/types/model';
import { toast } from 'sonner';
import { useCallback } from 'react';

export default function useCompanyActions() {
  const { user, isSignedIn } = useUser();
  const [followCompanies, { isLoading: isFollowing, isSuccess: isFollowSuccess, isError: isFollowError }] =
    useFollowCompaniesMutation();
  const [unfollowCompanies, { isLoading: isUnfollowing, isSuccess: isUnfollowSuccess, isError: isUnfollowError }] =
    useUnfollowCompaniesMutation();

  const handleToggleFollowCompany = async (e: React.MouseEvent, company: Company, isFollowed: boolean) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isSignedIn || !user) {
      toast.error('Bạn phải đăng nhập để thực hiện chức năng này.');
      return;
    }

    if (isFollowed) {
      await unfollowCompanies({
        companyIds: [company.accountId],
      });
    } else {
      await followCompanies({
        companyIds: [company.accountId],
      });
    }

    if (isFollowSuccess || isUnfollowSuccess) {
      toast.success(isFollowed ? 'Đã hủy theo dõi công ty.' : 'Đã theo dõi công ty thành công.');
    }

    if (isFollowError || isUnfollowError) {
      toast.error('Đã xảy ra lỗi. Vui lòng thử lại.');
    }
  };

  const handleFollowCompanies = useCallback(
    async (companyIds: number[]) => {
      try {
        await followCompanies({ companyIds }).unwrap();

        toast.success('Theo dõi thành công!');
      } catch (error) {
        toast.error('Không thể theo dõi công ty. Vui lòng thử lại sau');
        throw error;
      }
    },
    [followCompanies],
  );

  const handleUnfollowCompanies = useCallback(
    async (companyIds: number[]) => {
      try {
        await unfollowCompanies({ companyIds }).unwrap();

        toast.success('Hủy theo dõi thành công!');
      } catch (error) {
        console.error('Failed to unfollow companies:', error);
        toast.error('Không thể hủy theo dõi công ty. Vui lòng thử lại sau');
        throw error;
      }
    },
    [unfollowCompanies],
  );

  return {
    isFollowing,
    isUnfollowing,
    isLoading: isFollowing || isUnfollowing,

    handleToggleFollowCompany,
    handleFollowCompanies,
    handleUnfollowCompanies,
  };
}
