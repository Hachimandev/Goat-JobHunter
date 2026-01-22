import { useCreateCommentMutation } from "@/services/blog/blogApi";
import { Alert } from "react-native";
import { useUser } from "./useUser";

export default function useCommentActions() {
  const { isSignedIn } = useUser();
  const [createComment, { isLoading: isCommenting }] =
    useCreateCommentMutation();

  const handleCommentBlog = async (blogId: number, comment: string) => {
    if (!isSignedIn) return Alert.alert("Lỗi", "Bạn cần đăng nhập");
    try {
      await createComment({ blogId, comment }).unwrap();
    } catch (e) {
      Alert.alert("Lỗi", "Không thể gửi bình luận");
    }
  };

  const handleReplyComment = async (
    blogId: number,
    commentId: number,
    reply: string,
  ) => {
    if (!isSignedIn) return Alert.alert("Lỗi", "Bạn cần đăng nhập");
    try {
      await createComment({
        blogId,
        comment: reply,
        replyTo: commentId,
      }).unwrap();
    } catch (e) {
      Alert.alert("Lỗi", "Không thể gửi câu trả lời");
    }
  };

  return { handleCommentBlog, handleReplyComment, isCommenting };
}
