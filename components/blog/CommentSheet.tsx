import { useGetCommentsByBlogIdQuery } from "@/services/blog/blogApi";
import { formatComments } from "@/utils/formatComments";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Icon from "react-native-vector-icons/Feather";
import CommentInput from "./CommentInput";
import CommentItem from "./CommentItem";

export default function CommentSheet({ isVisible, onClose, blogId }: any) {
  const [replyTarget, setReplyTarget] = useState<{
    commentId: number;
    name: string;
  } | null>(null);

  const { data: commentData, isLoading } = useGetCommentsByBlogIdQuery(blogId, {
    skip: !isVisible,
  });

  const nestedComments = useMemo(
    () => formatComments(commentData?.data || []),
    [commentData],
  );

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <Pressable
          style={styles.sheetContent}
          onPress={(e) => e.stopPropagation()}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={{ flex: 1 }}
            keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
          >
            <View style={styles.header}>
              <View style={styles.dragHandle} />
              <View style={styles.titleRow}>
                <Text style={styles.title}>Bình luận</Text>
                <TouchableOpacity onPress={onClose}>
                  <Icon name="x" size={24} color="#000" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={{ flex: 1, marginTop: 10 }}>
              <FlatList
                data={nestedComments}
                keyExtractor={(item) => item.commentId.toString()}
                renderItem={({ item }) => (
                  <CommentItem
                    comment={item}
                    blogId={blogId}
                    onReply={(target: any) => setReplyTarget(target)}
                  />
                )}
                contentContainerStyle={styles.listPadding}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                  !isLoading ? (
                    <Text style={styles.emptyText}>Chưa có bình luận nào</Text>
                  ) : null
                }
              />
            </View>
            <View style={styles.inputStickyBottom}>
              {replyTarget && (
                <View style={styles.replyIndicator}>
                  <Text style={styles.replyText}>
                    Đang trả lời {replyTarget.name}
                  </Text>
                  <TouchableOpacity onPress={() => setReplyTarget(null)}>
                    <Icon name="x-circle" size={16} color="#666" />
                  </TouchableOpacity>
                </View>
              )}
              <CommentInput
                blogId={blogId}
                replyTo={replyTarget}
                onCancelReply={() => setReplyTarget(null)}
              />
            </View>
          </KeyboardAvoidingView>
        </Pressable>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  sheetContent: {
    backgroundColor: "#fff",
    height: "75%",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: "hidden",
  },
  header: {
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  dragHandle: {
    width: 40,
    height: 5,
    backgroundColor: "#ccc",
    borderRadius: 3,
    marginBottom: 10,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 16,
  },
  title: { fontSize: 17, fontWeight: "bold" },
  listPadding: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    paddingBottom: 30,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 40,
    color: "#999",
    fontSize: 14,
  },
  inputStickyBottom: {
    borderTopWidth: 1,
    borderTopColor: "#eee",
    padding: 12,
    paddingBottom: Platform.OS === "ios" ? 35 : 12,
    backgroundColor: "#fff",
  },
  replyIndicator: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f0f2f5",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 8,
  },
  replyText: { fontSize: 12, color: "#1976d2", fontStyle: "italic" },
});
