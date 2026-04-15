import {
  useDeleteMessagePermanentMutation,
  useRevokeMessageMutation, // Ở web gọi là recallMessage, ở mobile bạn đang dùng revokeMessage
  useSendMessageToChatRoomMutation,
  useSendMessageToNewChatRoomMutation,
} from "@/services/chatRoom/chatRoomApi";
import * as ImagePicker from "expo-image-picker";
import { useCallback, useState } from "react";
import { Alert, Platform } from "react-native";
import { useUser } from "./useUser";

export default function useChatActionsMobile() {
  const { user, isSignedIn } = useUser();

  // Mutations
  const [sendMessageToChatRoom, { isLoading: isSendingMessage }] =
    useSendMessageToChatRoomMutation();
  const [sendMessageToNewChatRoom, { isLoading: isSendingNewMessage }] =
    useSendMessageToNewChatRoomMutation();
  const [revokeMessage] = useRevokeMessageMutation();
  const [deleteMessagePermanent] = useDeleteMessagePermanentMutation();
  const [actioningMessageIds, setActioningMessageIds] = useState<Set<string>>(
    new Set(),
  );

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });
    return !result.canceled ? result.assets : null;
  };

  const createChatFormData = async (
    content?: string,
    images?: ImagePicker.ImagePickerAsset[],
    replyToMessageId?: string | null,
    accountId?: number,
  ) => {
    const formData = new FormData();

    if (images && images.length > 0) {
      for (const img of images) {
        if (Platform.OS === "web") {
          const response = await fetch(img.uri);
          const blob = await response.blob();
          formData.append("files", blob, img.fileName || "image.jpg");
        } else {
          formData.append("files", {
            uri:
              Platform.OS === "android"
                ? img.uri
                : img.uri.replace("file://", ""),
            name: img.fileName || `img_${Date.now()}.jpg`,
            type: img.mimeType || "image/jpeg",
          } as any);
        }
      }
    }

    const payload: any = { content: content?.trim() || "" };
    if (replyToMessageId) payload.replyToMessageId = replyToMessageId;
    if (accountId) payload.accountId = accountId;

    if (Platform.OS === "web") {
      const jsonBlob = new Blob([JSON.stringify(payload)], {
        type: "application/json",
      });
      formData.append("request", jsonBlob);
    } else {
      formData.append("request", {
        string: JSON.stringify(payload),
        type: "application/json",
      } as any);
    }

    return formData;
  };

  // --- HÀNH ĐỘNG GỬI TIN NHẮN (Cập nhật hỗ trợ Reply) ---
  const handleSendMessage = async (
    chatRoomId: number,
    content?: string,
    images?: ImagePicker.ImagePickerAsset[],
    replyToMessageId?: string | null,
  ) => {
    if (!isSignedIn || !user) {
      Alert.alert("Lỗi", "Vui lòng đăng nhập.");
      return { success: false };
    }

    try {
      const formData = await createChatFormData(
        content,
        images,
        replyToMessageId,
      );
      await sendMessageToChatRoom({
        chatRoomId,
        content: content,
        data: formData,
      } as any).unwrap();

      return { success: true };
    } catch (error: any) {
      const serverMsg = error?.data?.message || "Gửi tin nhắn thất bại.";
      Alert.alert("Lỗi", serverMsg);
      throw error;
    }
  };

  // --- HÀNH ĐỘNG THU HỒI (RECALL/REVOKE) ---
  const handleRecallMessage = async (chatRoomId: number, messageId: string) => {
    if (!isSignedIn) return;
    try {
      setActioningMessageIds((prev) => new Set(prev).add(messageId));
      await revokeMessage({ chatRoomId, messageId }).unwrap();
    } catch (error: any) {
      Alert.alert("Lỗi", "Không thể thu hồi tin nhắn.");
    } finally {
      setActioningMessageIds((prev) => {
        const next = new Set(prev);
        next.delete(messageId);
        return next;
      });
    }
  };

  // --- HÀNH ĐỘNG XÓA VĨNH VIỄN (DELETE) ---
  const handleDeleteMessage = async (chatRoomId: number, messageId: string) => {
    if (!isSignedIn) return;
    try {
      setActioningMessageIds((prev) => new Set(prev).add(messageId));
      await deleteMessagePermanent({ chatRoomId, messageId }).unwrap();
    } catch (error: any) {
      Alert.alert("Lỗi", error?.data?.message || "Không thể xóa tin nhắn.");
    } finally {
      setActioningMessageIds((prev) => {
        const next = new Set(prev);
        next.delete(messageId);
        return next;
      });
    }
  };

  const isMessageLoading = useCallback(
    (messageId: string) => actioningMessageIds.has(messageId),
    [actioningMessageIds],
  );

  return {
    handleSendMessage,
    handleRecallMessage,
    handleDeleteMessage,
    pickImage,
    isMessageLoading,
    isSending: isSendingMessage || isSendingNewMessage,
  };
}
