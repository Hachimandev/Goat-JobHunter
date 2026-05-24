import React, { useEffect } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { router } from "expo-router";
import { useCallRoomActions } from "@/hooks/useCallRoomActions";
import { useUser } from "@/hooks/useUser";
import { CallTypeEnum } from "@/types/enum";

export default function IncomingCallScreen() {
  const { user } = useUser();
  const {
    incomingCall,
    handleAcceptIncomingCall,
    handleDeclineIncomingCall,
    watchChatRoom,
  } = useCallRoomActions();

  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withRepeat(
      withTiming(1.3, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, []);

  useEffect(() => {
    if (incomingCall) {
      watchChatRoom(incomingCall.chatRoomId);
    }
    return () => watchChatRoom(null);
  }, [incomingCall, watchChatRoom]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.get() }],
    opacity: 0.2,
  }));

  if (!incomingCall) {
    return null;
  }

  return (
    <View style={styles.overlay}>
      <View style={styles.card}>
        <Animated.View style={[styles.pulseRing, pulseStyle]} />

        <Image
          source={{ uri: "https://via.placeholder.com/120" }}
          style={styles.avatar}
        />

        <Text style={styles.kicker}>Cuộc gọi đến</Text>
        <Text style={styles.title}>
          {incomingCall.callType === CallTypeEnum.VIDEO
            ? "Cuộc gọi video"
            : "Cuộc gọi thoại"}
        </Text>
        <Text style={styles.description}>
          Thành viên trong phòng chat này đang gọi bạn.
        </Text>

        <View style={styles.actions}>
          <Pressable
            style={[styles.actionButton, styles.declineButton]}
            onPress={() => {
              void handleDeclineIncomingCall();
              if (router.canGoBack()) router.back();
              else router.replace("/(tabs)/chat");
            }}
          >
            <Ionicons name="call" size={28} color="#B91C1C" style={{ transform: [{ rotate: "135deg" }] }} />
            <Text style={styles.declineText}>Từ chối</Text>
          </Pressable>

          <Pressable
            style={[styles.actionButton, styles.acceptButton]}
            onPress={() => {
              void handleAcceptIncomingCall();
            }}
          >
            <Ionicons name="call" size={28} color="#FFFFFF" />
            <Text style={styles.acceptText}>Tham gia</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(10,15,26,0.85)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  card: {
    width: "100%",
    maxWidth: 360,
    borderRadius: 28,
    backgroundColor: "#1A2332",
    paddingHorizontal: 22,
    paddingVertical: 32,
    alignItems: "center",
    position: "relative",
  },
  pulseRing: {
    position: "absolute",
    top: 40,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#2563EB",
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 20,
  },
  kicker: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    color: "#7FB1FF",
  },
  title: {
    marginTop: 10,
    fontSize: 24,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  description: {
    marginTop: 10,
    fontSize: 14,
    lineHeight: 20,
    color: "#C3D5F6",
    textAlign: "center",
  },
  actions: {
    flexDirection: "row",
    marginTop: 32,
    gap: 24,
  },
  actionButton: {
    alignItems: "center",
    gap: 8,
  },
  declineButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#FEE2E2",
    justifyContent: "center",
    alignItems: "center",
  },
  acceptButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#2563EB",
    justifyContent: "center",
    alignItems: "center",
  },
  declineText: { color: "#FEE2E2", fontSize: 12, fontWeight: "600" },
  acceptText: { color: "#FFFFFF", fontSize: 12, fontWeight: "600" },
});
