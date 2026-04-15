import { MessageType } from "@/types/model";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Image,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface MessageItemProps {
  item: MessageType;
  isMe: boolean;
  onLongPress: (item: any) => void;
  onNavigateToMessage?: (messageId: string) => void;
  isSending?: boolean;
  currentUser?: any;
}

const isS3ImageUrl = (url: string) => {
  return (
    typeof url === "string" &&
    url.includes("amazonaws.com") &&
    url.match(/\.(jpeg|jpg|gif|png)$/i) != null
  );
};

const isS3VideoUrl = (url: string) => {
  return (
    typeof url === "string" &&
    url.includes("amazonaws.com") &&
    url.match(/\.(mp4|mov|avi|wmv)$/i) != null
  );
};

const isS3FileUrl = (url: string) => {
  return (
    typeof url === "string" &&
    url.includes("amazonaws.com") &&
    url.match(/\.(pdf|doc|docx|xls|xlsx|ppt|pptx|txt|zip|rar)$/i) != null
  );
};

export const MessageItem = ({
  item,
  isMe,
  onLongPress,
  onNavigateToMessage,
  isSending,
  currentUser,
}: MessageItemProps) => {
  const isSystem = item.messageType === "SYSTEM";
  const content = item.content || "";
  const isS3Image = isS3ImageUrl(content);
  const isS3Video = isS3VideoUrl(content);
  const isS3File = isS3FileUrl(content);
  const isRevoked = !content && !isSystem;

  if (isSystem) {
    return (
      <View style={styles.systemMessageContainer}>
        <Text style={styles.systemMessageText}>{content}</Text>
      </View>
    );
  }

  const renderReplyHeaderLabel = () => {
    if (!item.replyContext || isRevoked) return null;
    const isReplyToMe =
      item.replyContext.originalSender?.accountId === currentUser?.accountId;
    const replyTitle = isMe
      ? isReplyToMe
        ? "Bạn đã trả lời chính mình"
        : `Bạn đã trả lời ${item.replyContext.originalSender?.fullName}`
      : `${item.sender?.fullName} đã trả lời ${isReplyToMe ? "bạn" : item.replyContext.originalSender?.fullName}`;

    return (
      <View
        style={[
          styles.replyHeaderRow,
          isMe ? { justifyContent: "flex-end" } : null,
        ]}
      >
        <Ionicons name="arrow-undo" size={12} color="#888" />
        <Text style={styles.replyHeaderText}>{replyTitle}</Text>
      </View>
    );
  };

  const renderForwardLabel = () => {
    if (!item.isForwarded || isRevoked) return null;
    return (
      <View
        style={[
          styles.forwardHeaderRow,
          isMe ? { justifyContent: "flex-end" } : null,
        ]}
      >
        <Ionicons name="arrow-redo" size={12} color="#888" />
        <Text style={styles.forwardHeaderText}>
          {isMe ? "Bạn đã chuyển tiếp tin nhắn" : "Tin nhắn được chuyển tiếp"}
        </Text>
      </View>
    );
  };

  const renderMainContent = () => {
    if (isRevoked)
      return <Text style={styles.revokedText}>Tin nhắn đã được thu hồi</Text>;

    if (isS3Image) {
      return <Image source={{ uri: content }} style={styles.chatImage} />;
    }

    if (isS3Video) {
      return (
        <View style={styles.videoContainer}>
          <Ionicons
            name="play-circle"
            size={48}
            color="rgba(255,255,255,0.9)"
          />
          <Text style={styles.videoLabel}>Video</Text>
        </View>
      );
    }

    if (isS3File) {
      const fileName = content.split("/").pop()?.split("-").pop() || "Tài liệu";
      return (
        <TouchableOpacity
          style={styles.fileBox}
          onPress={() => Linking.openURL(content)}
          onLongPress={() => onLongPress(item)}
          delayLongPress={200}
        >
          <Ionicons
            name="document-text"
            size={30}
            color={isMe ? "#fff" : "#0084FF"}
          />
          <View style={{ flex: 1, marginLeft: 8 }}>
            <Text
              numberOfLines={1}
              style={[styles.fileName, { color: isMe ? "#fff" : "#000" }]}
            >
              {fileName}
            </Text>
            <Text style={{ fontSize: 10, color: isMe ? "#eee" : "#888" }}>
              Nhấn để tải về
            </Text>
          </View>
        </TouchableOpacity>
      );
    }

    return (
      <Text style={[styles.messageText, { color: isMe ? "#fff" : "#000" }]}>
        {content}
      </Text>
    );
  };

  return (
    <View
      style={[
        styles.messageWrapper,
        { alignItems: isMe ? "flex-end" : "flex-start" },
      ]}
    >
      <View
        style={[
          styles.rowContainer,
          isMe ? { flexDirection: "row-reverse" } : { flexDirection: "row" },
        ]}
      >
        {!isMe && (
          <Image
            source={{
              uri: item.sender?.avatar,
            }}
            style={styles.smallAvatar}
          />
        )}

        <TouchableOpacity
          onLongPress={() => onLongPress(item)}
          activeOpacity={0.8}
          style={{ maxWidth: "85%" }}
          disabled={isRevoked}
        >
          {renderForwardLabel()}
          {renderReplyHeaderLabel()}

          <View style={styles.bubbleContainer}>
            {/* KHỐI TRÍCH DẪN REPLY */}
            {item.replyContext && !isRevoked && (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() =>
                  onNavigateToMessage?.(item.replyContext!.originalMessageId)
                }
                style={[
                  styles.replyQuoteBox,
                  isMe ? styles.myReplyQuote : styles.otherReplyQuote,
                ]}
              >
                <Text numberOfLines={1} style={styles.replyQuoteText}>
                  {item.replyContext.contentPreview || "Tin nhắn..."}
                </Text>
              </TouchableOpacity>
            )}

            {/* BONG BÓNG NỘI DUNG CHÍNH */}
            <View
              style={[
                isS3Image || isS3Video
                  ? styles.mediaContainer
                  : [
                      styles.bubble,
                      isMe ? styles.myBubble : styles.otherBubble,
                    ],
                isRevoked && styles.revokedBubble,
                item.replyContext && !isRevoked ? styles.bubbleWithReply : null,
                isSending && { opacity: 0.7 },
              ]}
            >
              {renderMainContent()}
            </View>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  messageWrapper: { marginVertical: 6, width: "100%" },
  rowContainer: { alignItems: "flex-end", gap: 8 },
  smallAvatar: { width: 26, height: 26, borderRadius: 13, marginBottom: 2 },
  bubbleContainer: { width: "100%" },
  bubble: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    minWidth: 60,
    justifyContent: "center",
  },
  myBubble: { backgroundColor: "#0084FF", borderBottomRightRadius: 4 },
  otherBubble: {
    backgroundColor: "#F0F0F0",
    borderBottomLeftRadius: 4,
    borderWidth: 0.5,
    borderColor: "#E8E8E8",
  },
  bubbleWithReply: { marginTop: -14 },

  // Media Styles
  mediaContainer: { borderRadius: 15, overflow: "hidden" },
  chatImage: {
    width: 220,
    height: 160,
    borderRadius: 15,
    resizeMode: "cover",
    borderWidth: 0.5,
    borderColor: "#EEE",
  },
  videoContainer: {
    width: 220,
    height: 150,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  videoLabel: {
    color: "#fff",
    fontSize: 10,
    position: "absolute",
    bottom: 5,
    left: 10,
  },

  // File Styles
  fileBox: {
    flexDirection: "row",
    alignItems: "center",
    padding: 2,
    minWidth: 160,
  },
  fileName: { fontSize: 14, fontWeight: "500" },

  // Reply Styles
  replyQuoteBox: {
    padding: 10,
    paddingBottom: 22,
    borderRadius: 15,
    backgroundColor: "#E5E7EB",
  },
  myReplyQuote: { backgroundColor: "#D1D5DB" },
  otherReplyQuote: { backgroundColor: "#E5E7EB" },
  replyQuoteText: { fontSize: 13, color: "#4B5563" },
  replyHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 4,
    paddingHorizontal: 8,
  },
  replyHeaderText: { fontSize: 11, color: "#888", fontStyle: "italic" },

  // Forward Styles
  forwardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 2,
    paddingHorizontal: 8,
  },
  forwardHeaderText: { fontSize: 11, color: "#888", fontStyle: "italic" },

  // System & Revoked
  messageText: { fontSize: 16, lineHeight: 22 },
  revokedBubble: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  revokedText: { color: "#999", fontStyle: "italic", fontSize: 14 },
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
  },
});
