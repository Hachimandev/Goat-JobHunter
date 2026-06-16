import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
    Animated,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export interface ToastNotificationProps {
  visible: boolean;
  senderName: string;
  messagePreview: string;
  senderAvatar?: string;
  onPress: () => void;
  onDismiss: () => void;
  duration?: number;
}

export const ChatNotificationToast = ({
  visible,
  senderName,
  messagePreview,
  senderAvatar,
  onPress,
  onDismiss,
  duration = 5000,
}: ToastNotificationProps) => {
  const slideAnim = React.useRef(new Animated.Value(-100)).current;
  const [isShowing, setIsShowing] = useState(false);

  useEffect(() => {
    if (visible) {
      setIsShowing(true);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();

      const timer = setTimeout(() => {
        dismiss();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  const dismiss = () => {
    Animated.timing(slideAnim, {
      toValue: -100,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setIsShowing(false);
      onDismiss();
    });
  };

  if (!isShowing && !visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.content}
        onPress={onPress}
      >
        {/* Avatar */}
        {senderAvatar ? (
          <Image source={{ uri: senderAvatar }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <Ionicons name="person" size={20} color="#fff" />
          </View>
        )}

        {/* Text Content */}
        <View style={styles.textContainer}>
          <Text style={styles.senderName} numberOfLines={1}>
            {senderName}
          </Text>
          <Text style={styles.messagePreview} numberOfLines={1}>
            {messagePreview}
          </Text>
        </View>

        {/* Close Button */}
        <TouchableOpacity onPress={dismiss} style={styles.closeBtn}>
          <Ionicons name="close" size={20} color="#666" />
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 50,
    left: 12,
    right: 12,
    zIndex: 9999,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
    elevation: 5,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  avatarPlaceholder: {
    backgroundColor: "#0084FF",
    justifyContent: "center",
    alignItems: "center",
  },
  textContainer: {
    flex: 1,
    marginRight: 8,
  },
  senderName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
    marginBottom: 4,
  },
  messagePreview: {
    fontSize: 13,
    color: "#666",
    fontWeight: "400",
  },
  closeBtn: {
    padding: 4,
  },
});
