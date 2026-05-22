import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface ChatHeaderProps {
  name: string;
  avatar?: string;
  status?: string;
  profileUserId?: number;
  onPressInfo?: () => void;
  onPressInvite?: () => void;
}

export const ChatHeader = ({
  name,
  avatar,
  status = "Đang hoạt động",
  profileUserId,
  onPressInfo,
  onPressInvite,
}: ChatHeaderProps) => {
  const handleOpenProfile = () => {
    if (!profileUserId) return;
    router.push({
      pathname: "/profile/[userId]",
      params: { userId: String(profileUserId) },
    });
  };

  return (
    <View style={styles.header}>
      <View style={styles.leftContainer}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.headerBtn}
        >
          <Ionicons name="chevron-back" size={28} color="#0084FF" />
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={profileUserId ? 0.75 : 1}
          onPress={handleOpenProfile}
          disabled={!profileUserId}
        >
          <Image
            source={{ uri: avatar || "https://via.placeholder.com/100" }}
            style={styles.avatar}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.headerInfo}
          activeOpacity={profileUserId ? 0.75 : 1}
          onPress={handleOpenProfile}
          disabled={!profileUserId}
        >
          <Text
            style={styles.headerTitle}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {name}
          </Text>
          <Text style={styles.headerStatus}>{status}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.rightActions}>
        <TouchableOpacity style={styles.headerBtn}>
          <Ionicons name="videocam" size={24} color="#0084FF" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerBtn}>
          <Ionicons name="call" size={22} color="#0084FF" />
        </TouchableOpacity>
        {onPressInvite && (
          <TouchableOpacity style={styles.headerBtn} onPress={onPressInvite}>
            <Ionicons name="share-social" size={24} color="#0084FF" />
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.headerBtn} onPress={onPressInfo}>
          <Ionicons name="information-circle" size={24} color="#0084FF" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    height: 60,
    paddingHorizontal: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: "#EEE",
  },
  leftContainer: { flexDirection: "row", alignItems: "center", flex: 1 },
  avatar: { width: 38, height: 38, borderRadius: 19, marginLeft: 4 },
  headerInfo: { marginLeft: 10, flex: 1 },
  headerTitle: { color: "#000", fontSize: 16, fontWeight: "bold" },
  headerStatus: { color: "#888", fontSize: 11 },
  rightActions: { flexDirection: "row", alignItems: "center" },
  headerBtn: { padding: 6, marginHorizontal: 2 },
});
