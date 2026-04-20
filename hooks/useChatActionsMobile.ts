import {
  useDeleteMessagePermanentMutation,
  useRevokeMessageMutation,
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
      mediaTypes: ["images", "videos"],
      allowsMultipleSelection: true,
      quality: 0.4,
    });

    if (!result.canceled) {
      return result.assets;
    }
    return null;
  };

  const createChatFormData = async (
    content?: string,
    images?: ImagePicker.ImagePickerAsset[],
    replyToMessageId?: string | null,
    documents: any[] = [],
  ) => {
    const formData = new FormData();

    if (images && images.length > 0) {
      images.forEach((asset) => {
        const uri = asset.uri;
        const fileExtension = uri.split(".").pop()?.toLowerCase();
        const fileName =
          asset.fileName || `media_${Date.now()}.${fileExtension}`;

        const mimeType =
          asset.uri.includes("video") || fileExtension === "mp4"
            ? "video/mp4"
            : "image/jpeg";

        formData.append("files", {
          uri: Platform.OS === "android" ? uri : uri.replace("file://", ""),
          name: fileName,
          type: mimeType,
        } as any);
      });
    }

    if (documents && documents.length > 0) {
      documents.forEach((doc) => {
        formData.append("files", {
          uri: doc.uri,
          name: doc.name || `file_${Date.now()}`,
          type: doc.mimeType || "application/octet-stream",
        } as any);
      });
    }

    const requestPayload: any = {};
    if (content && content.trim()) {
      requestPayload.content = content;
    }
    if (replyToMessageId) {
      requestPayload.replyToMessageId = replyToMessageId;
    }

    formData.append("request", {
      string: JSON.stringify(requestPayload),
      type: "application/json",
    } as any);

    return formData;
  };

  const handleSendMessage = async (
    chatRoomId: number,
    content?: string,
    images?: ImagePicker.ImagePickerAsset[],
    replyToMessageId?: string | null,
    documents: any[] = [],
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
        documents,
      );

      await sendMessageToChatRoom({
        chatRoomId,
        content: content,
        replyToMessageId: replyToMessageId,
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
