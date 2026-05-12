import { MessageType } from "@/types/model";
import { Ionicons } from "@expo/vector-icons";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { useVideoPlayer, VideoView } from "expo-video";
import React, { useMemo, useState } from "react";
import {
  Image,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import ImageView from "react-native-image-viewing";
import { PollItem } from "./PollItem";
import { MessageReactionPicker } from "./MessageReactionPicker";
import { MessageReactionBar } from "./MessageReactionBar";
import { useMessageReactionActions } from "../../hooks/useMessageReactionActions";

interface MessageItemProps {
  item: MessageType;
  isMe: boolean;
  onLongPress: (item: any) => void;
  onNavigateToMessage?: (messageId: string) => void;
  isSending?: boolean;
  currentUser?: any;
  showPoll?: boolean;
  isGroupChat?: boolean;
}

const isS3ImageUrl = (url: string) =>
  typeof url === "string" &&
  url.includes("amazonaws.com") &&
  /\.(jpeg|jpg|gif|png)$/i.test(url);

const isS3VideoUrl = (url: string) =>
  typeof url === "string" &&
  url.includes("amazonaws.com") &&
  /\.(mp4|mov|avi|wmv)$/i.test(url);

const isS3FileUrl = (url: string) =>
  typeof url === "string" &&
  url.includes("amazonaws.com") &&
  /\.(pdf|doc|docx|xls|xlsx|ppt|pptx|txt|zip|rar)$/i.test(url);

export const MessageItem = ({
  item,
  isMe,
  onLongPress,
  onNavigateToMessage,
  isSending,
  currentUser,
  showPoll = false,
  isGroupChat = false,
}: MessageItemProps) => {
  const [visible, setIsVisible] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);

  const { handleReaction, handleRemove } = useMessageReactionActions(
    Number(item.chatRoomId),
  );
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const handleSelectReaction = async (emoji: string) =>
    await handleReaction(item.messageId, emoji);
  const handleBarClick = async (emoji: string) =>
    await handleRemove(item.messageId, emoji);

  const isSystem = item.messageType === "SYSTEM";
  const content = item.content || "";
  const isS3Image = isS3ImageUrl(content);
  const isS3Video = isS3VideoUrl(content);
  const isS3File = isS3FileUrl(content);
  const isRevoked = item.isHidden === true;

  const player = useVideoPlayer(content, (player) => {
    player.loop = false;
    player.muted = false;
  });

  const MAX_VISIBLE_MEDIA = 4;

  const images = useMemo(() => {
    if (item.mediaItems && item.mediaItems.length > 0) {
      return item.mediaItems.map((img) => ({ uri: img.url }));
    }
    if (isS3Image) return [{ uri: content }];
    return [];
  }, [item.mediaItems, isS3Image, content]);

  const getEventConfig = (content: string) => {
    if (content.includes("MESSAGE_PINNED"))
      return { icon: "pin", color: "#059669", bg: "#ECFDF5" };
    if (content.includes("MESSAGE_UNPINNED"))
      return { icon: "pin-outline", color: "#6B7280", bg: "#F3F4F6" };
    if (content.includes("MEMBER_ADDED"))
      return { icon: "person-add", color: "#2563EB", bg: "#EFF6FF" };
    if (content.includes("MEMBER_REMOVED") || content.includes("MEMBER_LEFT"))
      return { icon: "person-remove", color: "#DC2626", bg: "#FEF2F2" };
    if (content.includes("ROLE_CHANGED"))
      return { icon: "shield-checkmark", color: "#7C3AED", bg: "#F5F3FF" };
    if (content.includes("GROUP_CREATED"))
      return { icon: "apps-outline", color: "#F59E0B", bg: "#FFFBEB" };
    if (content.includes("GROUP"))
      return { icon: "people", color: "#4B5563", bg: "#F9FAFB" };
    return { icon: "information-circle", color: "#6B7280", bg: "#F3F4F6" };
  };

  const isPoll = item.messageType === "POLL";

  const extractSystemContent = (content: string) => {
    return content
      .replace(/\(event:.*?\)\s*/g, "")
      .split("(Xem")[0]
      .trim();
  };

  const extractPinnedId = (content: string) => {
    const match = content.match(/msg_([a-z0-9]+)/);
    return match ? `msg_${match[1]}` : null;
  };

  const handleOpenImage = (index: number) => {
    setImageIndex(index);
    setIsVisible(true);
  };

  // --- Helper Render từng tấm ảnh ---
  const renderImageItem = (
    url: string,
    index: number,
    containerStyle: any,
    isGrid = false,
  ) => {
    const totalMedia = item.mediaItems?.length || 0;
    const remaining = totalMedia - MAX_VISIBLE_MEDIA;

    return (
      <TouchableOpacity
        key={index}
        activeOpacity={0.9}
        style={containerStyle}
        onPress={() => handleOpenImage(index)}
        onLongPress={() => onLongPress(item)}
      >
        <Image source={{ uri: url }} style={styles.fullSize} />
        {isGrid && index === MAX_VISIBLE_MEDIA - 1 && remaining > 0 && (
          <View style={styles.overlay}>
            <Text style={styles.overlayText}>+{remaining}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderMainContent = () => {
    if (isRevoked)
      return <Text style={styles.revokedText}>Tin nhắn đã được thu hồi</Text>;

    if (isPoll) {
      return (
        <View>
          <View style={styles.pollEventContainer}>
            <Ionicons name="bar-chart" size={14} color="#0084FF" />
            <Text style={styles.pollEventText}>
              {extractSystemContent(item.content)}
            </Text>
            <TouchableOpacity onPress={() => onLongPress(item)}>
              <Text style={styles.viewLink}> Xem</Text>
            </TouchableOpacity>
          </View>

          {showPoll && (
            <View style={{ marginTop: 10 }}>
              <PollItem
                message={item}
                onOpenVote={(pollData: any) =>
                  onLongPress({ ...item, poll: pollData })
                }
              />
            </View>
          )}
        </View>
      );
    }

    if (isS3Video) {
      return (
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => onLongPress(item)}
          onLongPress={() => onLongPress(item)}
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

    if (item.mediaItems && item.mediaItems.length > 0) {
      const photos = item.mediaItems;
      if (photos.length === 1)
        return renderImageItem(photos[0].url, 0, styles.chatImage);

      if (photos.length === 3) {
        return (
          <View style={styles.mediaHorizontal}>
            {photos.map((p, i) =>
              renderImageItem(p.url, i, styles.horizontalImageItem),
            )}
          </View>
        );
      }

      return (
        <View style={styles.mediaGrid}>
          {photos
            .slice(0, MAX_VISIBLE_MEDIA)
            .map((p, i) =>
              renderImageItem(p.url, i, styles.gridItemContainer, true),
            )}
        </View>
      );
    }

    if (isS3Image) return renderImageItem(content, 0, styles.chatImage);

    if (isS3File) {
      const fileName = content.split("/").pop()?.split("-").pop() || "Tài liệu";
      return (
        <TouchableOpacity
          style={styles.fileBox}
          onPress={() => Linking.openURL(content)}
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

  const renderReplyHeaderLabel = () => {
    if (!item.replyContext || isRevoked) return null;
    return (
      <View
        style={[styles.replyHeaderRow, isMe && { justifyContent: "flex-end" }]}
      >
        <Ionicons name="arrow-undo" size={12} color="#888" />
        <Text style={styles.replyHeaderText} numberOfLines={1}>
          {isMe ? "Bạn" : item.sender?.fullName} đã trả lời{" "}
          {item.replyContext.originalSender?.fullName}
        </Text>
      </View>
    );
  };

  const renderForwardLabel = () => {
    if (!item.isForwarded || isRevoked) return null;
    return (
      <View
        style={[
          styles.forwardHeaderRow,
          isMe && { justifyContent: "flex-end" },
        ]}
      >
        <Ionicons name="arrow-redo" size={12} color="#888" />
        <Text style={styles.forwardHeaderText}>
          {isMe ? "Bạn đã chuyển tiếp" : "Được chuyển tiếp"}
        </Text>
      </View>
    );
  };

  // --- UI TIN NHẮN HỆ THỐNG ---
  if (isSystem) {
    const config = getEventConfig(content);
    const displayBody = extractSystemContent(content);
    const pinnedMsgId = extractPinnedId(content);
    const timeAgo = formatDistanceToNow(new Date(item.createdAt), {
      locale: vi,
    }).replace("khoảng ", "");

    return (
      <View style={styles.systemMessageContainer}>
        <View style={[styles.systemMessageRow, { backgroundColor: config.bg }]}>
          <Ionicons
            name={config.icon as any}
            size={14}
            color={config.color}
            style={{ marginRight: 6 }}
          />
          <Text style={styles.systemMessageText} numberOfLines={2}>
            <Text style={{ color: "#374151", fontWeight: "500" }}>
              {displayBody}
            </Text>
            {pinnedMsgId && (
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

  return (
    <View
      style={[
        styles.messageWrapper,
        { alignItems: isMe ? "flex-end" : "flex-start" },
      ]}
    >
      {isGroupChat && !isMe && (
        <Text style={styles.senderNameTop}>{item.sender?.fullName}</Text>
      )}
      <View
        style={[
          // styles.rowContainer,
          isPoll ? styles.pollWrapper : styles.bubbleContainer,
          isMe ? { flexDirection: "row-reverse" } : { flexDirection: "row" },
        ]}
      >
        {!isMe && (
          <Image
            source={{ uri: item.sender?.avatar }}
            style={styles.smallAvatar}
          />
        )}

        <TouchableOpacity
          onLongPress={() => onLongPress(item)}
          onPress={() => {
            if (!isRevoked && !isPoll) {
              setShowReactionPicker(true);
            }
          }}
          activeOpacity={0.8}
          style={{ maxWidth: "85%" }}
          disabled={isRevoked || isPoll}
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
                item.mediaItems?.length || isS3Image || isS3Video || isPoll
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

      <View style={{ marginTop: 4, marginLeft: isMe ? 0 : 30 }}>
        <MessageReactionBar
          reactions={item.reactions || []}
          currentUserId={currentUser?.accountId}
          onReactionClick={handleBarClick}
        />
      </View>

      <MessageReactionPicker
        visible={showReactionPicker}
        onClose={() => setShowReactionPicker(false)}
        onSelect={handleSelectReaction}
      />

      <ImageView
        images={images}
        imageIndex={imageIndex}
        visible={visible}
        onRequestClose={() => setIsVisible(false)}
        swipeToCloseEnabled={true}
        doubleTapToZoomEnabled={true}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  fullSize: { width: "100%", height: "100%", resizeMode: "cover" },
  horizontalImageItem: { flex: 1 },
  messageWrapper: { marginVertical: 6, width: "100%" },
  rowContainer: { alignItems: "flex-end", gap: 8 },
  smallAvatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    marginBottom: 2,
    marginRight: 4,
  },
  bubbleContainer: { width: "100%" },
  bubble: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    minWidth: 60,
    justifyContent: "center",
  },
  myBubble: { backgroundColor: "#0084FF", borderBottomRightRadius: 20 },
  otherBubble: {
    backgroundColor: "#F0F0F0",
    borderBottomLeftRadius: 20,
    borderWidth: 0.5,
    borderColor: "#E8E8E8",
  },
  bubbleWithReply: { marginTop: -14 },

  // Media Styles
  mediaContainer: {
    borderRadius: 15,
    overflow: "hidden",
    backgroundColor: "transparent",
  },
  chatImage: { width: 220, height: 160, borderRadius: 15 },
  mediaHorizontal: {
    flexDirection: "row",
    gap: 2,
    borderRadius: 15,
    height: 100,
    overflow: "hidden",
    width: 240,
  },
  mediaGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 2,
    borderRadius: 15,
    overflow: "hidden",
    width: 220,
  },
  gridItemContainer: { width: "49.2%", aspectRatio: 1, position: "relative" },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  overlayText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  videoPlayer: {
    width: 220,
    height: 160,
    borderRadius: 15,
    backgroundColor: "#000",
  },

  // File & Text
  fileBox: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    minWidth: 160,
  },
  fileName: { fontSize: 14, fontWeight: "500" },
  messageText: { fontSize: 16, lineHeight: 22 },
  revokedBubble: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  revokedText: { color: "#999", fontStyle: "italic", fontSize: 14 },

  // Labels
  replyHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 4,
    paddingHorizontal: 8,
  },
  replyHeaderText: { fontSize: 11, color: "#888", fontStyle: "italic" },
  forwardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 2,
    paddingHorizontal: 8,
  },
  forwardHeaderText: { fontSize: 11, color: "#888", fontStyle: "italic" },

  // Reply
  replyQuoteBox: {
    padding: 10,
    paddingBottom: 22,
    borderRadius: 15,
    backgroundColor: "#E5E7EB",
  },
  myReplyQuote: { backgroundColor: "#D1D5DB" },
  otherReplyQuote: { backgroundColor: "#E5E7EB" },
  replyQuoteText: { fontSize: 13, color: "#4B5563" },

  // System Message (Nâng cấp UI)
  systemMessageContainer: {
    width: "100%",
    alignItems: "center",
    marginVertical: 10,
    paddingHorizontal: 10,
  },
  systemMessageRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    maxWidth: "95%",
  },
  systemMessageText: { fontSize: 12, textAlign: "center", flexShrink: 1 },
  viewPinnedBtn: { color: "#059669", fontWeight: "bold" },
  systemTimeText: { color: "#9CA3AF", fontSize: 11 },

  pollWrapper: { width: "100%", alignItems: "center", marginVertical: 10 },
  pollEventContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F2F5",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  pollEventText: { fontSize: 12, color: "#4B5563", marginLeft: 6 },
  viewLink: { fontSize: 12, color: "#0084FF", fontWeight: "bold" },
  senderNameTop: {
    fontSize: 12,
    color: "#666",
    marginBottom: 2,
    marginLeft: 38,
  },
});
