import { MessageType } from "@/types/model";
import { Ionicons } from "@expo/vector-icons";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { useVideoPlayer, VideoView } from "expo-video";
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
enum MessageEvent {
  MEMBER_ADDED = "MEMBER_ADDED",
  MEMBER_REMOVED = "MEMBER_REMOVED",
  MEMBER_LEFT = "MEMBER_LEFT",
  ROLE_CHANGED = "ROLE_CHANGED",
  GROUP_CREATED = "GROUP_CREATED",
  GROUP_NAME_CHANGED = "GROUP_NAME_CHANGED",
  GROUP_AVATAR_CHANGED = "GROUP_AVATAR_CHANGED",
  MESSAGE_PINNED = "MESSAGE_PINNED",
  MESSAGE_UNPINNED = "MESSAGE_UNPINNED",
}

const getEventIcon = (content: string) => {
  if (content.includes("MESSAGE_PINNED")) return "pin";
  if (content.includes("MESSAGE_UNPINNED")) return "pin-outline";
  if (content.includes("MEMBER_ADDED")) return "person-add";
  if (content.includes("MEMBER_REMOVED") || content.includes("MEMBER_LEFT"))
    return "person-remove";
  if (content.includes("GROUP")) return "people";
  return "information-circle";
};

const extractSystemContent = (content: string) => {
  return content
    .replace(/\(event:.*?\)\s*/g, "")
    .split("(Xem")[0]
    .trim();
};

const extractMessageId = (content: string) => {
  const match = content.match(/msg_([a-z0-9]+)/);
  return match ? `msg_${match[1]}` : null;
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
  const player = useVideoPlayer(content, (player) => {
    player.loop = false;
    player.muted = false;
  });

  if (isSystem) {
    const iconName = getEventIcon(content) as any;
    const displayBody = extractSystemContent(content);
    const pinnedMsgId = extractMessageId(content);

    const timeAgo = formatDistanceToNow(new Date(item.createdAt), {
      addSuffix: true,
      locale: vi,
    }).replace("khoảng ", "");

    return (
      <View style={styles.systemMessageContainer}>
        <View style={styles.systemMessageRow}>
          <Ionicons
            name={iconName}
            size={13}
            color="#666"
            style={{ marginRight: 6 }}
          />

          <Text numberOfLines={2} style={styles.systemMessageText}>
            <Text>{displayBody}</Text>
            {content.includes("MESSAGE_PINNED") && pinnedMsgId && (
              <Text
                style={styles.viewPinnedBtn}
                onPress={() => onNavigateToMessage?.(pinnedMsgId)}
              >
                {" "}
                Xem
              </Text>
            )}
            <Text style={styles.systemTimeText}> • {timeAgo}</Text>
          </Text>
        </View>
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
        <TouchableOpacity
          activeOpacity={0.9}
          onLongPress={() => onLongPress(item)}
          delayLongPress={200}
        >
          <VideoView
            style={styles.videoPlayer}
            player={player}
            allowsFullscreen
            allowsPictureInPicture
          />
        </TouchableOpacity>
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
  videoPlayer: {
    width: 220,
    height: 160,
    borderRadius: 15,
    backgroundColor: "#000",
  },

  fileBox: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
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
    width: "100%",
    alignItems: "center",
    marginVertical: 10,
    paddingHorizontal: 10,
  },
  systemMessageRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center", // Căn giữa nội dung
    backgroundColor: "#F0F2F5",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    maxWidth: "95%", // Cho phép nở rộng ra gần hết màn hình
  },
  systemMessageText: {
    fontSize: 12,
    color: "#4B5563",
    textAlign: "center", // Căn giữa chữ bên trong
    flexShrink: 1,
  },
  viewPinnedBtn: {
    color: "#059669",
    fontWeight: "bold",
  },
  systemTimeText: {
    color: "#9CA3AF",
    fontSize: 11,
  },
});
