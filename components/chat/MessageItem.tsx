import { MessageType } from "@/types/model";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface MessageItemProps {
  item: MessageType;
  isMe: boolean;
  onLongPress: (item: any) => void;
  isSending?: boolean;
}

const isS3ImageUrl = (url: string) => {
  return (
    typeof url === "string" &&
    url.includes("amazonaws.com") &&
    url.match(/\.(jpeg|jpg|gif|png)$/i) != null
  );
};

export const MessageItem = ({
  item,
  isMe,
  onLongPress,
  isSending,
}: MessageItemProps) => {
  const isSystem = item.messageType === "SYSTEM";
  const content = item.content || "";
  const isS3Image = isS3ImageUrl(content);
  const isRevoked = !content && !isSystem;

  if (isSystem) {
    return (
      <View style={styles.systemMessageContainer}>
        <Text style={styles.systemMessageText}>{content}</Text>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.messageWrapper,
        { alignItems: isMe ? "flex-end" : "flex-start" },
      ]}
    >
      <TouchableOpacity
        onLongPress={() => onLongPress(item)}
        activeOpacity={0.8}
        style={{ maxWidth: "80%" }}
        disabled={isRevoked}
      >
        {isS3Image ? (
          <View>
            {item.replyContext && (
              <View
                style={[
                  styles.replyInBubble,
                  isMe ? { backgroundColor: "rgba(255,255,255,0.1)" } : null,
                ]}
              >
                <Text style={styles.replyInBubbleName}>
                  {item.replyContext.originalSender?.fullName}
                </Text>
                <Text numberOfLines={1} style={styles.replyInBubbleText}>
                  {item.replyContext.contentPreview}
                </Text>
              </View>
            )}
            <Image
              source={{ uri: content }}
              style={[styles.chatImage, isSending && { opacity: 0.7 }]}
            />
          </View>
        ) : (
          <View
            style={[
              styles.bubble,
              isRevoked
                ? styles.revokedBubble
                : isMe
                  ? styles.myBubble
                  : styles.otherBubble,
              isSending && { opacity: 0.7 },
            ]}
          >
            {item.replyContext && !isRevoked && (
              <View
                style={[
                  styles.replyInBubble,
                  isMe
                    ? {
                        borderLeftColor: "#fff",
                        backgroundColor: "rgba(255,255,255,0.2)",
                      }
                    : null,
                ]}
              >
                <Text
                  style={[styles.replyInBubbleName, isMe && { color: "#fff" }]}
                >
                  {item.replyContext.originalSender?.fullName}
                </Text>
                <Text
                  numberOfLines={1}
                  style={[styles.replyInBubbleText, isMe && { color: "#eee" }]}
                >
                  {item.replyContext.contentPreview}
                </Text>
              </View>
            )}

            <Text
              style={[
                styles.messageText,
                isRevoked
                  ? styles.revokedText
                  : { color: isMe ? "#fff" : "#000" },
              ]}
            >
              {isRevoked ? "Tin nhắn đã được thu hồi" : content}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  messageWrapper: { marginVertical: 4, width: "100%" },
  systemMessageContainer: {
    alignItems: "center",
    marginVertical: 10,
    width: "100%",
  },
  systemMessageText: {
    backgroundColor: "#E8E8E8",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 11,
    color: "#666",
    overflow: "hidden",
  },
  bubble: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    minHeight: 35,
    justifyContent: "center",
  },
  myBubble: { backgroundColor: "#0084FF", borderBottomRightRadius: 4 },
  otherBubble: {
    backgroundColor: "#F0F0F0",
    borderBottomLeftRadius: 4,
    borderWidth: 0.5,
    borderColor: "#E8E8E8",
  },
  revokedBubble: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  messageText: { fontSize: 16, lineHeight: 22 },
  revokedText: { color: "#999999", fontStyle: "italic", fontSize: 14 },
  chatImage: {
    width: 220,
    height: 160,
    borderRadius: 15,
    marginVertical: 4,
    resizeMode: "cover",
  },
  replyInBubble: {
    backgroundColor: "rgba(0,0,0,0.05)",
    borderLeftWidth: 3,
    borderLeftColor: "#0084FF",
    padding: 5,
    borderRadius: 4,
    marginBottom: 5,
  },
  replyInBubbleName: { fontSize: 11, fontWeight: "bold", color: "#0084FF" },
  replyInBubbleText: { fontSize: 11, color: "#555" },
});
