import dayjs from "dayjs";
import { Image } from "expo-image";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function CommentItem({
  comment,
  isReply = false,
}: {
  comment: any;
  isReply?: boolean;
}) {
  return (
    <View style={[styles.container, isReply && styles.replyMargin]}>
      <Image
        source={{ uri: comment?.user?.avatar }}
        style={isReply ? styles.avatarSmall : styles.avatar}
      />
      <View style={styles.rightContent}>
        <View style={styles.bubble}>
          <Text style={styles.userName}>{comment?.user?.fullName}</Text>
          <Text style={styles.commentText}>{comment?.comment}</Text>
        </View>
        <View style={styles.actionRow}>
          <Text style={styles.time}>{dayjs(comment?.createdAt).fromNow()}</Text>
          <TouchableOpacity>
            <Text style={styles.actionBtn}>Thích</Text>
          </TouchableOpacity>
          <TouchableOpacity>
            <Text style={styles.actionBtn}>Trả lời</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: "row", paddingHorizontal: 16, marginBottom: 12 },
  replyMargin: { marginLeft: 48, marginTop: 8 },
  avatar: { width: 36, height: 36, borderRadius: 18 },
  avatarSmall: { width: 28, height: 28, borderRadius: 14 },
  rightContent: { flex: 1, marginLeft: 10 },
  bubble: {
    backgroundColor: "#f0f2f5",
    padding: 12,
    borderRadius: 18,
    borderTopLeftRadius: 2,
  },
  userName: { fontWeight: "bold", fontSize: 13, marginBottom: 2 },
  commentText: { fontSize: 14, color: "#050505", lineHeight: 20 },
  actionRow: { flexDirection: "row", marginTop: 4, marginLeft: 4 },
  time: { fontSize: 12, color: "#65676b", marginRight: 15 },
  actionBtn: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#65676b",
    marginRight: 15,
  },
});
