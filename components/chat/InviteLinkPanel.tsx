import {
  useGetInviteLinkQuery,
  useRotateInviteLinkMutation,
} from "@/services/chatRoom/invite/inviteApi";
import { InviteQrCodeCard } from "./InviteQrCodeCard";
import * as Clipboard from "expo-clipboard";
import { Copy, RotateCcw } from "lucide-react-native";
import React from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface InviteLinkPanelProps {
  roomId: number;
  isOwner?: boolean;
}

export function InviteLinkPanel({ roomId, isOwner = false }: InviteLinkPanelProps) {
  const { data: inviteData, isLoading } = useGetInviteLinkQuery(roomId);
  const invite = inviteData?.data;
  const [rotateInvite, { isLoading: isRotating }] =
    useRotateInviteLinkMutation();

  const handleCopyLink = async () => {
    if (!invite?.inviteLink) return;
    try {
      await Clipboard.setStringAsync(invite.inviteLink);
      Alert.alert("Thành công", "Đã sao chép link mời");
    } catch {
      Alert.alert("Lỗi", "Không thể sao chép link mời");
    }
  };

  const handleRotate = async () => {
    try {
      await rotateInvite(roomId).unwrap();
      Alert.alert("Thành công", "Đã xoay lại link mời");
    } catch {
      Alert.alert("Lỗi", "Không thể xoay lại link mời");
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (!invite) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Không thể tải thông tin link mời</Text>
      </View>
    );
  }

  const hasShareableInvite = Boolean(invite.inviteEnabled && invite.inviteLink);
  const inviteStatusMessage = invite.inviteEnabled
    ? "Link mời đang hoạt động. Bạn có thể sao chép hoặc quét QR bên dưới."
    : "Link mời hiện đang tắt. Bật lại từ backend hoặc xoay link trước khi chia sẻ.";

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.section}>
        <Text style={styles.title}>Link mời nhóm</Text>

        <View style={styles.linkBox}>
          <Text style={styles.link} numberOfLines={3}>
            {invite.inviteLink || "Chưa có link mời khả dụng"}
          </Text>
          <TouchableOpacity
            style={styles.copyButton}
            onPress={handleCopyLink}
            disabled={!hasShareableInvite}
          >
            <Copy size={16} color="#fff" />
            <Text style={styles.copyButtonText}>Sao chép</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Trạng thái:</Text>
          <Text
            style={[
              styles.statusBadge,
              invite.inviteEnabled
                ? styles.statusBadgeEnabled
                : styles.statusBadgeDisabled,
            ]}
          >
            {invite.inviteEnabled ? "Đang bật" : "Đang tắt"}
          </Text>
        </View>

        <Text style={styles.statusHelpText}>{inviteStatusMessage}</Text>

        {isOwner && (
          <TouchableOpacity
            style={styles.rotateButton}
            onPress={handleRotate}
            disabled={isRotating}
          >
            <RotateCcw size={16} color="#fff" />
            <Text style={styles.rotateButtonText}>
              {isRotating ? "Đang xoay..." : "Xoay lại"}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {hasShareableInvite ? (
        <InviteQrCodeCard inviteLink={invite.inviteLink} />
      ) : (
        <View style={styles.section}>
          <Text style={styles.title}>Mã QR tham gia nhóm</Text>
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              Mã QR chỉ hiển thị khi link mời đang bật và có thể chia sẻ.
            </Text>
          </View>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.title}>Thông tin chia sẻ</Text>
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            ✓ Share link này để mời bạn bè tham gia nhóm
          </Text>
          <Text style={styles.infoText}>
            ✓ Bạn có thể xoay lại link để vô hiệu hóa link cũ
          </Text>
          <Text style={styles.infoText}>
            ✓ Chỉ chủ nhóm mới có thể quản lý link mời
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
    padding: 16,
  },
  content: {
    paddingBottom: 24,
  },
  section: {
    marginBottom: 24,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 16,
    gap: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0f172a",
  },
  linkBox: {
    backgroundColor: "#f1f5f9",
    borderRadius: 8,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  link: {
    flex: 1,
    fontSize: 12,
    color: "#475569",
    fontFamily: "monospace",
  },
  copyButton: {
    backgroundColor: "#2563eb",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  copyButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statusLabel: {
    fontSize: 14,
    color: "#64748b",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    fontSize: 12,
    fontWeight: "600",
  },
  statusBadgeEnabled: {
    backgroundColor: "#dcfce7",
    color: "#166534",
  },
  statusBadgeDisabled: {
    backgroundColor: "#fee2e2",
    color: "#991b1b",
  },
  statusHelpText: {
    fontSize: 13,
    lineHeight: 18,
    color: "#475569",
  },
  rotateButton: {
    backgroundColor: "#2563eb",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  rotateButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  infoBox: {
    backgroundColor: "#f1f5f9",
    borderRadius: 8,
    padding: 12,
    gap: 8,
  },
  infoText: {
    fontSize: 13,
    color: "#475569",
    lineHeight: 18,
  },
  errorText: {
    fontSize: 14,
    color: "#ef4444",
    textAlign: "center",
  },
});
