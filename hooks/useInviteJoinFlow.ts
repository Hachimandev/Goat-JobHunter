import { useRouter } from "expo-router";
import { useUser } from "./useUser";
import { useJoinByInviteMutation } from "@/services/chatRoom/invite/inviteApi";
import { Alert } from "react-native";
import { IBackendError } from "@/types/api.d";
import {
  InviteJoinOutcome,
  InviteSource,
  messageMap,
  redactInviteToken,
  trackInviteEvent,
} from "@/utils/invite";

export function useInviteJoinFlow() {
  const router = useRouter();
  const { isSignedIn } = useUser();
  const [joinByInvite, { isLoading: isJoining }] = useJoinByInviteMutation();

  function mapInviteErrorToOutcome(message: string): InviteJoinOutcome {
    const normalized = message.toLowerCase();
    if (
      normalized.includes("already a member") ||
      normalized.includes("đã là thành viên")
    ) {
      return "already_joined";
    }
    if (
      normalized.includes("disabled") ||
      normalized.includes("revoked") ||
      normalized.includes("bị tắt")
    ) {
      return "token_revoked";
    }
    if (
      normalized.includes("not found") ||
      normalized.includes("không tồn tại")
    ) {
      return "token_not_found";
    }
    if (
      normalized.includes("unauthorized") ||
      normalized.includes("authenticated")
    ) {
      return "unauthorized";
    }
    return "network_error";
  }

  async function joinByInviteToken(
    inviteToken: string,
    source: InviteSource,
  ): Promise<InviteJoinOutcome> {
    const normalizedToken = inviteToken.trim();

    if (!normalizedToken) {
      return "token_not_found";
    }

    if (!isSignedIn) {
      router.replace(
        `/(auth)/signin?redirect=${encodeURIComponent(`/invite/${normalizedToken}`)}`,
      );
      return "unauthorized";
    }

    try {
      console.info("[invite] join attempt", {
        source,
        inviteToken: redactInviteToken(normalizedToken),
      });
      trackInviteEvent("invite_join_attempt", { source });
      const response = await joinByInvite({
        inviteToken: normalizedToken,
      }).unwrap();
      const roomId = response.data?.roomId;
      const status = response.data?.status;
      if (!roomId) {
        return "token_not_found";
      }
      if (status === "request_pending") {
        router.replace("/(tabs)/chat");
        trackInviteEvent("invite_join_success", { source });
        return "request_pending";
      }
      router.replace(`/chat/${roomId}`);
      trackInviteEvent("invite_join_success", { source });
      return "joined";
    } catch (error) {
      const message =
        (error as IBackendError).data?.message || "Không thể tham gia nhóm";
      const outcome = mapInviteErrorToOutcome(message);
      console.error("[invite] join failed", {
        source,
        outcome,
        inviteToken: redactInviteToken(normalizedToken),
      });
      trackInviteEvent("invite_join_failed", { source, outcome });
      return outcome;
    }
  }

  async function handlePrimaryAction(inviteToken: string): Promise<void> {
    const outcome = await joinByInviteToken(inviteToken, "deep_link");
    if (
      outcome === "joined" ||
      outcome === "request_pending" ||
      outcome === "unauthorized"
    ) {
      if (outcome === "request_pending") {
        Alert.alert(
          "Thành công",
          "Đã gửi yêu cầu tham gia. Vui lòng chờ duyệt.",
        );
      }
      return;
    }
    Alert.alert("Lỗi", messageMap[outcome]);
  }

  return { handlePrimaryAction, isJoining, joinByInviteToken };
}
