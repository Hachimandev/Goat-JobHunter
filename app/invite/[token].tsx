import { useInviteJoinFlow } from "@/hooks/useInviteJoinFlow";
import { useUser } from "@/hooks/useUser";
import {
  useGetInvitePreviewQuery,
} from "@/services/chatRoom/invite/inviteApi";
import { useLocalSearchParams } from "expo-router";
import { Loader2 } from "lucide-react-native";
import React from "react";
import {
  ActivityIndicator,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function InviteTokenScreen() {
  const { token } = useLocalSearchParams<{ token?: string }>();
  const { isSignedIn } = useUser();
  const inviteToken = typeof token === "string" ? token.trim() : "";
  const { handlePrimaryAction, isJoining } = useInviteJoinFlow();

  const {
    data: previewData,
    isLoading: isPreviewLoading,
    isError: isPreviewError,
    refetch: refetchPreview,
  } = useGetInvitePreviewQuery(inviteToken, { skip: !inviteToken });
  const preview = previewData?.data;
  const isInviteDisabled = preview?.inviteEnabled === false;
  const isPreviewMissing =
    Boolean(inviteToken) &&
    !isPreviewLoading &&
    !isPreviewError &&
    !preview;

  if (!inviteToken) {
    return (
      <SafeAreaView style={styles.container} testID="invite-safe-container">
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.card}>
            <Text style={styles.title}>Link mời không hợp lệ</Text>
            <Text style={styles.subtitle}>
              Vui lòng kiểm tra lại link hoặc quét lại mã QR mới nhất.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (isPreviewLoading) {
    return (
      <SafeAreaView style={styles.container} testID="invite-safe-container">
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.card}>
            <ActivityIndicator size="large" color="#2563eb" />
            <Text style={styles.subtitle}>Đang tải thông tin lời mời...</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  const actionDisabled =
    isJoining ||
    isPreviewError ||
    isPreviewMissing ||
    isInviteDisabled;

  return (
    <SafeAreaView style={styles.container} testID="invite-safe-container">
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          {preview?.roomAvatar ? (
            <Image source={{ uri: preview.roomAvatar }} style={styles.avatar} />
          ) : null}

          <Text style={styles.title}>
            {preview?.roomName || "Tham gia nhóm bằng link mời"}
          </Text>

          <Text style={styles.subtitle}>
            {isPreviewError
              ? "Không thể tải thông tin nhóm từ link mời."
              : isPreviewMissing
                ? "Link mời không còn hợp lệ hoặc đã hết hạn."
                : isInviteDisabled
                  ? "Link mời hiện đang bị tắt."
                  : "Nhấn nút bên dưới để tiếp tục."}
          </Text>

          <TouchableOpacity
            style={[
              styles.primaryButton,
              actionDisabled && styles.primaryButtonDisabled,
            ]}
            disabled={actionDisabled}
            onPress={() => handlePrimaryAction(inviteToken)}
          >
            {isJoining ? (
              <View style={styles.loadingRow}>
                <Loader2 size={16} color="#ffffff" />
                <Text style={styles.buttonText}>Đang xử lý...</Text>
              </View>
            ) : (
              <Text style={styles.buttonText}>
                {isSignedIn ? "Tham gia nhóm" : "Đăng nhập để tham gia"}
              </Text>
            )}
          </TouchableOpacity>

          {isPreviewError ? (
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => refetchPreview()}
            >
              <Text style={styles.secondaryButtonText}>Tải lại lời mời</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    paddingVertical: 24,
  },
  card: {
    width: "100%",
    maxWidth: 360,
    borderRadius: 16,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 20,
    gap: 12,
    alignItems: "center",
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0f172a",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#475569",
    textAlign: "center",
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  primaryButton: {
    width: "100%",
    borderRadius: 12,
    backgroundColor: "#2563eb",
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  primaryButtonDisabled: {
    opacity: 0.6,
  },
  secondaryButton: {
    width: "100%",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
    backgroundColor: "#ffffff",
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },
  secondaryButtonText: {
    color: "#334155",
    fontSize: 14,
    fontWeight: "600",
  },
});
