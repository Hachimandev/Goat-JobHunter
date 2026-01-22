import { NestedComment } from "@/utils/formatComments";
import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import CommentItem from "./CommentItem";

interface CommentSectionProps {
  comments: NestedComment[];
  blogId: number;
  isLoading: boolean;
  isError: boolean;
}

export default function CommentSection({
  comments,
  blogId,
  isLoading,
  isError,
}: CommentSectionProps) {
  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#1976d2" />
        <Text style={styles.infoText}>Đang tải bình luận...</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.centerContainer}>
        <Text style={[styles.infoText, { color: "#ef4444" }]}>
          Không thể tải bình luận. Vui lòng thử lại sau.
        </Text>
      </View>
    );
  }

  if (comments.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Chưa có bình luận nào.</Text>
        <Text style={styles.subEmptyText}>
          Hãy là người đầu tiên chia sẻ cảm nghĩ!
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>
        Tất cả bình luận ({comments.length})
      </Text>
      {comments.map((comment) => (
        <CommentItem
          key={comment.commentId}
          comment={comment}
          blogId={blogId}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 16,
    marginTop: 10,
  },
  centerContainer: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  infoText: {
    marginTop: 10,
    fontSize: 14,
    color: "#6b7280",
  },
  emptyContainer: {
    padding: 60,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
  },
  subEmptyText: {
    fontSize: 14,
    color: "#9ca3af",
    marginTop: 4,
  },
});
