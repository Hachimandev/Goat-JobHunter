import { useCreateCommentMutation, useDeleteCommentMutation } from "@/services/blog/blogApi";
import { toast } from "sonner";
import { useUser } from "@/hooks/useUser";

const useCommentActions = () => {
  const { user, isSignedIn } = useUser();
  const [createComment, { isLoading: isCommenting }] = useCreateCommentMutation();
  const [deleteComment, { isLoading: isDeleting }] = useDeleteCommentMutation();

  const handleCommentBlog = async (blogId: number, comment: string) => {

    if (!isSignedIn || !user) {
      toast.error("Bạn phải đăng nhập để thực hiện chức năng này.");
      return;
    }

    try {
      await createComment({
        blogId,
        comment
      });
    } catch (e) {
      console.log(e);
      toast.error("Không thể bình luận bây giờ. Vui lòng thử lại sau.");
    }
  };

  const handleReplyComment = async (blogId: number, commentId: number, reply: string) => {
    if (!isSignedIn || !user) {
      toast.error("Bạn phải đăng nhập để thực hiện chức năng này.");
      return;
    }

    try {
      await createComment({
        blogId,
        comment: reply,
        replyTo: commentId
      });
    } catch (e) {
      console.log(e);
      toast.error("Không thể trả lời bình luận bây giờ. Vui lòng thử lại sau.");
    }
  };

  const handleDeleteComment = async ({ commentId, blogId }: { commentId: number; blogId: number }) => {
    if (!isSignedIn || !user) {
      toast.error("Bạn phải đăng nhập để thực hiện chức năng này.");
      return;
    }

    try {
      await deleteComment({ commentId, blogId });
      toast.success("Đã xóa bình luận.");
    } catch (e) {
      console.log(e);
      toast.error("Không thể xóa bình luận bây giờ. Vui lòng thử lại sau.");
    }
  };

  return {
    isCommenting,
    isDeleting,

    handleCommentBlog,
    handleReplyComment,
    handleDeleteComment
  };
};
export default useCommentActions;
