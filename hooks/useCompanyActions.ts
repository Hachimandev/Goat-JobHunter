import { useFollowCompaniesMutation, useUnfollowCompaniesMutation } from '@/services/user/userApi';
import { useUser } from './useUser';
import { Company } from '@/types/model';
import { useCallback } from 'react';
import { Alert } from 'react-native';

export default function useCompanyActions() {
  const { user, isSignedIn } = useUser();
  const [followCompanies, { isLoading: isFollowing }] = useFollowCompaniesMutation();
  const [unfollowCompanies, { isLoading: isUnfollowing }] = useUnfollowCompaniesMutation();

  const handleToggleFollowCompany = useCallback(
    async (company: Company, isFollowed: boolean) => {
      if (!isSignedIn || !user) {
        Alert.alert('Thông báo', 'Bạn phải đăng nhập để thực hiện chức năng này.');
        return;
      }

      try {
        if (isFollowed) {
          await unfollowCompanies({
            companyIds: [company.accountId],
          }).unwrap();
          Alert.alert('Thành công', 'Đã hủy theo dõi công ty.');
        } else {
          await followCompanies({
            companyIds: [company.accountId],
          }).unwrap();
          Alert.alert('Thành công', 'Đã theo dõi công ty thành công.');
        }
      } catch (error) {
        console.error('Failed to toggle follow company:', error);
        Alert.alert('Lỗi', 'Đã xảy ra lỗi. Vui lòng thử lại.');
      }
    },
    [isSignedIn, user, followCompanies, unfollowCompanies]
  );

  const handleFollowCompanies = useCallback(
    async (companyIds: number[]) => {
      if (!isSignedIn || !user) {
        Alert.alert('Thông báo', 'Bạn phải đăng nhập để thực hiện chức năng này.');
        return;
      }

      try {
        await followCompanies({ companyIds }).unwrap();
        Alert.alert('Thành công', 'Theo dõi thành công!');
      } catch (error) {
        console.error('Failed to follow companies:', error);
        Alert.alert('Lỗi', 'Không thể theo dõi công ty. Vui lòng thử lại sau');
        throw error;
      }
    },
    [isSignedIn, user, followCompanies]
  );

  const handleUnfollowCompanies = useCallback(
    async (companyIds: number[]) => {
      if (!isSignedIn || !user) {
        Alert.alert('Thông báo', 'Bạn phải đăng nhập để thực hiện chức năng này.');
        return;
      }

      try {
        await unfollowCompanies({ companyIds }).unwrap();
        Alert.alert('Thành công', 'Hủy theo dõi thành công!');
      } catch (error) {
        console.error('Failed to unfollow companies:', error);
        Alert.alert('Lỗi', 'Không thể hủy theo dõi công ty. Vui lòng thử lại sau');
        throw error;
      }
    },
    [isSignedIn, user, unfollowCompanies]
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
