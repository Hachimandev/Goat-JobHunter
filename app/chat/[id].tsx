import useChatActionsMobile from "@/hooks/useChatActionsMobile";
import { useUser } from "@/hooks/useUser";
import {
  useFetchMessagesInChatRoomQuery,
  useRevokeMessageMutation,
} from "@/services/chatRoom/chatRoomApi";
import { MessageType } from "@/types/model";
import { Ionicons } from "@expo/vector-icons";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
interface OptimisticMessage extends Partial<MessageType> {
  messageId: string;
  sending?: boolean;
}

export default function ChatDetail() {
  const { id, name } = useLocalSearchParams<{ id: string; name: string }>();
  const chatRoomId = Number(id);
  const { user } = useUser();
  const [text, setText] = useState("");
  const { handleSendMessage, isSending } = useChatActionsMobile();
  const [revokeMessage] = useRevokeMessageMutation();

  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["25%"], []);

  const [selectedMessage, setSelectedMessage] =
    useState<OptimisticMessage | null>(null);

  const [optimisticMessages, setOptimisticMessages] = useState<
    OptimisticMessage[]
  >([]);
  const [highlightId, setHighlightId] = useState<string | null>(null);

  const {
    data: messagesData,
    isLoading,
    refetch,
  } = useFetchMessagesInChatRoomQuery(
    {
      chatRoomId,
      size: 50,
      page: 0,
    },
    {
      skip: !chatRoomId,
      pollingInterval: 50,
    },
  );

  // useFocusEffect(
  //   useCallback(() => {
  //     if (chatRoomId) {
  //     }
  //   }, [chatRoomId]),
  // );

  const processedMessages = useMemo(() => {
    const serverMsgs = messagesData?.data ? [...messagesData.data] : [];
    // Gộp 2 mảng và sắp xếp: Mới nhất lên đầu (vì dùng inverted)
    const combined = [...optimisticMessages, ...serverMsgs];

    return combined.sort(
      (a, b) =>
        new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime(),
    );
  }, [messagesData, optimisticMessages]);

  const onSend = async () => {
    if (!text.trim()) return;

    const contentToSend = text.trim();
    const tempId = Date.now().toString();

    // 1. Tạo tin nhắn giả để hiển thị ngay lập tức
    const tempMsg: OptimisticMessage = {
      messageId: tempId,
      content: contentToSend,
      sender: { accountId: user?.accountId } as any,
      createdAt: new Date().toISOString(),
      sending: true,
    };

    // 2. Cập nhật UI ngay lập tức
    setOptimisticMessages((prev) => [tempMsg, ...prev]);
    setText("");

    try {
      // 3. Gọi API thật
      await handleSendMessage(chatRoomId, contentToSend);

      // 4. Gửi thành công: Xóa tin nhắn giả, đợi polling hoặc refetch lấy tin nhắn thật
      setOptimisticMessages((prev) =>
        prev.filter((m) => m.messageId !== tempId),
      );
      refetch();
    } catch (e) {
      // 5. Gửi lỗi: Xóa tin nhắn giả và có thể thông báo lỗi ở đây
      setOptimisticMessages((prev) =>
        prev.filter((m) => m.messageId !== tempId),
      );
      console.log("Send error", e);
    }
  };

  ///
  const handleRevoke = async (message: OptimisticMessage) => {
    try {
      await revokeMessage({
        chatRoomId,
        messageId: message.messageId!,
      }).unwrap();

      refetch();

      setOptimisticMessages((prev) =>
        prev.map((m) =>
          m.messageId === message.messageId
            ? { ...m, content: "Tin nhắn đã được thu hồi" }
            : m,
        ),
      );
    } catch (err) {
      console.log("Revoke error", err);
    }
  };
  const handleLongPress = (message: OptimisticMessage) => {
    setHighlightId(message.messageId);
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
        keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>{name}</Text>
            <Text style={styles.headerStatus}>Đang hoạt động</Text>
          </View>
          <TouchableOpacity
            onPress={() =>
              router.push({ pathname: "/chat/detail", params: { id, name } })
            }
          >
            <Ionicons
              name="information-circle-outline"
              size={24}
              color="#fff"
            />
          </TouchableOpacity>
        </View>

        <FlatList
          data={processedMessages}
          inverted
          keyExtractor={(item) => item.messageId?.toString()}
          contentContainerStyle={{ padding: 12 }}
          renderItem={({ item }) => {
            const isMe = item.sender?.accountId === user?.accountId;
            const isSendingMsg = (item as OptimisticMessage).sending;

            return (
              <View
                style={[
                  styles.messageRow,
                  { justifyContent: isMe ? "flex-end" : "flex-start" },
                ]}
              >
                <TouchableOpacity
                  onLongPress={() => handleLongPress(item)}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.bubble,
                      isMe ? styles.myBubble : styles.otherBubble,
                      isSendingMsg && { opacity: 0.6 },
                      highlightId === item.messageId && {
                        transform: [{ scale: 1.05 }],
                      },
                    ]}
                  >
                    <Text
                      style={{
                        color: "#aaa",
                        fontStyle: item.content ? "normal" : "italic",
                      }}
                    >
                      {item.content || "Tin nhắn đã bị thu hồi"}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            );
          }}
        />

        <View style={styles.inputBar}>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Tin nhắn"
            style={styles.input}
            multiline
          />
          <TouchableOpacity
            onPress={onSend}
            style={[styles.sendBtn, !text.trim() && { opacity: 0.5 }]}
            disabled={!text.trim()}
          >
            {isSending ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={{ color: "#fff" }}>➤</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        onClose={() => setHighlightId(null)}
      >
        <BottomSheetView style={styles.sheetContainer}>
          <TouchableOpacity
            style={styles.sheetItem}
            onPress={() => {
              if (selectedMessage) handleRevoke(selectedMessage);
              bottomSheetRef.current?.close();
            }}
          >
            <Text style={styles.sheetText}>Thu hồi tin nhắn</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.sheetItem}
            onPress={() => bottomSheetRef.current?.close()}
          >
            <Text style={styles.sheetCancel}>Hủy</Text>
          </TouchableOpacity>
        </BottomSheetView>
      </BottomSheet>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F4F6",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#0084FF",
    height: 56,
    paddingHorizontal: 12,
  },
  back: {
    color: "#fff",
    fontSize: 20,
    marginRight: 12,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },

  messageRow: {
    marginVertical: 4,
    flexDirection: "row",
  },
  bubble: {
    padding: 10,
    borderRadius: 16,
    maxWidth: "75%",
  },
  myBubble: {
    backgroundColor: "#0084FF",
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    backgroundColor: "#E5E5EA",
    borderBottomLeftRadius: 4,
  },

  inputBar: {
    flexDirection: "row",
    padding: 8,
    backgroundColor: "#fff",
    alignItems: "center",
  },
  input: {
    flex: 1,
    backgroundColor: "#F1F1F1",
    borderRadius: 20,
    paddingHorizontal: 14,
  },
  sendBtn: {
    marginLeft: 8,
    backgroundColor: "#0084FF",
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerInfo: {
    marginLeft: 4,
  },

  headerActions: {
    flexDirection: "row",
    gap: 16,
  },
  headerStatus: {
    color: "#E0E0E0",
    fontSize: 12,
  },
  sheetContainer: {
    padding: 16,
  },

  sheetItem: {
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderColor: "#ddd",
  },

  sheetText: {
    fontSize: 16,
    color: "red",
    fontWeight: "600",
  },

  sheetCancel: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 10,
    color: "#333",
  },
});
