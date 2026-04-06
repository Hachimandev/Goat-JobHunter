import useReactionActions from "@/hooks/useReactionActions";
import { ReactionType } from "@/types/enum";
import { Blog } from "@/types/model";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/Feather";
import { ReactionButton } from "./ReactionButton";

interface BlogActivityProps {
  blog: Blog;
  initialReaction: string | null | undefined;
  onCommentClick?: () => void;
}

const BlogActivity = ({
  blog,
  onCommentClick,
  initialReaction,
}: BlogActivityProps) => {
  const { handleReactBlog, handleUnreactBlog } = useReactionActions();

  const handleReactionChange = (reactionId: string | null) => {
    if (reactionId) {
      handleReactBlog(blog.blogId, reactionId as ReactionType);
    } else {
      handleUnreactBlog(blog.blogId);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.leftStats}>
        {/* Reaction Button - Logic chọn cảm xúc */}
        <ReactionButton
          totalReactions={blog.activity?.totalLikes || 0}
          onReactionChange={handleReactionChange}
          initialReaction={initialReaction}
        />

        {/* Comment Button */}
        <TouchableOpacity style={styles.statItem} onPress={onCommentClick}>
          <Icon name="message-circle" size={18} color="#666" />
          <Text style={styles.statText}>
            {blog.activity?.totalComments || 0}
          </Text>
        </TouchableOpacity>
      </View>

      {/* View Count */}
      <View style={styles.statItem}>
        <Icon name="eye" size={18} color="#666" />
        <Text style={styles.statText}>
          {blog.activity?.totalReads || 0} lượt xem
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingTop: 10,
    borderTopWidth: 0.5,
    borderTopColor: "#ddd",
    marginTop: 5,
  },
  leftStats: {
    flexDirection: "row",
    gap: 20,
    alignItems: "center",
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  statText: {
    fontSize: 13,
    color: "#65676b",
    fontWeight: "500",
  },
});

export default BlogActivity;
