import { useUser } from "@/hooks/useUser";
import {
  useReactBlogMutation,
  useUnreactBlogMutation,
} from "@/services/reaction/reactionApi";
import { ReactionType } from "@/types/enum";
import { useCallback } from "react";
import { Alert, Platform, ToastAndroid } from "react-native";

const notify = (message: string) => {
  if (Platform.OS === "android") {
    ToastAndroid.show(message, ToastAndroid.SHORT);
  } else {
    Alert.alert("Thông báo", message);
  }
};

const useReactionActions = () => {
  const { isSignedIn, user } = useUser();

  // KIỂM TRA CẤU TRÚC NÀY: Phải là mảng [ ]
  const [reactBlog, { isLoading: isReacting }] = useReactBlogMutation();
  const [unreactBlog, { isLoading: isUnreacting }] = useUnreactBlogMutation();

  const handleReactBlog = useCallback(
    async (blogId: number, reactionType: ReactionType) => {
      if (!isSignedIn) return;
      try {
        await reactBlog({ blogId, reactionType }).unwrap();
      } catch (error) {
        console.error(error);
      }
    },
    [reactBlog, isSignedIn],
  );

  const handleUnreactBlog = useCallback(
    async (blogId: number) => {
      if (!isSignedIn) return;
      try {
        await unreactBlog({ blogIds: [blogId] }).unwrap();
      } catch (error) {
        console.error(error);
      }
    },
    [unreactBlog, isSignedIn],
  );

  return {
    handleReactBlog,
    handleUnreactBlog,
    isLoading: isReacting || isUnreacting,
  };
};

export default useReactionActions;
