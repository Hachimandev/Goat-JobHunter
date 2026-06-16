import { useCallback } from "react";
import { toast } from "sonner";
import { useUser } from "@/hooks/useUser";
import { ReactionType } from "@/types/enum";
import {
  useReactBlogMutation,
  useUnreactBlogMutation,
} from "@/services/reaction/reactionApi";

const useReactionActions = () => {
  const { isSignedIn, user } = useUser();
  const [reactBlog, { isLoading: isReacting }] = useReactBlogMutation();
  const [unreactBlog, { isLoading: isUnreacting }] = useUnreactBlogMutation();

  // React to blog
  const handleReactBlog = useCallback(
    async (blogId: number, reactionType: ReactionType) => {
      if (!isSignedIn || !user) {
        toast.error("Bạn phải đăng nhập để thực hiện chức năng này.");
        return;
      }

      try {
        await reactBlog({
          blogId,
          reactionType
        }).unwrap();

      } catch (error) {
        console.error("Failed to react blog:", error);
        toast.error("Không thể thả cảm xúc. Vui lòng thử lại sau.");
      }
    },
    [reactBlog, isSignedIn, user]
  );

  // Unreact blog
  const handleUnreactBlog = useCallback(
    async (blogId: number) => {
      if (!isSignedIn || !user) {
        toast.error("Bạn phải đăng nhập để thực hiện chức năng này.");
        return;
      }

      try {
        await unreactBlog({
          blogIds: [blogId]
        }).unwrap();

      } catch (error) {
        console.error("Failed to unreact blog:", error);
        toast.error("Không thể bỏ cảm xúc. Vui lòng thử lại sau.");
      }
    },
    [unreactBlog, isSignedIn, user]
  );

  return {
    isReacting,
    isUnreacting,
    isLoading: isReacting || isUnreacting,

    handleReactBlog,
    handleUnreactBlog,
  };
};

export default useReactionActions;