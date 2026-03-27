import { useCreateSubscriberMutation, useUpdateSubscriberMutation } from '@/services/subcriber/subcriberApi';
import { Skill } from '@/types/model';
import { useCallback } from 'react';
import { toast } from 'sonner';
import { useUser } from './useUser';

interface UseSubscriberActionsProps {
  subscriberId: number;
  email: string;
  name: string;
  skills: Skill[];
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
}

const useSubscriberActions = (data?: UseSubscriberActionsProps) => {
  const [createSubscriber, { isLoading: isCreating }] = useCreateSubscriberMutation();
  const [updateSubscriber, { isLoading: isUpdating }] = useUpdateSubscriberMutation();
  const { user } = useUser();

  // create new subscriber for user if they don't have any skill subscriptions, otherwise update that subscriber by adding new skills
  const handleAddSkills = useCallback(
    // eslint-disable-next-line react-hooks/preserve-manual-memoization
    async (skillIds: number[]) => {
      try {
        if (!data?.email && !user?.email) {
          toast.error('Có lỗi xảy ra. Vui lòng đăng nhập lại.');
          return;
        }

        // user already has a subscriber, so we just need to update it
        if (data?.subscriberId) {
          await updateSubscriber({
            subscriberId: data.subscriberId,
            skillIds: [...data.skills.map((s) => s.skillId), ...skillIds],
          }).unwrap();

          toast.success('Đăng ký thành công');
          return;
        }

        // user does not have a subscriber, so we need to create one
        await createSubscriber({
          skillIds,
        });
        toast.success('Đăng ký thành công');
      } catch (error) {
        console.error('Failed to add skills:', error);
        toast.error('Không thể đăng ký thêm kỹ năng. Vui lòng thử lại sau');
        throw error;
      }
    },
    [createSubscriber, updateSubscriber, data],
  );

  // Remove skill from subscriber
  const handleRemoveSkill = useCallback(
    async (skillId: number) => {
      try {
        if (!data) {
          toast.error('Không tìm thấy thông tin đăng ký');
          return;
        }

        const response = await updateSubscriber({
          subscriberId: data.subscriberId,
          skillIds: data.skills.filter((skill) => skill.skillId !== skillId).map((skill) => skill.skillId),
        }).unwrap();

        if (response.data) {
          toast.success('Xóa kỹ năng thành công!');
          return response.data;
        }
      } catch (error) {
        console.error('Failed to remove skill:', error);
        toast.error('Không thể xóa kỹ năng. Vui lòng thử lại sau');
        throw error;
      }
    },
    [data, updateSubscriber],
  );

  return {
    // Mutation states
    isCreating,
    isUpdating,
    isLoading: isCreating || isUpdating,

    // Actions
    handleAddSkills,
    handleRemoveSkill,
  };
};

export default useSubscriberActions;
