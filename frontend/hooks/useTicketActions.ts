import { useCreateBlogTicketMutation, useCreateCommentTicketMutation } from '@/services/ticket/ticketApi';
import { useUser } from './useUser';
import { useCallback } from 'react';
import { CreateTicketRequest } from '@/services/ticket/ticketType';
import { toast } from 'sonner';
import { getErrorMessage } from '@/utils/slug';

const useTicketActions = () => {
  const { isSignedIn, user } = useUser();
  const [createBlogTicket, { isLoading: isCreatingBlogTicket }] = useCreateBlogTicketMutation();
  const [createCommentTicket, { isLoading: isCreatingCommentTicket }] = useCreateCommentTicketMutation();

  const handleCreateBlogTicket = useCallback(
    async (data: CreateTicketRequest) => {
      if (!isSignedIn || !user) {
        toast.error('Bạn phải đăng nhập để thực hiện chức năng này.');
        return;
      }

      try {
        await createBlogTicket(data).unwrap();
        toast.success('Báo cáo bài viết thành công!');
        return true;
      } catch (error) {
        console.error('Failed to create blog ticket:', error);
        toast.error(getErrorMessage(error, 'Không thể gửi báo cáo. Vui lòng thử lại sau.'));
        return false;
      }
    },
    [createBlogTicket, isSignedIn, user],
  );

  const handleCreateCommentTicket = useCallback(
    async (data: CreateTicketRequest) => {
      if (!isSignedIn || !user) {
        toast.error('Bạn phải đăng nhập để thực hiện báo cáo.');
        return;
      }

      try {
        await createCommentTicket(data).unwrap();
        toast.success('Báo cáo bình luận thành công!');
        return true;
      } catch (error) {
        console.error('Failed to report comment:', error);
        toast.error(getErrorMessage(error, 'Không thể gửi báo cáo. Vui lòng thử lại sau.'));
        return false;
      }
    },
    [createCommentTicket, isSignedIn, user],
  );

  return {
    handleCreateBlogTicket,
    handleCreateCommentTicket,
    isLoading: isCreatingBlogTicket || isCreatingCommentTicket,
  };
};

export default useTicketActions;
