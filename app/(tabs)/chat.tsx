import { useUser } from "@/hooks/useUser";
import { useFetchChatRoomsQuery } from "@/services/chatRoom/chatRoomApi";
import { Search } from 'lucide-react-native';
import dayjs from "dayjs";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { ActivityIndicator } from "react-native-paper";
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ChatListScreen() {
  const [search, setSearch] = useState("");
  const { user } = useUser();

  const {
    data: chatRoomsRes,
    isLoading,
    refetch,
  } = useFetchChatRoomsQuery({
    page: 0,
    size: 20,
  });

  useFocusEffect(
    useCallback(() => {
      refetch(); // Luôn fetch lại danh sách phòng chat khi màn hình được focus
    }, []),
  );

  const chatRooms = chatRoomsRes?.data?.result || [];

  const filteredChats = chatRooms.filter((chat) =>
    chat.name.toLowerCase().includes(search.toLowerCase()),
  );

  if (isLoading) return <ActivityIndicator style={{ flex: 1 }} />;

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
        <View style={styles.searchBar}>
          <Search size={18} color="#fff" />
          <TextInput
            value={search}
            onChangeText={setSearch}
          placeholder="Tìm kiếm"
          placeholderTextColor="#E0E0E0"
          style={styles.searchInput}
        />
      </View>

      <FlatList
        data={filteredChats}
        keyExtractor={(item) => item.roomId.toString()}
        refreshing={isLoading}
        onRefresh={refetch}
        contentInsetAdjustmentBehavior="scrollableAxes"
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
              source={{ uri: item.avatar || "https://via.placeholder.com/100" }}
              style={styles.avatar}
            />
            <View style={styles.chatContent}>
              <Text style={styles.chatName}>{item.name}</Text>
              <Text numberOfLines={1} style={styles.chatMessage}>
                {item.lastMessagePreview || "Chưa có tin nhắn"}
              </Text>
            </View>
            <Text style={styles.chatTime}>
              {item.lastMessageTime
                ? dayjs(item.lastMessageTime).fromNow()
                : ""}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
      </SafeAreaView>

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F4F6",
  },

  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#0084FF",
  },

  searchInput: {
    flex: 1,
    marginLeft: 8,
    color: "#fff",
    fontSize: 16,
  },
  searchText: {
    color: "#fff",
  },
  chatItem: {
    flexDirection: "row",
    padding: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 0.5,
    borderColor: "#ddd",
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  chatContent: {
    flex: 1,
    marginLeft: 12,
  },
  chatName: {
    fontSize: 16,
    fontWeight: "600",
  },
  chatMessage: {
    color: "#666",
    marginTop: 2,
  },
  chatRight: {
    alignItems: "flex-end",
  },
  chatTime: {
    fontSize: 12,
    color: "#999",
  },

  unreadBadge: {
    marginTop: 6,
    backgroundColor: "red",
    borderRadius: 10,
    paddingHorizontal: 6,
  },
  unreadText: {
    color: "#fff",
    fontSize: 12,
  },
});
