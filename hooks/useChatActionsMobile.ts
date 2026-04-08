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
        images.forEach((img, index) => {
          const fileToAppend = {
            uri:
              Platform.OS === "android"
                ? img.uri
                : img.uri.replace("file://", ""),
            name: img.fileName || `img_${Date.now()}_${index}.jpg`,
            type: img.mimeType || "image/jpeg",
          };
          // @ts-ignore
          formData.append("files", fileToAppend);
        });
      }

      if (content?.trim()) {
        const requestBody = JSON.stringify({ content: content.trim() });
        if (Platform.OS === "web") {
          formData.append(
            "request",
            new Blob([requestBody], { type: "application/json" }),
          );
        } else {
          formData.append("request", requestBody);
        }
      }

      await sendMessageToChatRoom({
        chatRoomId,
        content,
        // @ts-ignore
        data: formData,
      } as any).unwrap();

      return { success: true };
    } catch (error) {
      console.error("Send Error:", error);
      throw error;
    }
  };

  return { handleSendMessage, pickImage, isSending };
}
