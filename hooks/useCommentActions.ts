import {
  useCreateCommentMutation,
  useDeleteCommentMutation,
} from "@/services/blog/blogApi";
import { Alert } from "react-native";
import { useUser } from "./useUser";

export default function useCommentActions() {
  const { user, isSignedIn } = useUser();

  const [createComment, { isLoading: isCommenting }] =
    useCreateCommentMutation();
  const [deleteComment, { isLoading: isDeleting }] = useDeleteCommentMutation();

  const checkAuth = () => {
    if (!isSignedIn || !user) {
      Alert.alert(
        "Thông báo",
        "Bạn phải đăng nhập để thực hiện chức năng này.",
      );
      return false;
    }
    return true;
  };

  const handleCommentBlog = async (blogId: number, comment: string) => {
    if (!checkAuth()) return;

    try {
      await createComment({
        blogId,
        comment,
      }).unwrap();
    } catch (e: any) {
      console.log("Lỗi gửi comment:", e);
      Alert.alert("Lỗi", "Không thể bình luận bây giờ.");
    }
  };

  const handleReplyComment = async (
    blogId: number,
    commentId: number,
    reply: string,
  ) => {
    if (!checkAuth()) return;

    try {
      await createComment({
        blogId,
        comment: reply,
        replyTo: commentId,
      }).unwrap();
    } catch (e) {
      Alert.alert("Lỗi", "Không thể trả lời bình luận.");
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!checkAuth()) return;

    try {
      await deleteComment(commentId).unwrap();
      console.log("API Xóa thành công ID:", commentId);
    } catch (e: any) {
      console.error("Lỗi API xóa:", e);
    }
  };

  return {
    handleCommentBlog,
    handleReplyComment,
    handleDeleteComment,
    isCommenting,
    isDeleting,
  };
}
