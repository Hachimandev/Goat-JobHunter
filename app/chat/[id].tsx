import useChatActionsMobile from "@/hooks/useChatActionsMobile";
import { useUser } from "@/hooks/useUser";
import {
  useFetchMessagesInChatRoomQuery,
  useRevokeMessageMutation,
} from "@/services/chatRoom/chatRoomApi";
import { MessageType } from "@/types/model";
import { Ionicons } from "@expo/vector-icons";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import * as ImagePicker from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
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
}

export default function ChatDetail() {
  const { id, name } = useLocalSearchParams<{ id: string; name: string }>();
  const chatRoomId = Number(id);
  const { user } = useUser();
  const [text, setText] = useState("");
  const { handleSendMessage, pickImage, isSending } = useChatActionsMobile();
  const [revokeMessage] = useRevokeMessageMutation();
  const [isEmojiOpen, setIsEmojiOpen] = useState(false);

  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["20%"], []);
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
    const imagesToSend = [...selectedImages];
    setText("");
    setSelectedImages([]);
    try {
      await handleSendMessage(chatRoomId, contentToSend, imagesToSend);
      refetch();
    } catch (e) {
      console.log("Send error", e);
    }
  };

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

  const handleLongPress = (message: OptimisticMessage) => {
    setSelectedMessage(message);
    bottomSheetRef.current?.expand();
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
          renderItem={({ item }) => {
            const isMe = item.sender?.accountId === user?.accountId;
            const content = item.content || "";
            const isS3Image = isS3ImageUrl(content);
            const isSendingMsg = (item as OptimisticMessage).sending;
            const isRevoked = !content;

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
                >
                  {isS3Image ? (
                    <Image
                      source={{ uri: content }}
                      style={[
                        styles.chatImage,
                        isSendingMsg && { opacity: 0.7 },
                      ]}
                    />
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
          }}
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

        {/* INPUT BAR */}
        <View style={styles.inputContainer}>
          <TouchableOpacity
            onPress={() => setIsEmojiOpen(true)}
            style={styles.iconBtn}
          >
            <Ionicons name="happy-outline" size={26} color="#0084FF" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={async () => {
              const imgs = await pickImage();
              if (imgs) setSelectedImages((prev) => [...prev, ...imgs]);
            }}
            style={styles.iconBtn}
          >
            <Ionicons name="image" size={26} color="#0084FF" />
          </TouchableOpacity>

          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Tin nhắn"
            style={styles.input}
            multiline
          />

          <TouchableOpacity
            onPress={onSend}
            style={[
              styles.sendBtn,
              !text.trim() && selectedImages.length === 0 && { opacity: 0.5 },
            ]}
            disabled={!text.trim() && selectedImages.length === 0}
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
        snapPoints={snapPoints}
        enablePanDownToClose
      >
        <BottomSheetView style={styles.sheetContainer}>
          <TouchableOpacity
            style={styles.sheetItem}
            onPress={() => {
              if (selectedMessage) handleRevoke(selectedMessage);
              bottomSheetRef.current?.close();
            }}
          >
            <Ionicons name="trash-outline" size={22} color="#FF3B30" />
            <Text style={styles.sheetText}>Thu hồi tin nhắn</Text>
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

  sheetContainer: { padding: 20 },
  sheetItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },
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
});
