import React from "react";
import { StyleSheet, Text, useWindowDimensions, View } from "react-native";
import QRCode from "react-native-qrcode-svg";

interface InviteQrCodeCardProps {
  inviteLink: string;
}

export function InviteQrCodeCard({ inviteLink }: InviteQrCodeCardProps) {
  const { width } = useWindowDimensions();

  // Responsive QR size: max 220px or screen width - 96px padding
  const qrSize = Math.min(width - 96, 220);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mã QR tham gia nhóm</Text>
      <View style={styles.qrContainer}>
        <QRCode value={inviteLink} size={qrSize} />
      </View>
      <Text style={styles.hint}>Quét mã QR để tham gia nhóm</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 16,
    gap: 12,
    alignItems: "center",
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0f172a",
  },
  qrContainer: {
    padding: 12,
    backgroundColor: "#f1f5f9",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  hint: {
    fontSize: 13,
    color: "#64748b",
    textAlign: "center",
  },
});
