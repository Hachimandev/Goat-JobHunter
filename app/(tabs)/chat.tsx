import { useDebounce } from "@/hooks/useDebounce";
import { useUser } from "@/hooks/useUser";
import { useAppSelector } from "@/lib/hooks";
import {
  useFetchChatRoomsQuery,
  useLazyCheckExistingChatRoomQuery,
  useSendMessageToNewChatRoomMutation,
} from "@/services/chatRoom/chatRoomApi";
import { useLazySearchUsersQuery } from "@/services/user/userApi";
import { Ionicons } from "@expo/vector-icons";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import relativeTime from "dayjs/plugin/relativeTime";
import { router, useFocusEffect } from "expo-router";
import { MessageSquarePlus, ScanQrCode, Search } from "lucide-react-native";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

dayjs.extend(relativeTime);
dayjs.locale("vi");

export default function ChatListScreen() {
  const { user } = useUser();
  const [keyword, setKeyword] = useState("");
  const debouncedKeyword = useDebounce(keyword, 500);

  // Get unread counts from Redux
  const { unreadCounts } = useAppSelector((state) => state.chatNotification);

  // Lấy danh sách phòng chat hiện tại
  const {
    data: chatRoomsRes,
    isLoading: isLoadingRooms,
    refetch,
  } = useFetchChatRoomsQuery(
    {
      page: 1,
      size: 50,
    },
    { pollingInterval: 3000 }, // Poll every 3 seconds for faster updates
  );

  const [triggerSearch, { data: searchData, isFetching: isSearching }] =
    useLazySearchUsersQuery();
  const [checkExistingRoom] = useLazyCheckExistingChatRoomQuery();
  const [createChat, { isLoading: isCreating }] =
    useSendMessageToNewChatRoomMutation();

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, []),
  );

  useEffect(() => {
    if (debouncedKeyword.length >= 2) {
      triggerSearch(debouncedKeyword);
    }
  }, [debouncedKeyword, triggerSearch]);

  const handleStartChat = async (targetUser: any) => {
    if (isCreating) return; // Tránh spam click

    try {
      // 1. Kiểm tra phòng chat tồn tại
      const { data: existingRoomRes } = await checkExistingRoom(
        targetUser.accountId,
      ).unwrap();
      const existingRoom = existingRoomRes;

      if (existingRoom?.roomId) {
        setKeyword(""); // Đóng tìm kiếm
        router.push({
          pathname: "/chat/[id]",
          params: {
            id: existingRoom.roomId,
            name: targetUser.fullName,
            avatar: targetUser.avatar, // Truyền luôn avatar qua để UI đẹp
          },
        });
      } else {
        // 2. Tạo phòng chat mới nếu chưa có
        const res = await createChat({
          accountId: targetUser.accountId,
        }).unwrap();
        if (res.data) {
          setKeyword("");
          router.push({
            pathname: "/chat/[id]",
            params: {
              id: res.data.roomId,
              name: targetUser.fullName,
              avatar: targetUser.avatar,
            },
          });
        }
      }
    } catch (error) {
      console.error("Start chat error", error);
    }
  };

  const chatRooms = chatRoomsRes?.data?.result || [];
  const searchResults =
    searchData?.data?.result.filter(
      (u: any) => u.accountId !== user?.accountId,
    ) || [];
  const isSearchingActive = keyword.length >= 2;

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER ZALO STYLE */}
      <View style={styles.zaloHeader}>
        <Image
          source={{
            uri: (user as any)?.avatar || "https://via.placeholder.com/100",
          }}
          style={styles.myAvatar}
        />
        <View style={styles.searchContainer}>
          <Search size={18} color="#fff" style={styles.searchIcon} />
          <TextInput
            value={keyword}
            onChangeText={setKeyword}
            placeholder="Tìm kiếm..."
            placeholderTextColor="rgba(255,255,255,0.7)"
            style={styles.searchInput}
          />
          {keyword.length > 0 && (
            <TouchableOpacity onPress={() => setKeyword("")}>
              <Ionicons name="close-circle" size={18} color="#fff" />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={styles.headerIconBtn}
          onPress={() => router.push("/chat/create-group")}
        >
          <MessageSquarePlus size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.headerIconBtn}
          onPress={() => router.push("/invite/scan")}
        >
          <ScanQrCode size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* BODY */}
      {isSearchingActive ? (
        <View style={styles.searchResultArea}>
          <Text style={styles.sectionTitle}>Kết quả tìm kiếm</Text>
          {isSearching || isCreating ? (
            <ActivityIndicator color="#0084FF" style={{ marginTop: 20 }} />
          ) : (
            <FlatList
              data={searchResults}
              keyExtractor={(item) => `search-${item.accountId}`}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.chatItem}
                  onPress={() => handleStartChat(item)}
                >
                  <Image
                    source={{
                      uri: item.avatar,
                    }}
                    style={styles.avatar}
                  />
                  <View style={styles.chatContent}>
                    <Text style={styles.chatName}>{item.fullName}</Text>
                    <Text style={styles.chatMessage}>@{item.username}</Text>
                  </View>
                  <View style={styles.addFriendBtn}>
                    <Text style={styles.addFriendText}>Nhắn tin</Text>
                  </View>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <Text style={styles.emptyText}>
                  Không thấy người dùng {keyword}
                </Text>
              }
            />
          )}
        </View>
      ) : (
        <FlatList
          data={chatRooms}
          keyExtractor={(item) => item.roomId.toString()}
          onRefresh={refetch}
          refreshing={isLoadingRooms}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.chatItem}
              onPress={() =>
                router.push({
                  pathname: "/chat/[id]",
                  params: {
                    id: item.roomId,
                    name: item.name,
                    avatar: item.avatar,
                  },
                })
              }
            >
              <Image
                source={{
                  uri: item.avatar || "https://via.placeholder.com/100",
                }}
                style={styles.avatar}
              />
              <View style={styles.chatContent}>
                <View style={styles.chatTopRow}>
                  <Text style={styles.chatName} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={styles.chatTime}>
                    {item.lastMessageTime
                      ? dayjs(item.lastMessageTime).fromNow()
                      : ""}
                  </Text>
                </View>
                <View style={styles.chatBottomRow}>
                  {/* Unread Badge */}
                  {unreadCounts[item.roomId] > 0 && (
                    <View style={styles.unreadBadge}>
                      <Text style={styles.unreadBadgeText}>
                        {unreadCounts[item.roomId] > 99
                          ? "99+"
                          : unreadCounts[item.roomId]}
                      </Text>
                    </View>
                  )}
                  <Text numberOfLines={1} style={styles.chatMessage}>
                    {item.lastMessagePreview || "Bắt đầu trò chuyện"}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  zaloHeader: {
    height: 64,
    backgroundColor: "#0084FF",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    gap: 12,
  },
  myAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1.5,
    borderColor: "#fff",
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.25)",
    borderRadius: 20,
    paddingHorizontal: 12,
    height: 38,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, color: "#fff", fontSize: 15, paddingVertical: 0 },
  headerIconBtn: { padding: 4 },

  chatItem: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: "center",
  },
  avatar: { width: 54, height: 54, borderRadius: 27 },
  chatContent: { flex: 1, marginLeft: 14, justifyContent: "center" },
  chatTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  chatName: { fontSize: 16, fontWeight: "600", color: "#000", flex: 1 },
  chatTime: { fontSize: 11, color: "#888" },
  chatBottomRow: { flexDirection: "row", justifyContent: "space-between" },
  chatMessage: { fontSize: 14, color: "#666", flex: 1 },

  sectionTitle: {
    padding: 12,
    fontSize: 12,
    fontWeight: "bold",
    color: "#666",
    backgroundColor: "#F0F2F5",
    textTransform: "uppercase",
  },
  unreadBadge: {
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#FF3B30",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  unreadBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  searchResultArea: { flex: 1 },
  emptyText: { textAlign: "center", marginTop: 40, color: "#999" },
  addFriendBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 18,
    backgroundColor: "#E3F2FD",
  },
  addFriendText: { color: "#0084FF", fontSize: 13, fontWeight: "600" },
});
