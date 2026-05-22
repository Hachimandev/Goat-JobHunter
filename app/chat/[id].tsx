import BottomSheet from "@gorhom/bottom-sheet";
import { Picker } from "@react-native-picker/picker";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import EmojiPicker from "rn-emoji-keyboard";

import { ChatHeader } from "@/components/chat/ChatHeader";
import { ChatInput } from "@/components/chat/ChatInput";
import { ChatTypingIndicator } from "@/components/chat/ChatTypingIndicator";
import { ForwardModal } from "@/components/chat/ForwardModal";
import { InviteLinkPanel } from "@/components/chat/InviteLinkPanel";
import { MessageActionsSheet } from "@/components/chat/MessageActionsSheet";
import { MessageItem } from "@/components/chat/MessageItem";

import { PollVoteModal } from "@/components/chat/PollVoteModal";
import { TRANSLATE_LANGUAGE_OPTIONS } from "@/constants/constant";
import useChatActionsMobile from "@/hooks/useChatActionsMobile";
import { useChatRoomTypingIndicator } from "@/hooks/useChatRoomTypingIndicator";
import { useDissolveGroup } from "@/hooks/useDissolveGroup";
import { useNotificationManager } from "@/hooks/useNotificationManager";
import { useUser } from "@/hooks/useUser";
import {
  useFetchChatRoomsByIdQuery,
  useFetchMessagesInChatRoomQuery,
  useForwardMessageBatchMutation,
} from "@/services/chatRoom/chatRoomApi";
import { useTranslateMessageMutation } from "@/services/ai/conversationApi";
import {
  GroupPermissionsResponse,
  useGetMemberInGroupChatQuery,
} from "@/services/chatRoom/groupChat/groupChatApi";
import {
  useGetPinnedMessagesQuery,
  usePinMessageMutation,
  useUnpinMessageMutation,
} from "@/services/chatRoom/pinned_message/pinnedMessageApi";
import { MessageType } from "@/types/model";
import { Ionicons } from "@expo/vector-icons";
import { useHeaderHeight } from "@react-navigation/elements";
import * as Clipboard from "expo-clipboard";
import * as DocumentPicker from "expo-document-picker";

type PinnedMessage = {
  message: MessageType;
};

