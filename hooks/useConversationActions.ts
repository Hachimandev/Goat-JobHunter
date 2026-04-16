import {
  useCreateConversationMutation,
  useDeleteConversationMutation,
  useRenameConversationMutation,
  useUpdateConversationPinMutation,
} from '@/services/ai/conversationApi';
import { toast } from 'sonner';
import { useUser } from '@/hooks/useUser';
import { CreateConversationRequest } from '@/services/ai/conversationType';
import { extractApiErrorMessage } from '@/utils/apiError';

export function useConversationActions() {
  const { user, isSignedIn } = useUser();
  const [createConversation, { isLoading: isCreating }] = useCreateConversationMutation();
  const [renameConversation, { isLoading: isUpdating }] = useRenameConversationMutation();
  const [updateConversationPin, { isLoading: isPinning }] = useUpdateConversationPinMutation();
  const [deleteConversation, { isLoading: isDeleting }] = useDeleteConversationMutation();

  const handleCreateConversation = async (payload?: CreateConversationRequest) => {
    try {
      return await createConversation(payload).unwrap();
    } catch (error) {
      console.error(error);
      toast.error(extractApiErrorMessage(error, 'Không thể tạo cuộc trò chuyện mới'));
      return;
    }
  };

  const handleUpdateConversation = async (conversationId: number, title: string) => {
    if (!user || !isSignedIn) {
      toast.error('Vui lòng đăng nhập để thực hiện hành động này.');
      return;
    }
    try {
      const result = await renameConversation({ conversationId, title }).unwrap();
      toast.success('Đã cập nhật cuộc trò chuyện');
      return result;
    } catch (error) {
      toast.error(extractApiErrorMessage(error, 'Không thể cập nhật cuộc trò chuyện'));
      console.error(error);
      return;
    }
  };

  const handleTogglePin = async (conversationId: number, isPinned: boolean) => {
    if (!user || !isSignedIn) {
      toast.error('Vui lòng đăng nhập để thực hiện hành động này.');
      return;
    }
    try {
      const nextPinnedState = !isPinned;
      const result = await updateConversationPin({
        conversationId,
        pinned: nextPinnedState,
      }).unwrap();
      toast.success(nextPinnedState ? 'Đã ghim cuộc trò chuyện' : 'Đã bỏ ghim cuộc trò chuyện');
      return result;
    } catch (error) {
      toast.error(extractApiErrorMessage(error, 'Không thể thay đổi trạng thái ghim'));
      console.error(error);
      return;
    }
  };

  const handleDeleteConversation = async (conversationId: number) => {
    if (!user || !isSignedIn) {
      toast.error('Vui lòng đăng nhập để thực hiện hành động này.');
      return;
    }
    try {
      await deleteConversation({ conversationId }).unwrap();
      toast.success('Đã xóa cuộc trò chuyện');
      return true;
    } catch (error) {
      toast.error(extractApiErrorMessage(error, 'Không thể xóa cuộc trò chuyện'));
      console.error(error);
      return false;
    }
  };

  return {
    isCreating,
    isUpdating,
    isPinning,
    isDeleting,
    handleCreateConversation,
    handleUpdateConversation,
    handleTogglePin,
    handleDeleteConversation,
  };
}
