import { useLazyFetchUserByIdQuery } from '@/services/user/userApi';
import { useSendInvitationEmailMutation } from '@/services/email/emailApi';
import { useCallback } from 'react';
import { toast } from 'sonner';

export const useJobAction = () => {
  const [fetchUserById, { isFetching: isFetchingUserById, isError: isFetchingUserByIdError }] =
    useLazyFetchUserByIdQuery();

  const [sendInvitationEmail, { isLoading: isSendingInvitationEmail, isError: isSendInvitationEmailError }] =
    useSendInvitationEmailMutation();

  const getUserById = useCallback(
    async (userId: number) => {
      const response = await fetchUserById(String(userId));
      const userDetail = response.data?.data;
      return userDetail;
    },
    [fetchUserById],
  );

  const handleSendInvitationEmail = useCallback(
    async (applicantIds: number[], jobId: number) => {
      try {
        toast.success('Đang gửi email...');
        const response = await sendInvitationEmail({ applicantIds, jobId }).unwrap();
        toast.success('Đã gửi email');
        return response;
      } catch (error) {
        toast.error('Gửi email thất bại');
        throw error;
      }
    },
    [sendInvitationEmail],
  );

  return {
    getUserById,
    isFetchingUserById,
    isFetchingUserByIdError,
    handleSendInvitationEmail,
    isSendingInvitationEmail,
    isSendInvitationEmailError,
  };
};
