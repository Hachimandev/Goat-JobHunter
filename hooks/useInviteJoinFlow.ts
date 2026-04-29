import { useRouter } from "expo-router";
import { useUser } from "./useUser";
import { useJoinByInviteMutation } from "@/services/chatRoom/invite/inviteApi";
import { Alert } from "react-native";
import { IBackendError } from "@/types/api.d";

export function useInviteJoinFlow() {
  const router = useRouter();
  const { isSignedIn } = useUser();
  const [joinByInvite, { isLoading: isJoining }] = useJoinByInviteMutation();

  async function handlePrimaryAction(inviteToken: string): Promise<void> {
    const normalizedToken = inviteToken.trim();

    if (!normalizedToken) {
      return;
    }

    if (!isSignedIn) {
      router.replace(
        `/(auth)/signin?redirect=${encodeURIComponent(`/invite/${normalizedToken}`)}`,
      );
      return;
    }

    try {
      const response = await joinByInvite({
        inviteToken: normalizedToken,
      }).unwrap();
      const roomId = response.data?.roomId;
      if (!roomId) {
        Alert.alert("Lỗi", "Không tìm thấy phòng chat để tham gia");
        return;
      }
      router.replace(`/chat/${roomId}`);
    } catch (error) {
      const message =
        (error as IBackendError).data?.message || "Không thể tham gia nhóm";
      console.error("[invite] join failed:", message);
      Alert.alert("Lỗi", message);
    }
  }

  return { handlePrimaryAction, isJoining };
}
