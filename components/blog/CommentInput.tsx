import useCommentActions from "@/hooks/useCommentActions";
import { useUser } from "@/hooks/useUser";
import { Image } from "expo-image";
import React, { useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Send } from 'lucide-react-native';

export default function CommentInput({ blogId, replyTo, onCancelReply }: any) {
  const { user } = useUser();
  const [text, setText] = useState("");
  const { handleCommentBlog, handleReplyComment, isCommenting } =
    useCommentActions();

  const onSend = async () => {
    if (!text.trim()) return;
    if (replyTo) {
      await handleReplyComment(blogId, replyTo.commentId, text);
      onCancelReply?.();
    } else {
      await handleCommentBlog(blogId, text);
    }
    setText("");
  };

  return (
    <View style={styles.container}>
      {!replyTo && (
        <Image source={{ uri: user?.avatar }} style={styles.myAvatar} />
      )}
      <TextInput
        style={styles.input}
        placeholder={
          replyTo ? `Trả lời ${replyTo.authorName}...` : "Viết bình luận..."
        }
        value={text}
        onChangeText={setText}
        multiline
      />
      <TouchableOpacity
        onPress={onSend}
        disabled={!text.trim() || isCommenting}
      >
        {isCommenting ? (
          <ActivityIndicator size="small" />
        ) : (
          <Send
            size={24}
            color={text.trim() ? "#1976d2" : "#ccc"}
          />
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 5,
    gap: 10,
  },
  myAvatar: { width: 32, height: 32, borderRadius: 16 },
  input: {
    flex: 1,
    backgroundColor: "#f0f2f5",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    maxHeight: 100,
  },
});