export default function ChatDetailScreen() {
  const { id, name, avatar, targetUserId } = useLocalSearchParams<{
    id: string;
    name: string;
    avatar: string;
    targetUserId?: string;
  }>();
  const chatRoomId = Number(id);
  const { user } = useUser();
  const { setActiveChatRoom } = useNotificationManager();
  const [forwardMessageBatch] = useForwardMessageBatchMutation();
  const [showForwardToast, setShowForwardToast] = useState(false);
  const headerHeight = useHeaderHeight();
  const insets = useSafeAreaInsets();

  const { data: pinnedData, refetch: refetchPinned } =
    useGetPinnedMessagesQuery(
      { chatRoomId },
      { skip: !chatRoomId, pollingInterval: 5000 },
    );
  const pinnedMessage = pinnedData?.data?.[0] as PinnedMessage | undefined;

  const [unpinMessage] = useUnpinMessageMutation();
  const [isPinnedListOpen, setIsPinnedListOpen] = useState(false);

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
        copyToCacheDirectory: true,
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
  const [isInvitePanelOpen, setIsInvitePanelOpen] = useState(false);
  const [isBannerDismissed, setIsBannerDismissed] = useState(false);
  const [isTranslateModalOpen, setIsTranslateModalOpen] = useState(false);
  const [selectedTargetLang, setSelectedTargetLang] = useState("Vietnamese");
  const [translatedMessageText, setTranslatedMessageText] = useState<
    string | null
  >(null);
  const [translateMessage, { isLoading: isTranslatingMessage }] =
    useTranslateMessageMutation();

  const flatListRef = useRef<FlatList>(null);

  const [highlightedMessageId, setHighlightedMessageId] = useState<
    string | null
  >(null);

  const handleNavigateToMessage = (messageId: string) => {
    const currentMessages = Array.isArray(messagesData?.data?.result)
      ? messagesData.data.result
      : [];

    if (!currentMessages.length) return;

    const index = currentMessages.findIndex((m) => m.messageId === messageId);

    if (index !== -1) {
      flatListRef.current?.scrollToIndex({
        index: index,
        animated: true,
        viewPosition: 0.5,
      });
      setHighlightedMessageId(messageId);
      setTimeout(() => setHighlightedMessageId(null), 2000);
    } else {
      Alert.alert(
        "Thông báo",
        "Tin nhắn gốc đã quá cũ hoặc không còn tồn tại.",
      );
    }
  };

  const bottomSheetRef = useRef<BottomSheet>(null);
  const [pinMessage] = usePinMessageMutation();

  const {
    data: messagesData,
    isLoading,
    refetch,
  } = useFetchMessagesInChatRoomQuery(
    { chatRoomId, size: 50, page: 0 },
    { skip: !chatRoomId, pollingInterval: 5000 },
  );

  const { data: chatRoomData, refetch: refetchChatRoom } =
    useFetchChatRoomsByIdQuery(chatRoomId, {
      skip: !chatRoomId,
      pollingInterval: 3000,
    });

  const isGroupChat = chatRoomData?.data?.type === "GROUP";
  const directProfileUserId = !isGroupChat
    ? Number(chatRoomData?.data?.counterpartAccountId || targetUserId)
    : undefined;
  const groupPermissions: GroupPermissionsResponse = {
    allowMemberUpdate: chatRoomData?.data?.allowMemberUpdate ?? true,
    allowMemberPin: chatRoomData?.data?.allowMemberPin ?? true,
    allowMemberCreateVote: chatRoomData?.data?.allowMemberCreateVote ?? true,
    allowMemberSendMessage: chatRoomData?.data?.allowMemberSendMessage ?? true,
    allowModeratorSendMessage:
      chatRoomData?.data?.allowModeratorSendMessage ?? true,
  };
  const { data: membersData } = useGetMemberInGroupChatQuery(chatRoomId, {
    skip: !chatRoomId || !isGroupChat,
  });
  const members = membersData?.data || [];
  const currentUserRole = members.find(
    (m) => m.accountId === user?.accountId,
  )?.role;
  const canManagePins =
    !isGroupChat ||
    currentUserRole !== "MEMBER" ||
    groupPermissions.allowMemberPin !== false;

  const {
    handleSendMessage,
    handleRecallMessage,
    handleDeleteMessage,
    getSendPermissionDeniedReason,
    pickImage,
    isSending,
  } = useChatActionsMobile({
    isGroupChat,
    currentUserRole,
    groupPermissions,
  });
  const { typingParticipants, markTyping, stopTyping } =
    useChatRoomTypingIndicator(chatRoomId, user?.accountId);

  useEffect(() => {
    setActiveChatRoom(chatRoomId);
    if (chatRoomId) {
      refetch();
    }
    return () => setActiveChatRoom(null);
  }, [chatRoomId, refetch, setActiveChatRoom]);

  useFocusEffect(
    useCallback(() => {
      if (chatRoomId) {
        refetchChatRoom();
      }
    }, [chatRoomId, refetchChatRoom]),
  );

  const messagesList = useMemo(() => {
    return Array.isArray(messagesData?.data?.result)
      ? messagesData.data.result
      : [];
  }, [messagesData]);

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

    await stopTyping();
    setText("");
    setSelectedImages([]);
    setSelectedFiles([]);
    setReplyTarget(null);

    try {
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
    if (message.messageType === "POLL") {
      const pollData = (message as any).poll;
      if (pollData) {
        setSelectedPoll(pollData);
        setIsVoteModalOpen(true);
      }
    } else {
      setSelectedMessage(message);
      bottomSheetRef.current?.expand();
    }
  }, []);

  const { handleLeaveGroup } = useDissolveGroup();

  const handleDeleteAllMessages = async () => {
    if (chatRoomId && name) {
      await handleLeaveGroup(Number(chatRoomId), name);
    }
  };

  const isDirectBlocked = chatRoomData?.data?.blocked || false;
  const isGroupDissolved =
    chatRoomData?.data?.deletedAt !== null &&
    chatRoomData?.data?.deletedAt !== undefined;
  const sendPermissionDeniedReason = getSendPermissionDeniedReason();

  const handleCopyMessage = async () => {
    if (!selectedMessage) return;

    const contentToCopy =
      selectedMessage.mediaItems?.[0]?.url || selectedMessage.content;

    if (contentToCopy) {
      await Clipboard.setStringAsync(contentToCopy);
      bottomSheetRef.current?.close();
    }
  };

  const canTranslateSelectedMessage = Boolean(
    selectedMessage?.content?.trim() &&
    selectedMessage?.messageType !== "SYSTEM" &&
    selectedMessage?.messageType !== "POLL" &&
    !selectedMessage?.isHidden,
  );

  const openTranslateMessageModal = () => {
    if (!canTranslateSelectedMessage) {
      Alert.alert("Thông báo", "Tin nhắn này không có nội dung để dịch");
      return;
    }

    setTranslatedMessageText(null);
    setIsTranslateModalOpen(true);
    bottomSheetRef.current?.close();
  };

  const handleTranslateSelectedMessage = async () => {
    const content = selectedMessage?.content?.trim();
    if (!content) {
      return;
    }

    try {
      const response = await translateMessage({
        content,
        targetLang: selectedTargetLang,
      }).unwrap();
      const nextTranslatedText = response?.data?.translatedText;

      if (!nextTranslatedText) {
        Alert.alert("Lỗi", "Không thể dịch tin nhắn");
        return;
      }

      setTranslatedMessageText(nextTranslatedText);
    } catch (error: any) {
      Alert.alert(
        "Lỗi",
        error?.data?.message || "Đã có lỗi xảy ra khi dịch tin nhắn",
      );
    }
  };

  const [selectedPoll, setSelectedPoll] = useState<any>(null);
  const [isVoteModalOpen, setIsVoteModalOpen] = useState(false);

  const extractPollId = (content?: string | null) => {
    if (!content) return null;
    const match = content.match(/poll_([a-z0-9]+)/);
    return match ? match[0] : null;
  };
  const extractReminderId = (content?: string | null) => {
    if (!content) return null;
    const match = content.match(/\(Xem[: ]+([^)]+)\)/i);
    return match?.[1]?.trim() || null;
  };
  const latestPollMessageIdByPollId = useMemo(() => {
    const map: Record<string, any> = {};
    for (const m of messagesList) {
      if (m.messageType !== "POLL") continue;

      const pid = extractPollId(m.content);
      if (!pid) continue;

      const prev = map[pid];
      if (!prev) map[pid] = m;
      else if (new Date(m.createdAt) > new Date(prev.createdAt)) map[pid] = m;
    }
    const result: Record<string, string> = {};
    for (const k of Object.keys(map)) result[k] = map[k].messageId;
    return result;
  }, [messagesList]);
  const latestReminderMessageIdByReminderId = useMemo(() => {
    const map: Record<string, any> = {};
    for (const m of messagesList) {
      if (String(m.messageType) !== "REMINDER") continue;

      const reminderId = extractReminderId(m.content);
      if (!reminderId) continue;

      const prev = map[reminderId];
      if (!prev) map[reminderId] = m;
      else if (new Date(m.createdAt) > new Date(prev.createdAt)) {
        map[reminderId] = m;
      }
    }
    const result: Record<string, string> = {};
    for (const k of Object.keys(map)) result[k] = map[k].messageId;
    return result;
  }, [messagesList]);

  if (isLoading && messagesList.length === 0) {
    return <ActivityIndicator style={styles.loadingCenter} color="#0084FF" />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex1}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={headerHeight}
      >
        <ChatHeader
          name={chatRoomData?.data?.name || name}
          avatar={chatRoomData?.data?.avatar || avatar}
          status="Đang hoạt động"
          profileUserId={
            directProfileUserId && Number.isFinite(directProfileUserId)
              ? directProfileUserId
              : undefined
          }
          onPressInfo={() =>
            router.push({
              pathname: "/chat/detail",
              params: {
                id: chatRoomId.toString(),
                name: chatRoomData?.data?.name || name,
                avatar: chatRoomData?.data?.avatar || avatar,
                targetUserId:
                  directProfileUserId && Number.isFinite(directProfileUserId)
                    ? String(directProfileUserId)
                    : undefined,
                messages: JSON.stringify(messagesList || []),
                role: currentUserRole,
                allowMemberUpdate: String(groupPermissions.allowMemberUpdate),
                allowMemberPin: String(groupPermissions.allowMemberPin),
                allowMemberCreateVote: String(
                  groupPermissions.allowMemberCreateVote,
                ),
                allowMemberSendMessage: String(
                  groupPermissions.allowMemberSendMessage,
                ),
                allowModeratorSendMessage: String(
                  groupPermissions.allowModeratorSendMessage,
                ),
              },
            })
          }
          onPressInvite={
            chatRoomData?.data?.type === "GROUP"
              ? () => setIsInvitePanelOpen(true)
              : undefined
          }
        />

        {pinnedMessage && (
          <View style={styles.pinnedContainer}>
            <Ionicons name="pin" size={16} color="#007AFF" />

            <TouchableOpacity
              style={{ flex: 1 }}
              onPress={() =>
                handleNavigateToMessage(pinnedMessage.message.messageId)
              }
            >
              <Text style={styles.pinnedLabel}>
                Tin nhắn ghim{" "}
                {pinnedData?.data?.length && pinnedData.data.length > 1
                  ? `(1/${pinnedData.data.length})`
                  : ""}
              </Text>

              <Text numberOfLines={1} style={styles.pinnedText}>
                {pinnedMessage.message?.content || "[Tin nhắn đa phương tiện]"}
              </Text>
            </TouchableOpacity>

            {(pinnedData?.data?.length ?? 0) > 1 && (
              <TouchableOpacity onPress={() => setIsPinnedListOpen(true)}>
                <Ionicons name="chevron-forward" size={18} color="#999" />
              </TouchableOpacity>
            )}

            {canManagePins && (
              <TouchableOpacity
                onPress={() => {
                  Alert.alert("Bỏ ghim", "Bạn có chắc muốn bỏ ghim?", [
                    { text: "Hủy" },
                    {
                      text: "OK",
                      onPress: async () => {
                        await unpinMessage({
                          chatRoomId,
                          messageId: pinnedMessage.message.messageId,
                        }).unwrap();
                        await refetchPinned();
                      },
                    },
                  ]);
                }}
              >
                <Ionicons name="close" size={18} color="#999" />
              </TouchableOpacity>
            )}
          </View>
        )}

        <Modal visible={isPinnedListOpen} transparent animationType="fade">
          <View style={styles.overlay}>
            <View style={styles.pinnedListBox}>
              <Text style={styles.pinnedListTitle}>Tin nhắn đã ghim</Text>

              <FlatList
                data={pinnedData?.data || []}
                keyExtractor={(item) => item.message.messageId}
                renderItem={({ item }) => (
                  <View style={styles.pinnedItemRow}>
                    {/* nội dung */}
                    <TouchableOpacity
                      style={{ flex: 1 }}
                      onPress={() => {
                        setIsPinnedListOpen(false);
                        handleNavigateToMessage(item.message.messageId);
                      }}
                    >
                      <Text numberOfLines={1}>
                        {item.message?.content || "[Tin nhắn đa phương tiện]"}
                      </Text>
                    </TouchableOpacity>

                    {/* nút xóa ghim */}
                    {canManagePins && (
                      <TouchableOpacity
                        onPress={() => {
                          Alert.alert("Bỏ ghim", "Xóa ghim tin nhắn này?", [
                            { text: "Hủy" },
                            {
                              text: "OK",
                              onPress: async () => {
                                try {
                                  await unpinMessage({
                                    chatRoomId,
                                    messageId: item.message.messageId,
                                  }).unwrap();

                                  await refetchPinned();
                                } catch (e) {
                                  console.error("Lỗi bỏ ghim:", e);
                                  Alert.alert("Lỗi", "Không thể bỏ ghim");
                                }
                              },
                            },
                          ]);
                        }}
                      >
                        <Ionicons name="close" size={18} color="#999" />
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              />

              <TouchableOpacity onPress={() => setIsPinnedListOpen(false)}>
                <Text style={{ textAlign: "center", color: "#007AFF" }}>
                  Đóng
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {isGroupDissolved && !isBannerDismissed && (
          <View style={styles.dissolvedBanner}>
            <View style={styles.dissolvedBannerContent}>
              <View style={{ flex: 1 }}>
                <Text style={styles.dissolvedBannerTitle}>
                  Nhóm đã bị giải tán
                </Text>
                <Text style={styles.dissolvedBannerDesc}>
                  Bạn có thể rời khỏi nhóm này
                </Text>
              </View>
              <TouchableOpacity
                onPress={handleDeleteAllMessages}
                style={styles.dissolvedBannerBtn}
              >
                <Text style={styles.dissolvedBannerBtnText}>Rời</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setIsBannerDismissed(true)}
                style={{ marginLeft: 10 }}
              >
                <Ionicons name="close" size={20} color="#999" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        <FlatList
          ref={flatListRef}
          data={messagesList}
          style={styles.flex1}
          inverted
          keyExtractor={(item) => item.messageId}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <MessageItem
              item={item}
              isMe={item.sender?.accountId === user?.accountId}
              currentUser={user}
              onLongPress={handleLongPress}
              showPoll={
                item.messageType === "POLL" &&
                latestPollMessageIdByPollId[
                  extractPollId(item.content) || ""
                ] === item.messageId
              }
              showReminder={
                String(item.messageType) === "REMINDER" &&
                latestReminderMessageIdByReminderId[
                  extractReminderId(item.content) || ""
                ] === item.messageId
              }
              onNavigateToMessage={handleNavigateToMessage}
              getReminderMessageId={(rid: string) =>
                latestReminderMessageIdByReminderId[rid] || null
              }
              getPollMessageId={(pid: string) =>
                latestPollMessageIdByPollId[pid] || null
              }
              isGroupChat={chatRoomData?.data?.type === "GROUP"}
              isHighlighted={highlightedMessageId === item.messageId}
            />
          )}
          onScrollToIndexFailed={(info) => {
            flatListRef.current?.scrollToOffset({
              offset: info.averageItemLength * info.index,
              animated: true,
            });
          }}
          ListEmptyComponent={
            !isLoading ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Chưa có tin nhắn nào</Text>
              </View>
            ) : null
          }
        />

        <ChatTypingIndicator typingParticipants={typingParticipants} />

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
          onMediaCaptured={(assets) => {
            setSelectedImages((prev) => [...prev, ...assets]);
          }}
          selectedFiles={selectedFiles}
          onPickDocument={pickDocument}
          onRemoveFile={(idx) =>
            setSelectedFiles((prev) => prev.filter((_, i) => i !== idx))
          }
          onOpenEmoji={() => setIsEmojiOpen(true)}
          disabled={
            isDirectBlocked || isGroupDissolved || !!sendPermissionDeniedReason
          }
          disabledReason={
            isGroupDissolved
              ? "Nhóm đã bị giải tán"
              : isDirectBlocked
                ? "Bạn bị chặn"
                : sendPermissionDeniedReason || undefined
          }
          onTypingChange={markTyping}
          onTypingStop={stopTyping}
        />
      </KeyboardAvoidingView>

      <MessageActionsSheet
        ref={bottomSheetRef}
        selectedMessage={selectedMessage}
        canPin={canManagePins}
        onCopy={handleCopyMessage}
        isGroupDissolved={isGroupDissolved}
        onReply={() => {
          setReplyTarget(selectedMessage);
          bottomSheetRef.current?.close();
        }}
        onForward={() => {
          setIsForwardModalOpen(true);
          bottomSheetRef.current?.close();
        }}
        canTranslate={canTranslateSelectedMessage}
        onTranslate={openTranslateMessageModal}
        onPin={async () => {
          if (!canManagePins) {
            Alert.alert(
              "Thông báo",
              "Bạn không có quyền ghim tin nhắn trong nhóm này",
            );
            bottomSheetRef.current?.close();
            return;
          }

          if (selectedMessage) {
            await pinMessage({
              chatRoomId,
              messageId: selectedMessage.messageId,
            }).unwrap();

            await refetchPinned();
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

      <Modal
        visible={isTranslateModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsTranslateModalOpen(false)}
      >
        <View style={styles.overlay}>
          <View style={styles.translateBox}>
            <View style={styles.translateHeader}>
              <Text style={styles.translateTitle}>Dịch tin nhắn</Text>
              <TouchableOpacity onPress={() => setIsTranslateModalOpen(false)}>
                <Ionicons name="close" size={22} color="#111827" />
              </TouchableOpacity>
            </View>

            <View style={styles.translatePickerBox}>
              <Picker
                selectedValue={selectedTargetLang}
                onValueChange={(value) => setSelectedTargetLang(value)}
              >
                {TRANSLATE_LANGUAGE_OPTIONS.map((option) => (
                  <Picker.Item
                    key={option.value}
                    label={option.label}
                    value={option.value}
                  />
                ))}
              </Picker>
            </View>

            <View style={styles.translateBlock}>
              <Text style={styles.translateLabel}>Tin nhắn gốc</Text>
              <Text style={styles.translateContent}>
                {selectedMessage?.content}
              </Text>
            </View>

            {translatedMessageText && (
              <View style={styles.translateBlock}>
                <Text style={styles.translateLabel}>Bản dịch</Text>
                <Text style={styles.translatedContent}>
                  {translatedMessageText}
                </Text>
              </View>
            )}

            <TouchableOpacity
              style={[
                styles.translateButton,
                isTranslatingMessage && { opacity: 0.65 },
              ]}
              onPress={handleTranslateSelectedMessage}
              disabled={isTranslatingMessage}
            >
              {isTranslatingMessage ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Ionicons name="language-outline" size={18} color="#fff" />
                  <Text style={styles.translateButtonText}>Dịch</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <EmojiPicker
        open={isEmojiOpen}
        onClose={() => setIsEmojiOpen(false)}
        onEmojiSelected={(emoji) => {
          setText((prev) => {
            const nextText = prev + emoji.emoji;
            void markTyping(nextText.trim().length > 0);
            return nextText;
          });
        }}
      />
      {showForwardToast && (
        <View style={styles.toastOverlay} pointerEvents="none">
          <View style={styles.toastBox}>
            <Ionicons name="checkmark-circle" size={20} color="#fff" />
            <Text style={styles.toastText}>Đã chuyển tiếp</Text>
          </View>
        </View>
      )}
      <PollVoteModal
        visible={isVoteModalOpen}
        poll={selectedPoll}
        currentUser={user}
        onClose={() => {
          setIsVoteModalOpen(false);
          setSelectedPoll(null);
        }}
      />

      <Modal
        visible={isInvitePanelOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsInvitePanelOpen(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View
            style={[
              styles.modalHeader,
              { paddingTop: Math.max(insets.top, 12) },
            ]}
          >
            <TouchableOpacity onPress={() => setIsInvitePanelOpen(false)}>
              <Ionicons name="close" size={24} color="#000" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Mời vào nhóm</Text>
            <View style={{ width: 24 }} />
          </View>
          <InviteLinkPanel
            roomId={chatRoomId}
            isOwner={true}
            setIsInvitePanelOpen={setIsInvitePanelOpen}
          />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  flex1: { flex: 1 },
  listContent: { paddingHorizontal: 15, paddingBottom: 10 },
  loadingCenter: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 14,
    color: "#999",
    fontWeight: "500",
  },
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
  pinnedContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#F5F9FF",
    borderBottomWidth: 1,
    borderColor: "#E5E5E5",
    gap: 10,
  },

  pinnedLabel: {
    fontSize: 11,
    color: "#007AFF",
    fontWeight: "600",
  },

  pinnedText: {
    fontSize: 13,
    color: "#333",
    marginTop: 2,
  },
  dissolvedBanner: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#FFE5E5",
    borderBottomWidth: 1,
    borderColor: "#FFD4D4",
    gap: 10,
  },
  dissolvedBannerContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 10,
  },
  dissolvedBannerTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FF3B30",
  },
  dissolvedBannerDesc: {
    fontSize: 12,
    color: "#999",
    marginTop: 2,
  },
  dissolvedBannerBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#FF3B30",
    borderRadius: 6,
  },
  dissolvedBannerBtnText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
  dissolvedText: {
    fontSize: 13,
    color: "#FF3B30",
    fontWeight: "600",
  },
  overlay: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },

  pinnedListBox: {
    width: "85%",
    maxHeight: "60%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
  },

  pinnedListTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
  },

  pinnedItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  pinnedItemRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: "#e2e8f0",
    backgroundColor: "#fff",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0f172a",
  },
  translateBox: {
    width: "88%",
    maxHeight: "82%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
  },
  translateHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  translateTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  translatePickerBox: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 12,
  },
  translateBlock: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  translateLabel: {
    color: "#6B7280",
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 6,
    textTransform: "uppercase",
  },
  translateContent: {
    color: "#111827",
    fontSize: 15,
    lineHeight: 21,
  },
  translatedContent: {
    color: "#0084FF",
    fontSize: 15,
    lineHeight: 21,
    fontWeight: "600",
  },
  translateButton: {
    height: 44,
    borderRadius: 22,
    backgroundColor: "#0084FF",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  translateButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
});
