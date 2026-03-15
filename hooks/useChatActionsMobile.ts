import { useSendMessageToChatRoomMutation } from "@/services/chatRoom/chatRoomApi";
import { Alert } from "react-native";
import { useUser } from "./useUser";

export default function useChatActionsMobile() {
  const { user, isSignedIn } = useUser();
  const [sendMessageToChatRoom, { isLoading: isSending }] =
    useSendMessageToChatRoomMutation();

  const handleSendMessage = async (chatRoomId: number, content: string) => {
    if (!isSignedIn || !user) {
      Alert.alert("Lỗi", "Vui lòng đăng nhập để gửi tin nhắn.");
      return;
    }

    if (!content.trim()) return;

    try {
      await sendMessageToChatRoom({
        chatRoomId,
        content: content.trim(),
      }).unwrap();
    } catch (error) {
      console.error("Send message error:", error);
      Alert.alert("Lỗi", "Gửi tin nhắn thất bại.");
    }
  };

  return { handleSendMessage, isSending };
}
