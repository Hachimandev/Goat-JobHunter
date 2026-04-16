import {
  useFetchFilesInChatRoomQuery,
  useFetchMediaInChatRoomQuery,
} from "@/services/chatRoom/chatRoomApi";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ChatDetail() {
  const { id, name, avatar, messages } = useLocalSearchParams<{
    id: string;
    name: string;
    avatar: string;
    messages: string;
  }>();
  const chatRoomId = Number(id);
  const parsedMessages = messages ? JSON.parse(messages) : [];

  const [activeTab, setActiveTab] = useState<"media" | "files">("media");

  const { data: mediaData } = useFetchMediaInChatRoomQuery(
    { chatRoomId },
    { skip: !chatRoomId },
  );
  const { data: filesData } = useFetchFilesInChatRoomQuery(
    { chatRoomId },
    { skip: !chatRoomId },
  );

  const media = mediaData?.data || [];
  const files = filesData?.data || [];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Tùy chọn</Text>

        <View style={{ width: 24 }} />
      </View>
      {/* PROFILE */}
      <View style={styles.profile}>
        <Image
          source={{ uri: avatar || "https://i.pravatar.cc/150?img=12" }}
          style={styles.avatar}
        />
        <Text style={styles.name}>{name}</Text>
      </View>

      {/* QUICK ACTIONS */}
      <View style={styles.quickActions}>
        <TouchableOpacity style={styles.quickItem}>
          <Ionicons name="person-outline" size={20} />
          <Text style={styles.quickText}>Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.quickItem}>
          <Ionicons name="notifications-off-outline" size={20} />
          <Text style={styles.quickText}>Tắt thông báo</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.quickItem}>
          <Ionicons name="ban-outline" size={20} />
          <Text style={styles.quickText}>Chặn</Text>
        </TouchableOpacity>
      </View>

      {/* TABS */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "media" && styles.activeTab]}
          onPress={() => setActiveTab("media")}
        >
          <Text>Phương tiện</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === "files" && styles.activeTab]}
          onPress={() => setActiveTab("files")}
        >
          <Text>Files</Text>
        </TouchableOpacity>
      </View>

      {/* CONTENT */}
      <View style={{ flex: 1 }}>
        {activeTab === "media" ? (
          media.length > 0 ? (
            <View style={styles.mediaGrid}>
              {media.map((item: any, index: number) => (
                <Image
                  key={item.messageId ?? index}
                  source={{ uri: item.content }}
                  style={styles.mediaItem}
                />
              ))}
            </View>
          ) : (
            <Text style={styles.emptyText}>Chưa có phương tiện nào</Text>
          )
        ) : files.length > 0 ? (
          files.map((file: any, index: number) => (
            <View key={file.messageId ?? index} style={styles.fileItem}>
              <Ionicons name="document-text-outline" size={20} />
              <Text style={{ marginLeft: 10 }}>
                {file.content.split("/").pop()}
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>Chưa có file nào</Text>
        )}
      </View>
    </SafeAreaView>
  );
}

/* STYLES */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F2F2F7" },

  header: {
    height: 56,
    backgroundColor: "#0084FF",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    justifyContent: "space-between",
  },
  headerTitle: { color: "#fff", fontSize: 16, fontWeight: "600" },

  option: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  optionText: { fontSize: 15 },
  desc: { color: "#999", fontSize: 13 },

  divider: { height: 10 },

  toggle: {
    width: 40,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#ccc",
  },

  delete: {
    backgroundColor: "#fff",
    paddingVertical: 16,
    alignItems: "center",
  },
  deleteText: { color: "red", fontSize: 15 },

  mediaGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },

  mediaItem: {
    width: "33%",
    height: 120,
  },

  fileItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderColor: "#eee",
  },

  emptyText: {
    textAlign: "center",
    marginTop: 20,
    color: "#888",
  },
  profile: {
    alignItems: "center",
    paddingVertical: 20,
    backgroundColor: "#fff",
  },

  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
  },

  name: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: "600",
  },

  quickActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#fff",
    paddingVertical: 16,
    borderTopWidth: 1,
    borderColor: "#eee",
  },

  quickItem: {
    alignItems: "center",
  },

  quickText: {
    marginTop: 6,
    fontSize: 12,
  },

  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    marginTop: 10,
  },

  tab: {
    flex: 1,
    padding: 12,
    alignItems: "center",
  },

  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: "#0084FF",
  },
});
