import useChatActionsMobile from "@/hooks/useChatActionsMobile";
import { useNotificationManager } from "@/hooks/useNotificationManager";
import { useUser } from "@/hooks/useUser";
import {
  useDeleteMessagePermanentMutation,
  useFetchChatRoomsByIdQuery,
  useFetchChatRoomsQuery,
  useFetchMessagesInChatRoomQuery,
  useForwardMessageBatchMutation,
  useRevokeMessageMutation,
} from "@/services/chatRoom/chatRoomApi";
import { usePinMessageMutation } from "@/services/chatRoom/pinned_message/pinnedMessageApi";
import {
  useBlockUserMutation,
  useUnblockUserMutation,
} from "@/services/friendship/friendshipApi";
import { ChatRoomType } from "@/types/enum";
import { MessageType } from "@/types/model";
import { Ionicons } from "@expo/vector-icons";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import * as ImagePicker from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import EmojiPicker from "rn-emoji-keyboard";

interface OptimisticMessage extends Partial<MessageType> {
  messageId: string;
  sending?: boolean;
  replyContext?: MessageType["replyContext"];
}

export default function ChatDetail() {
  const { id, name } = useLocalSearchParams<{ id: string; name: string }>();
  const chatRoomId = Number(id);
  const { user } = useUser();
  const [text, setText] = useState("");
  const { handleSendMessage, pickImage, isSending } = useChatActionsMobile();
  const [revokeMessage] = useRevokeMessageMutation();
  const [deleteMessagePermanent] = useDeleteMessagePermanentMutation();
  const [blockUser] = useBlockUserMutation();
  const [unblockUser] = useUnblockUserMutation();
  const [replyTarget, setReplyTarget] = useState<MessageType | null>(null);
  const [pinMessage] = usePinMessageMutation();

  const [isForwardModalOpen, setIsForwardModalOpen] = useState(false);
  const [forwardMessageBatch] = useForwardMessageBatchMutation();

  // Lấy danh sách các phòng chat hiện có để chọn
  const { data: roomsRes } = useFetchChatRoomsQuery({ page: 1, size: 20 });
  const chatRooms = roomsRes?.data?.result || [];

  const handleForwardSubmit = async (targetRoomId: number) => {
    if (!selectedMessage) return;
    try {
      await forwardMessageBatch({
        sourceChatRoomId: chatRoomId,
        messageId: selectedMessage.messageId,
        targetChatRoomIds: [targetRoomId],
      }).unwrap();

      setIsForwardModalOpen(false);
      Alert.alert("Thành công", "Đã chuyển tiếp tin nhắn");
    } catch (error) {
      Alert.alert("Lỗi", "Không thể chuyển tiếp tin nhắn");
    }
  };

  // Notification manager
  const { setActiveChatRoom } = useNotificationManager();

  // Fetch chat room details to get blocked status
  const { data: chatRoomData } = useFetchChatRoomsByIdQuery(chatRoomId, {
    skip: !chatRoomId,
    pollingInterval: 5000,
  });
  const chatRoom = chatRoomData?.data;
  const isDirectBlocked =
    chatRoom?.type === ChatRoomType.DIRECT && Boolean(chatRoom?.blocked);
  const isBlockedByMe = isDirectBlocked && Boolean(chatRoom?.blockedByMe);

  // Set active chat room khi component mount/unmount
  useEffect(() => {
    setActiveChatRoom(chatRoomId);

    return () => {
      setActiveChatRoom(null);
    };
  }, [chatRoomId, setActiveChatRoom]);

  const [isEmojiOpen, setIsEmojiOpen] = useState(false);

  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["25%"], []);
  const [selectedMessage, setSelectedMessage] =
    useState<OptimisticMessage | null>(null);
  const [optimisticMessages, setOptimisticMessages] = useState<
    OptimisticMessage[]
  >([]);
  const [selectedImages, setSelectedImages] = useState<
    ImagePicker.ImagePickerAsset[]
  >([]);

  const isS3ImageUrl = (url: string) => {
    return (
      typeof url === "string" &&
      url.includes("amazonaws.com") &&
      url.match(/\.(jpeg|jpg|gif|png)$/i) != null
    );
  };

  const {
    data: messagesData,
    isLoading,
    refetch,
  } = useFetchMessagesInChatRoomQuery(
    { chatRoomId, size: 50, page: 0 },
    { skip: !chatRoomId, pollingInterval: 5000 },
  );

  const processedMessages = useMemo(() => {
    const serverMsgs = messagesData?.data ? [...messagesData.data] : [];
    const combined = [...optimisticMessages, ...serverMsgs];
    return combined.sort(
      (a, b) =>
        new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime(),
    );
  }, [messagesData, optimisticMessages]);

  const onSend = async () => {
    if (!text.trim() && selectedImages.length === 0) return;
    const contentToSend = text.trim();
    const replyId = replyTarget?.messageId || null;

    setText("");
    setSelectedImages([]);
    setReplyTarget(null);

    try {
      await handleSendMessage(
        chatRoomId,
        contentToSend,
        selectedImages,
        replyId,
      );
      refetch();
    } catch (e) {
      console.log("Send error", e);
    }
  };

  //revoke
  const handleRevoke = async (message: OptimisticMessage) => {
    try {
      await revokeMessage({
        chatRoomId,
        messageId: message.messageId!,
      }).unwrap();
      refetch();
    } catch (err) {
      console.log("Revoke error", err);
    }
  };

  //delete

  const handleDelete = async (message: OptimisticMessage) => {
    try {
      await deleteMessagePermanent({
        chatRoomId,
        messageId: message.messageId!,
      }).unwrap();
      // Xóa local optimistic message nếu cần
      setOptimisticMessages((prev) =>
        prev.filter((msg) => msg.messageId !== message.messageId),
      );
      refetch();
      bottomSheetRef.current?.close();
    } catch (err) {
      console.log("Delete error", err);
    }
  };

  const handleLongPress = (message: OptimisticMessage) => {
    setSelectedMessage(message);
    bottomSheetRef.current?.expand();
  };

  const handleBlockUser = async () => {
    try {
      const counterpartId = chatRoom?.counterpartAccountId;
      if (!counterpartId) return;

      await blockUser({
        targetUserId: counterpartId,
      }).unwrap();

      Alert.alert("Thành công", "Đã chặn người dùng này");
    } catch (error: any) {
      Alert.alert("Lỗi", error?.data?.message || "Không thể chặn người dùng");
    }
  };

  const handleUnblockUser = async () => {
    try {
      const counterpartId = chatRoom?.counterpartAccountId;
      if (!counterpartId) return;

      Alert.alert("Xác nhận", "Bỏ chặn người dùng này?", [
        {
          text: "Hủy",
          style: "cancel",
        },
        {
          text: "Bỏ chặn",
          onPress: async () => {
            await unblockUser({
              targetUserId: counterpartId,
            }).unwrap();
            Alert.alert("Thành công", "Đã bỏ chặn người dùng");
          },
        },
      ]);
    } catch (error: any) {
      Alert.alert(
        "Lỗi",
        error?.data?.message || "Không thể bỏ chặn người dùng",
      );
    }
  };

  const renderMessageItem = ({
    item,
  }: {
    item: MessageType | OptimisticMessage;
  }) => {
    const isMe = item.sender?.accountId === user?.accountId;
    const isSystem = item.messageType === "SYSTEM";
    const content = item.content || "";
    const isS3Image = isS3ImageUrl(content);
    const isSendingMsg = (item as OptimisticMessage).sending;
    const isRevoked = !content && !isSystem;

    // 1. RENDER TIN NHẮN HỆ THỐNG (Căn giữa)
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
          onLongPress={() => handleLongPress(item)}
          activeOpacity={0.8}
          style={{ maxWidth: "80%" }}
          disabled={isRevoked}
        >
          {isS3Image ? (
            <View>
              {/* Hiển thị ngữ cảnh trả lời phía trên ảnh nếu có */}
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
                style={[styles.chatImage, isSendingMsg && { opacity: 0.7 }]}
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
                isSendingMsg && { opacity: 0.7 },
              ]}
            >
              {/* 2. HIỂN THỊ TIN NHẮN ĐANG TRẢ LỜI TRONG BONG BÓNG */}
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
                    style={[
                      styles.replyInBubbleName,
                      isMe && { color: "#fff" },
                    ]}
                  >
                    {item.replyContext.originalSender?.fullName}
                  </Text>
                  <Text
                    numberOfLines={1}
                    style={[
                      styles.replyInBubbleText,
                      isMe && { color: "#eee" },
                    ]}
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
        {/* Hiển thị icon ghim nhỏ nếu tin nhắn được ghim (Tùy chọn) */}
        {/* {item.isPinned && <Ionicons name="pin" size={12} color="#888" style={{ marginTop: 2 }} />} */}
      </View>
    );
  };

  if (isLoading && !messagesData)
    return <ActivityIndicator style={{ flex: 1 }} />;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.headerBtn}
          >
            <Ionicons name="chevron-back" size={28} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {name}
            </Text>
            <Text style={styles.headerStatus}>Đang hoạt động</Text>
          </View>
          <TouchableOpacity style={styles.headerBtn}>
            <Ionicons
              name="information-circle-outline"
              size={26}
              color="#fff"
            />
          </TouchableOpacity>
        </View>

        {/* CHAT LIST */}
        <FlatList
          data={processedMessages}
          inverted
          keyExtractor={(item) => item.messageId}
          contentContainerStyle={styles.listContent}
          renderItem={renderMessageItem}
        />

        {/* IMAGE PREVIEW */}
        {selectedImages.length > 0 && (
          <View style={styles.imagePreviewBar}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {selectedImages.map((img, idx) => (
                <View key={idx} style={styles.previewItem}>
                  <Image
                    source={{ uri: img.uri }}
                    style={styles.previewImage}
                  />
                  <TouchableOpacity
                    style={styles.removeImgBtn}
                    onPress={() =>
                      setSelectedImages((prev) =>
                        prev.filter((_, i) => i !== idx),
                      )
                    }
                  >
                    <Ionicons name="close-circle" size={20} color="#FF3B30" />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* BLOCKED MESSAGE */}
        {isDirectBlocked && (
          <View style={styles.blockedBanner}>
            <Ionicons name="lock-closed" size={20} color="#fff" />
            <View style={styles.blockedTextContainer}>
              <Text style={styles.blockedTitle}>
                {isBlockedByMe
                  ? "Bạn đã chặn người này"
                  : "Bạn không thể nhắn tin với người này"}
              </Text>
              <Text style={styles.blockedDescription}>
                {isBlockedByMe
                  ? "Bạn đã chặn người dùng này. Bỏ chặn để tiếp tục nhắn tin."
                  : "Người này đã chặn bạn hoặc tài khoản của họ đã bị xóa."}
              </Text>
            </View>
            {isBlockedByMe && (
              <TouchableOpacity
                style={styles.unblockBtn}
                onPress={handleUnblockUser}
              >
                <Text style={styles.unblockBtnText}>Bỏ chặn</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {replyTarget && (
          <View style={styles.replyPreviewContainer}>
            <View style={styles.replyBarIndicator} />
            <View style={styles.replyContentBox}>
              <Text style={styles.replyTargetName}>
                Đang trả lời: {replyTarget.sender?.fullName}
              </Text>
              <Text numberOfLines={1} style={styles.replyTargetText}>
                {replyTarget.content || "[Hình ảnh]"}
              </Text>
            </View>
            <TouchableOpacity onPress={() => setReplyTarget(null)}>
              <Ionicons name="close-circle" size={24} color="#888" />
            </TouchableOpacity>
          </View>
        )}

        {/* INPUT BAR */}
        <View
          style={[styles.inputContainer, isDirectBlocked && { opacity: 0.5 }]}
        >
          <TouchableOpacity
            onPress={() => setIsEmojiOpen(true)}
            style={styles.iconBtn}
            disabled={isDirectBlocked}
          >
            <Ionicons name="happy-outline" size={26} color="#0084FF" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={async () => {
              const imgs = await pickImage();
              if (imgs) setSelectedImages((prev) => [...prev, ...imgs]);
            }}
            style={styles.iconBtn}
            disabled={isDirectBlocked}
          >
            <Ionicons name="image" size={26} color="#0084FF" />
          </TouchableOpacity>

          <TextInput
            value={text}
            onChangeText={setText}
            placeholder={isDirectBlocked ? "Không thể nhắn tin" : "Tin nhắn"}
            style={styles.input}
            multiline
            editable={!isDirectBlocked}
          />

          <TouchableOpacity
            onPress={onSend}
            style={[
              styles.sendBtn,
              ((!text.trim() && selectedImages.length === 0) ||
                isDirectBlocked) && { opacity: 0.5 },
            ]}
            disabled={
              (!text.trim() && selectedImages.length === 0) || isDirectBlocked
            }
          >
            {isSending ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="send" size={20} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={["28%"]}
        enablePanDownToClose
      >
        <BottomSheetView style={styles.sheetContainer}>
          <TouchableOpacity
            style={styles.sheetItem}
            onPress={() => {
              setReplyTarget(selectedMessage as any);
              bottomSheetRef.current?.close();
            }}
          >
            <Ionicons name="arrow-undo-outline" size={22} color="#475569" />
            <Text style={styles.sheetTextNormal}>Trả lời</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.sheetItem}
            onPress={() => {
              bottomSheetRef.current?.close();
              setIsForwardModalOpen(true);
            }}
          >
            <Ionicons name="arrow-redo-outline" size={22} color="#475569" />
            <Text style={styles.sheetTextNormal}>Chuyển tiếp</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.sheetItem}
            onPress={() => {
              /* Logic pin */ bottomSheetRef.current?.close();
            }}
          >
            <Ionicons name="pin-outline" size={22} color="#475569" />
            <Text style={styles.sheetTextNormal}>Ghim tin nhắn</Text>
          </TouchableOpacity>

          <View style={styles.separator} />

          <TouchableOpacity
            style={styles.sheetItem}
            onPress={() => {
              if (selectedMessage) handleRevoke(selectedMessage);
              bottomSheetRef.current?.close();
            }}
          >
            <Ionicons name="return-up-back" size={22} color="#ef4444" />
            <Text style={styles.sheetTextDanger}>Thu hồi tin nhắn</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.sheetItem}
            onPress={() => {
              if (selectedMessage) handleDelete(selectedMessage);
            }}
          >
            <Ionicons name="trash-outline" size={22} color="#ef4444" />
            <Text style={styles.sheetTextDanger}>Xóa tin nhắn</Text>
          </TouchableOpacity>
        </BottomSheetView>
      </BottomSheet>
      <EmojiPicker
        onEmojiSelected={(emoji) => {
          setText((prev) => prev + emoji.emoji);
        }}
        open={isEmojiOpen}
        onClose={() => setIsEmojiOpen(false)}
      />
      {isForwardModalOpen && (
        <View style={StyleSheet.absoluteFill}>
          <TouchableOpacity
            style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)" }}
            onPress={() => setIsForwardModalOpen(false)}
          />
          <View style={styles.forwardModalContainer}>
            <View style={styles.forwardHeader}>
              <Text style={styles.forwardTitle}>Chuyển tiếp tới</Text>
              <TouchableOpacity onPress={() => setIsForwardModalOpen(false)}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={chatRooms}
              keyExtractor={(item) => item.roomId.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.forwardRoomItem}
                  onPress={() => handleForwardSubmit(item.roomId)}
                >
                  <Image
                    source={{
                      uri: item.avatar || "https://via.placeholder.com/100",
                    }}
                    style={styles.miniAvatar}
                  />
                  <Text style={styles.forwardRoomName}>{item.name}</Text>
                  <Ionicons
                    name="paper-plane-outline"
                    size={20}
                    color="#0084FF"
                  />
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0084FF",
    height: 60,
    paddingHorizontal: 10,
  },
  headerBtn: { padding: 5 },
  headerInfo: { flex: 1, marginLeft: 10 },
  headerTitle: { color: "#fff", fontSize: 17, fontWeight: "bold" },
  headerStatus: { color: "#E0E0E0", fontSize: 11 },

  listContent: { padding: 15 },
  messageWrapper: { marginVertical: 4, width: "100%" },
  bubble: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    minHeight: 35,
    justifyContent: "center",
  },
  myBubble: {
    backgroundColor: "#0084FF",
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    backgroundColor: "#F0F0F0",
    borderBottomLeftRadius: 4,
    borderWidth: 0.5,
    borderColor: "#E8E8E8",
  },
  chatImage: {
    width: 220,
    height: 160,
    borderRadius: 15,
    marginVertical: 4,
    resizeMode: "cover",
  },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#fff",
    borderTopWidth: 0.5,
    borderTopColor: "#EEE",
  },
  input: {
    flex: 1,
    backgroundColor: "#F0F2F5",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginHorizontal: 10,
    maxHeight: 100,
    fontSize: 16,
  },
  iconBtn: { padding: 4 },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#0084FF",
    alignItems: "center",
    justifyContent: "center",
  },

  imagePreviewBar: {
    padding: 10,
    backgroundColor: "#fff",
    borderTopWidth: 0.5,
    borderTopColor: "#EEE",
  },
  previewItem: { marginRight: 12, position: "relative" },
  previewImage: { width: 60, height: 60, borderRadius: 10 },
  removeImgBtn: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "#fff",
    borderRadius: 10,
  },
  // Bottom Sheet
  sheetContainer: { paddingHorizontal: 20, paddingVertical: 10 },
  sheetItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  sheetTextNormal: { fontSize: 16, marginLeft: 12, color: "#1e293b" },
  sheetTextDanger: { fontSize: 16, marginLeft: 12, color: "#ef4444" },
  separator: { height: 1, backgroundColor: "#EEE", marginVertical: 8 },
  sheetText: {
    color: "#FF3B30",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 10,
  },
  revokedBubble: {
    backgroundColor: "#FFFFFF", // Nền trắng
    borderWidth: 1,
    borderColor: "#E0E0E0", // Viền xám
    borderRadius: 20,
    // Bạn có thể tùy chỉnh bo góc cho chuẩn hơn:
    // borderBottomRightRadius: 20,
    // borderBottomLeftRadius: 20,
  },
  messageText: { fontSize: 16, lineHeight: 22 },
  // Chữ xám in nghiêng cho tin thu hồi
  revokedText: {
    color: "#999999",
    fontStyle: "italic",
    fontSize: 14,
  },
  blockedBanner: {
    backgroundColor: "#dc2626",
    padding: 12,
    margin: 8,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  blockedTextContainer: {
    flex: 1,
  },
  blockedTitle: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
    marginBottom: 4,
  },
  blockedDescription: {
    color: "#fecaca",
    fontSize: 12,
    lineHeight: 16,
  },
  unblockBtn: {
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  unblockBtnText: {
    color: "#dc2626",
    fontWeight: "bold",
    fontSize: 12,
  },
  replyPreviewContainer: {
    flexDirection: "row",
    padding: 10,
    backgroundColor: "#f9f9f9",
    borderTopWidth: 0.5,
    borderTopColor: "#ddd",
    alignItems: "center",
  },
  replyBarIndicator: {
    width: 4,
    backgroundColor: "#0084FF",
    borderRadius: 2,
    marginRight: 10,
    height: "100%",
  },
  replyContentBox: { flex: 1 },
  replyTargetName: { fontSize: 12, fontWeight: "bold", color: "#0084FF" },
  replyTargetText: { fontSize: 13, color: "#666" },

  // System Message (Thông báo hệ thống như Zalo)
  systemMessageContainer: {
    alignItems: "center",
    marginVertical: 10,
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

  // Nội dung trả lời hiển thị bên trong Bong bóng chat
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
  forwardModalContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "60%",
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
  },
  forwardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  forwardTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  forwardRoomItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: "#EEE",
  },
  miniAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  forwardRoomName: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
  },
});
