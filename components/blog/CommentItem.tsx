import dayjs from "dayjs";
import { Image } from "expo-image";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import CommentInput from "./CommentInput";

export default function CommentItem({ comment, blogId, isReply = false }: any) {
  const [showReplyInput, setShowReplyInput] = useState(false);

  return (
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
});
