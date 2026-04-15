import BottomSheet from "@gorhom/bottom-sheet";
import { useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
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
} from "@/services/chatRoom/chatRoomApi";
import { usePinMessageMutation } from "@/services/chatRoom/pinned_message/pinnedMessageApi";
import { MessageType } from "@/types/model";

export default function ChatDetailScreen() {
  const { id, name } = useLocalSearchParams<{ id: string; name: string }>();
  const chatRoomId = Number(id);
  const { user } = useUser();
  const { setActiveChatRoom } = useNotificationManager();

  const [text, setText] = useState("");
  const [replyTarget, setReplyTarget] = useState<MessageType | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<MessageType | null>(
    null,
  );
  const [selectedImages, setSelectedImages] = useState<any[]>([]);
  const [isEmojiOpen, setIsEmojiOpen] = useState(false);
  const [isForwardModalOpen, setIsForwardModalOpen] = useState(false);

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
    if (!text.trim() && selectedImages.length === 0) return;

    const replyId = replyTarget?.messageId || null;
    const contentToSend = text;
    const imagesToSend = [...selectedImages];

    setText("");
    setSelectedImages([]);
    setReplyTarget(null);

    try {
      await handleSendMessage(chatRoomId, contentToSend, imagesToSend, replyId);
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
        <ChatHeader name={name} status="Đang hoạt động" />

        <FlatList
          data={messagesData?.data || []}
          inverted
          keyExtractor={(item) => item.messageId}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <MessageItem
              item={item}
              isMe={item.sender?.accountId === user?.accountId}
              onLongPress={handleLongPress}
            />
          )}
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
        selectedMessage={selectedMessage}
        sourceChatRoomId={chatRoomId}
      />

      <EmojiPicker
        open={isEmojiOpen}
        onClose={() => setIsEmojiOpen(false)}
        onEmojiSelected={(emoji) => setText((prev) => prev + emoji.emoji)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  flex1: { flex: 1 },
  listContent: { paddingHorizontal: 15, paddingBottom: 10 },
  loadingCenter: { flex: 1, justifyContent: "center", alignItems: "center" },
});
