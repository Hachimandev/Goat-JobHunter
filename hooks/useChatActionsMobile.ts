import { useSendMessageToChatRoomMutation } from "@/services/chatRoom/chatRoomApi";
import * as ImagePicker from "expo-image-picker";
import { Alert, Platform } from "react-native";
import { useUser } from "./useUser";

export default function useChatActionsMobile() {
  const { user, isSignedIn } = useUser();
  const [sendMessageToChatRoom, { isLoading: isSending }] =
    useSendMessageToChatRoomMutation();

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });
    return !result.canceled ? result.assets : null;
  };

  const handleSendMessage = async (
    chatRoomId: number,
    content?: string,
    images?: ImagePicker.ImagePickerAsset[],
  ) => {
    if (!isSignedIn || !user) {
      Alert.alert("Lỗi", "Vui lòng đăng nhập.");
      return { success: false };
    }

    try {
      const formData = new FormData();

      if (images && images.length > 0) {
        for (const img of images) {
          if (Platform.OS === "web") {
            const response = await fetch(img.uri);
            const blob = await response.blob();
            formData.append("files", blob, img.fileName || "image.jpg");
          } else {
            const filePayload = {
              uri:
                Platform.OS === "android"
                  ? img.uri
                  : img.uri.replace("file://", ""),
              name: img.fileName || `img_${Date.now()}.jpg`,
              type: img.mimeType || "image/jpeg",
            };
            // @ts-ignore
            formData.append("files", filePayload);
          }
        }
      }

      const payload = { content: content?.trim() || "" };

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

      await sendMessageToChatRoom({
        chatRoomId,
        content: content,
        // @ts-ignore
        data: formData,
      } as any).unwrap();

      return { success: true };
    } catch (error: any) {
      console.error(">>> SEND MESSAGE FAILED:", error);
      const serverMsg = error?.data?.message || "Lỗi không xác định";
      console.log(">>> SERVER ERROR MESSAGE:", serverMsg);
      throw error;
    }
  };

  return { handleSendMessage, pickImage, isSending };
}
