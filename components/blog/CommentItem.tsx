import useCommentActions from "@/hooks/useCommentActions";
import { useUser } from "@/hooks/useUser";
import dayjs from "dayjs";
import { Image } from "expo-image";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/Feather";
import CommentInput from "./CommentInput";
import ReportTicketModal from "./ReportTicketModal";

export default function CommentItem({ comment, blogId, isReply = false }: any) {
  const { user } = useUser();
  const { handleDeleteComment } = useCommentActions();
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [isReportVisible, setReportVisible] = useState(false);

  const isOwner = user && user.accountId === comment.commentedBy?.accountId;
  const handleDelete = async () => {
    try {
      await handleDeleteComment(comment.commentId);
      console.log("Đã kích hoạt xóa bình luận ID:", comment.commentId);
    } catch (error) {
      console.error("Lỗi khi test xóa:", error);
    }
  };
  // const confirmDelete = () => {
  //   Alert.alert("Xóa bình luận?", "Hành động này không thể hoàn tác.", [
  //     { text: "Hủy", style: "cancel" },
  //     {
  //       text: "Xóa",
  //       style: "destructive",
  //       onPress: async () => await handleDeleteComment(comment.commentId),
  //     },
  //   ]);
  // };
  return (
    <>
      <View style={[styles.wrapper, isReply && styles.replyMargin]}>
        <View style={styles.mainRow}>
          <Image
            source={{ uri: comment.commentedBy?.avatar }}
            style={isReply ? styles.avatarSmall : styles.avatar}
          />
          <View style={styles.contentSection}>
            <View style={styles.bubble}>
              <Text style={styles.userName}>
                {comment.commentedBy?.fullName || "Ẩn danh"}
              </Text>
              {comment.parent && (
                <Text style={styles.replyToText}>
                  Trả lời{" "}
                  <Text style={{ fontWeight: "bold" }}>
                    {comment.parent.commentedBy?.fullName}
                  </Text>
                </Text>
              )}
              <Text style={styles.commentText}>{comment.comment}</Text>
            </View>

            <View style={styles.actionRow}>
              <Text style={styles.timeText}>
                {dayjs(comment.createdAt).fromNow()}
              </Text>
              <TouchableOpacity
                onPress={() => setShowReplyInput(!showReplyInput)}
              >
                <Text style={styles.actionText}>Trả lời</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setReportVisible(true)}>
                <Text style={styles.actionText}>Báo cáo</Text>
              </TouchableOpacity>
              {isOwner && (
                <TouchableOpacity
                  onPress={handleDelete}
                  style={styles.deleteBtn}
                >
                  <Icon name="trash-2" size={14} color="#ef4444" />
                </TouchableOpacity>
              )}
              {/* {isOwner && (
                <TouchableOpacity
                  onPress={confirmDelete}
                  style={styles.deleteBtn}
                >
                  <Icon name="trash-2" size={14} color="#ef4444" />
                </TouchableOpacity>
              )} */}
            </View>

            {showReplyInput && (
              <View style={styles.inputSpacing}>
                <CommentInput
                  blogId={blogId}
                  replyTo={{
                    commentId: comment.commentId,
                    authorName: comment.commentedBy?.fullName,
                  }}
                  onCancelReply={() => setShowReplyInput(false)}
                />
              </View>
            )}
          </View>
        </View>

        {comment.replies && comment.replies.length > 0 && (
          <View style={styles.nestedContainer}>
            {comment.replies.map((reply: any) => (
              <CommentItem
                key={reply.commentId}
                comment={reply}
                blogId={blogId}
                isReply={true}
              />
            ))}
          </View>
        )}
      </View>
      <ReportTicketModal
        isVisible={isReportVisible}
        onClose={() => setReportVisible(false)}
        targetId={comment.commentId}
        targetType="comment"
      />
    </>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: 12 },
  replyMargin: { marginTop: 8 },
  mainRow: { flexDirection: "row" },
  avatar: { width: 36, height: 36, borderRadius: 18 },
  avatarSmall: { width: 28, height: 28, borderRadius: 14 },
  contentSection: { flex: 1, marginLeft: 10 },
  bubble: {
    backgroundColor: "#f0f2f5",
    padding: 10,
    borderRadius: 15,
    alignSelf: "flex-start",
    maxWidth: "95%",
  },
  userName: { fontWeight: "bold", fontSize: 13, marginBottom: 2 },
  commentText: { fontSize: 14, color: "#1c1e21", lineHeight: 20 },
  actionRow: { flexDirection: "row", marginTop: 4, gap: 15, paddingLeft: 5 },
  timeText: { fontSize: 12, color: "#65676b" },
  actionText: { fontSize: 12, fontWeight: "bold", color: "#65676b" },
  nestedContainer: {
    marginLeft: 20,
    borderLeftWidth: 1,
    borderLeftColor: "#eee",
    paddingLeft: 10,
    marginTop: 5,
  },
  inputSpacing: { marginTop: 10 },
  deleteBtn: { marginLeft: "auto", paddingRight: 10 },
  replyToText: { fontSize: 11, color: "#1976d2", marginBottom: 2 },
});
