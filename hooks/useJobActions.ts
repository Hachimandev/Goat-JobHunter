import { useCallback } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import {
  useSaveJobsMutation,
  useUnsaveJobsMutation,
} from '@/services/user/savedJobsApi';
import { Job } from '@/types/model';
import { useUser } from './useUser';

export const useJobActions = () => {
  const router = useRouter();
  const { user, isSignedIn } = useUser();
  const [saveJobs] = useSaveJobsMutation();
  const [unsaveJobs] = useUnsaveJobsMutation();

  const handleUnsaveJob = useCallback(
    async (job: Job | null) => {
      if (!user) {
        Alert.alert('Thông báo', 'Bạn phải đăng nhập để thực hiện chức năng này.');
        return;
      }

      if (!job) {
        Alert.alert('Lỗi', 'Có lỗi khi bỏ lưu công việc. Vui lòng thử lại sau.');
        return;
      }

      try {
        await unsaveJobs({
          jobIds: [job.jobId],
        }).unwrap();
        Alert.alert('Thành công', 'Đã bỏ lưu công việc.');
      } catch (error) {
        Alert.alert('Lỗi', 'Đã xảy ra lỗi. Vui lòng thử lại.');
      }
    },
    [user, unsaveJobs]
  );

  const handleToggleSaveJob = useCallback(
    async (job: Job, isSaved: boolean) => {
      if (!isSignedIn || !user) {
        Alert.alert('Thông báo', 'Bạn phải đăng nhập để thực hiện chức năng này.', [
          {
            text: 'Đăng nhập',
            onPress: () => router.push('/(auth)/signin'),
          },
          {
            text: 'Hủy',
            style: 'cancel',
          },
        ]);
        return;
      }

      try {
        if (isSaved) {
          await unsaveJobs({
            jobIds: [job.jobId],
          }).unwrap();
          Alert.alert('Thành công', 'Đã bỏ lưu công việc.');
        } else {
          await saveJobs({
            jobIds: [job.jobId],
          }).unwrap();
          Alert.alert('Thành công', 'Đã lưu công việc thành công.');
        }
      } catch (error) {
        Alert.alert('Lỗi', 'Đã xảy ra lỗi. Vui lòng thử lại.');
      }
    },
    [isSignedIn, user, saveJobs, unsaveJobs, router]
  );

  return {
    handleUnsaveJob,
    handleToggleSaveJob,
  };
};
