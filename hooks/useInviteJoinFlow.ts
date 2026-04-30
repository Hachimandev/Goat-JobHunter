import { useRouter } from "expo-router";
import { useUser } from "./useUser";
import { useJoinByInviteMutation } from "@/services/chatRoom/invite/inviteApi";
import { Alert } from "react-native";
import { IBackendError } from "@/types/api.d";
import {
  InviteJoinOutcome,
  InviteSource,
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
      if (!roomId) {
        return "token_not_found";
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
    if (outcome === "joined" || outcome === "unauthorized") {
      return;
    }
    const messageMap: Record<InviteJoinOutcome, string> = {
      joined: "Tham gia nhóm thành công",
      already_joined: "Bạn đã là thành viên của nhóm này",
      token_expired: "Link mời đã hết hạn",
      token_revoked: "Link mời hiện không khả dụng",
      token_not_found: "Không tìm thấy link mời",
      unauthorized: "Vui lòng đăng nhập để tham gia",
      network_error: "Không thể tham gia nhóm. Vui lòng thử lại",
    };
    Alert.alert("Lỗi", messageMap[outcome]);
  }

  return { handlePrimaryAction, isJoining, joinByInviteToken };
}
