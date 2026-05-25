import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { RenderModeType, RtcSurfaceView } from "react-native-agora";

interface CallParticipantTileProps {
  accountId: number;
  fullName: string;
  avatar?: string | null;
  isCurrentUser: boolean;
  audioActive: boolean;
  videoActive: boolean;
  agoraUid: number | null;
  showVideo: boolean;
  style?: object;
}

export const CallParticipantTile = React.memo(function CallParticipantTile({
  accountId,
  fullName,
  avatar,
  isCurrentUser,
  audioActive,
  videoActive,
  agoraUid,
  showVideo,
  style,
}: CallParticipantTileProps) {
  const canRenderVideo =
    showVideo && videoActive && agoraUid !== null;

  return (
    <View style={[styles.container, style]}>
      {canRenderVideo ? (
        <RtcSurfaceView
          style={StyleSheet.absoluteFill}
          canvas={{
            uid: agoraUid,
            renderMode: RenderModeType.RenderModeHidden,
          }}
        />
      ) : (
        <View style={styles.avatarFallback}>
          <Image
            source={{ uri: avatar || "https://via.placeholder.com/120" }}
            style={styles.fallbackAvatar}
          />
        </View>
      )}

      <View style={styles.labelRow}>
        <Text style={styles.name} numberOfLines={1}>
          {isCurrentUser ? "Bạn" : fullName}
        </Text>
        <Ionicons
          name={audioActive ? "mic" : "mic-off"}
          size={16}
          color="#FFFFFF"
        />
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    borderRadius: 24,
    backgroundColor: "#111C2B",
    overflow: "hidden",
    justifyContent: "flex-end",
  },
  avatarFallback: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#111C2B",
  },
  fallbackAvatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: "rgba(5,10,18,0.52)",
  },
  name: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
    marginRight: 8,
  },
});
