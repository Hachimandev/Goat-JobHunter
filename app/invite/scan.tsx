import { useInviteJoinFlow } from "@/hooks/useInviteJoinFlow";
import { useRouter } from "expo-router";
import { CameraView, useCameraPermissions } from "expo-camera";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  getInviteAllowedHosts,
  messageMap,
  parseInviteUrl,
  redactInviteToken,
  trackInviteEvent,
} from "@/utils/invite";

export default function InviteQrScannerScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [isHandling, setIsHandling] = useState(false);
  const lastPayloadRef = useRef<string>("");
  const { joinByInviteToken } = useInviteJoinFlow();
  const allowedHosts = useMemo(() => getInviteAllowedHosts(), []);

  useEffect(() => {
    trackInviteEvent("invite_scan_started", { source: "in_app_scan" });
  }, []);

  const handleScannedPayload = useCallback(
    async (payload: string) => {
      if (isHandling) return;
      if (payload === lastPayloadRef.current) return;
      lastPayloadRef.current = payload;
      setIsHandling(true);

      const parsed = parseInviteUrl(payload, allowedHosts);
      if (!parsed.ok) {
        trackInviteEvent("invite_payload_invalid", { reason: parsed.reason });
        console.info("[invite] invalid qr payload", {
          reason: parsed.reason,
        });
        Alert.alert("QR không hợp lệ", "Mã QR không phải link mời hợp lệ.");
        setIsHandling(false);
        return;
      }

      console.info("[invite] qr payload scanned", {
        inviteToken: redactInviteToken(parsed.token),
      });
      trackInviteEvent("invite_payload_scanned", { source: "in_app_scan" });

      const outcome = await joinByInviteToken(parsed.token, "in_app_scan");
      setIsHandling(false);

      if (outcome === "joined") {
        return;
      }

      if (outcome === "request_pending") {
        Alert.alert(
          "Thành công",
          messageMap[outcome] || messageMap.network_error,
        );
        return;
      }

      Alert.alert(
        "Không thể tham gia",
        messageMap[outcome] || messageMap.network_error,
      );
    },
    [allowedHosts, isHandling, joinByInviteToken],
  );

  if (!permission) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color="#2563eb" />
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={styles.permissionText}>
          Cần quyền camera để quét mã QR lời mời.
        </Text>
        <Pressable style={styles.actionButton} onPress={requestPermission}>
          <Text style={styles.actionButtonText}>Cấp quyền camera</Text>
        </Pressable>
        <Pressable
          style={[styles.actionButton, styles.secondaryButton]}
          onPress={() => router.back()}
        >
          <Text style={styles.secondaryButtonText}>Quay lại</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Quét mã QR lời mời</Text>
      </View>
      <CameraView
        style={styles.camera}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
        onBarcodeScanned={({ data }) => {
          void handleScannedPayload(data);
        }}
      />
      <View style={styles.footer}>
        <Pressable
          style={[styles.actionButton, styles.secondaryButton]}
          onPress={() => router.back()}
        >
          <Text style={styles.secondaryButtonText}>Đóng</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020617",
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#f8fafc",
    gap: 12,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    gap: 4,
  },
  title: {
    color: "#f8fafc",
    fontSize: 18,
    fontWeight: "700",
  },
  subtitle: {
    color: "#cbd5e1",
    fontSize: 13,
  },
  camera: {
    flex: 1,
    marginHorizontal: 12,
    borderRadius: 16,
    overflow: "hidden",
  },
  footer: {
    padding: 16,
  },
  permissionText: {
    fontSize: 15,
    color: "#0f172a",
    textAlign: "center",
  },
  actionButton: {
    minHeight: 44,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2563eb",
  },
  actionButtonText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 14,
  },
  secondaryButton: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#cbd5e1",
  },
  secondaryButtonText: {
    color: "#334155",
    fontWeight: "600",
    fontSize: 14,
  },
});
