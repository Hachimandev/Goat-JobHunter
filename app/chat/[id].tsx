import BottomSheet from "@gorhom/bottom-sheet";
import { useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import EmojiPicker from "rn-emoji-keyboard";

import { ChatHeader } from "@/components/chat/ChatHeader";
import { ChatInput } from "@/components/chat/ChatInput";
import { ForwardModal } from "@/components/chat/ForwardModal";
import { MessageActionsSheet } from "@/components/chat/MessageActionsSheet";
import { MessageItem } from "@/components/chat/MessageItem";

import useChatActionsMobile from "@/hooks/useChatActionsMobile";
import { useNotificationManager } from "@/hooks/useNotificationManager";
import { useUser } from "@/hooks/useUser";
import {
  useFetchChatRoomsByIdQuery,
  useFetchMessagesInChatRoomQuery,
  useForwardMessageBatchMutation,
} from "@/services/chatRoom/chatRoomApi";
import { usePinMessageMutation } from "@/services/chatRoom/pinned_message/pinnedMessageApi";
import { MessageType } from "@/types/model";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";

export default function ChatDetailScreen() {
  const { id, name, avatar } = useLocalSearchParams<{
    id: string;
    name: string;
    avatar: string;
  }>();
  const chatRoomId = Number(id);
  const { user } = useUser();
  const { setActiveChatRoom } = useNotificationManager();
  const [forwardMessageBatch] = useForwardMessageBatchMutation();
  const [showForwardToast, setShowForwardToast] = useState(false);

  const handleForwardSubmit = async (targetRoomId: number) => {
    if (!selectedMessage) return;

    try {
      await forwardMessageBatch({
        sourceChatRoomId: chatRoomId,
        messageId: selectedMessage.messageId,
        targetChatRoomIds: [targetRoomId],
      }).unwrap();

      setIsForwardModalOpen(false);

      setShowForwardToast(true);
      setTimeout(() => setShowForwardToast(false), 2000);
    } catch (error) {
      Alert.alert("Lỗi", "Không thể chuyển tiếp tin nhắn");
      console.error(error);
    }
  };

  const [selectedFiles, setSelectedFiles] = useState<
    DocumentPicker.DocumentPickerAsset[]
  >([]);
  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        multiple: true,
      });

      if (!result.canceled) {
        setSelectedFiles((prev) => [...prev, ...result.assets]);
      }
    } catch (err) {
      console.log("Lỗi chọn tài liệu:", err);
    }
  };

  const [text, setText] = useState("");
  const [replyTarget, setReplyTarget] = useState<MessageType | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<MessageType | null>(
    null,
  );
  const [selectedImages, setSelectedImages] = useState<any[]>([]);
  const [isEmojiOpen, setIsEmojiOpen] = useState(false);
  const [isForwardModalOpen, setIsForwardModalOpen] = useState(false);

  const flatListRef = useRef<FlatList>(null);

  const handleNavigateToMessage = (messageId: string) => {
    if (!messagesData?.data) return;

    const index = messagesData.data.findIndex((m) => m.messageId === messageId);

    if (index !== -1) {
      flatListRef.current?.scrollToIndex({
        index: index,
        animated: true,
        viewPosition: 0.5,
      });
    } else {
      Alert.alert(
        "Thông báo",
        "Tin nhắn gốc đã quá cũ hoặc không còn tồn tại.",
      );
    }
  };

  const bottomSheetRef = useRef<BottomSheet>(null);
  const {
    handleSendMessage,
    handleRecallMessage,
    handleDeleteMessage,
    pickImage,
    isSending,
  } = useChatActionsMobile();
  const [pinMessage] = usePinMessageMutation();

  const {
    data: messagesData,
    isLoading,
    refetch,
  } = useFetchMessagesInChatRoomQuery(
    { chatRoomId, size: 50, page: 0 },
    { skip: !chatRoomId, pollingInterval: 5000 },
  );

  const { data: chatRoomData } = useFetchChatRoomsByIdQuery(chatRoomId, {
    skip: !chatRoomId,
  });

  useEffect(() => {
    setActiveChatRoom(chatRoomId);
    return () => setActiveChatRoom(null);
  }, [chatRoomId]);

  const onSend = async () => {
    if (
      !text.trim() &&
      selectedImages.length === 0 &&
      selectedFiles.length === 0
    )
      return;

    const replyId = replyTarget?.messageId || null;
    const contentToSend = text;
    const imagesToSend = [...selectedImages];
    const filesToSend = [...selectedFiles];

    // Reset UI ngay lập tức
    setText("");
    setSelectedImages([]);
    setSelectedFiles([]);
    setReplyTarget(null);

    try {
      // Đảm bảo hàm handleSendMessage trong hook của bạn đã nhận thêm đối số files
      await handleSendMessage(
        chatRoomId,
        contentToSend,
        imagesToSend,
        replyId,
        filesToSend,
      );
      refetch();
    } catch (e) {
      console.error("Gửi tin thất bại:", e);
    }
  };

  const handleLongPress = useCallback((message: MessageType) => {
    setSelectedMessage(message);
    bottomSheetRef.current?.expand();
  }, []);

  const isDirectBlocked = chatRoomData?.data?.blocked || false;

  if (isLoading && !messagesData) {
    return <ActivityIndicator style={styles.loadingCenter} color="#0084FF" />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex1}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <ChatHeader name={name} avatar={avatar} status="Đang hoạt động" />

        <FlatList
          ref={flatListRef}
          data={messagesData?.data || []}
          inverted
          keyExtractor={(item) => item.messageId}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <MessageItem
              item={item}
              isMe={item.sender?.accountId === user?.accountId}
              currentUser={user}
              onLongPress={handleLongPress}
              onNavigateToMessage={handleNavigateToMessage}
            />
          )}
          onScrollToIndexFailed={(info) => {
            flatListRef.current?.scrollToOffset({
              offset: info.averageItemLength * info.index,
              animated: true,
            });
          }}
        />

        <ChatInput
          text={text}
          setText={setText}
          onSend={onSend}
          isSending={isSending}
          replyTarget={replyTarget}
          setReplyTarget={setReplyTarget}
          selectedImages={selectedImages}
          onRemoveImage={(idx) =>
            setSelectedImages((prev) => prev.filter((_, i) => i !== idx))
          }
          onPickImage={async () => {
            const imgs = await pickImage();
            if (imgs) setSelectedImages((prev) => [...prev, ...imgs]);
          }}
          selectedFiles={selectedFiles}
          onPickDocument={pickDocument}
          onRemoveFile={(idx) =>
            setSelectedFiles((prev) => prev.filter((_, i) => i !== idx))
          }
          onOpenEmoji={() => setIsEmojiOpen(true)}
          disabled={isDirectBlocked}
        />
      </KeyboardAvoidingView>

      <MessageActionsSheet
        ref={bottomSheetRef}
        selectedMessage={selectedMessage}
        onReply={() => {
          setReplyTarget(selectedMessage);
          bottomSheetRef.current?.close();
        }}
        onForward={() => {
          setIsForwardModalOpen(true);
          bottomSheetRef.current?.close();
        }}
        onPin={() => {
          if (selectedMessage) {
            pinMessage({ chatRoomId, messageId: selectedMessage.messageId });
          }
          bottomSheetRef.current?.close();
        }}
        onRevoke={() => {
          if (selectedMessage) {
            handleRecallMessage(chatRoomId, selectedMessage.messageId);
            bottomSheetRef.current?.close();
          }
        }}
        onDelete={() => {
          if (selectedMessage) {
            handleDeleteMessage(chatRoomId, selectedMessage.messageId);
            bottomSheetRef.current?.close();
          }
        }}
      />

      <ForwardModal
        visible={isForwardModalOpen}
        onClose={() => setIsForwardModalOpen(false)}
        onForwardSelect={handleForwardSubmit}
      />

      <EmojiPicker
        open={isEmojiOpen}
        onClose={() => setIsEmojiOpen(false)}
        onEmojiSelected={(emoji) => setText((prev) => prev + emoji.emoji)}
      />
      {showForwardToast && (
        <View style={styles.toastOverlay} pointerEvents="none">
          <View style={styles.toastBox}>
            <Ionicons name="checkmark-circle" size={20} color="#fff" />
            <Text style={styles.toastText}>Đã chuyển tiếp</Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  flex1: { flex: 1 },
  listContent: { paddingHorizontal: 15, paddingBottom: 10 },
  loadingCenter: { flex: 1, justifyContent: "center", alignItems: "center" },
  toastContainer: {
    position: "absolute",
    bottom: 100,
    left: "25%",
    right: "25%",
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingVertical: 10,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
  },
  toastOverlay: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
    elevation: 10,
  },
  toastBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.85)",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 30,
    gap: 10,
  },
  toastText: { color: "#fff", fontSize: 14, fontWeight: "600" },
});
