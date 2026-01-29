import React from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const chats = [
  {
    id: "1",
    name: "Sơn Lưu",
    lastMessage: "hello",
    time: "4 giờ",
    unread: 0,
    avatar: "https://i.pravatar.cc/100?img=3",
  },
];

export default function ChatListScreen({ onOpenChat }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.searchBar}>
        <Text style={styles.searchText}>🔍 Tìm kiếm</Text>
      </View>

      <FlatList
        data={chats}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.chatItem}
            onPress={() => onOpenChat?.(item)}
          >
            <Image source={{ uri: item.avatar }} style={styles.avatar} />
            <View style={styles.chatContent}>
              <Text style={styles.chatName}>{item.name}</Text>
              <Text style={styles.chatMessage} numberOfLines={1}>
                {item.lastMessage}
              </Text>
            </View>
            <View style={styles.chatRight}>
              <Text style={styles.chatTime}>{item.time}</Text>
              {item.unread > 0 && (
                <View style={styles.unreadBadge}>
                  <Text style={styles.unreadText}>{item.unread}</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F4F6",
  },

  searchBar: {
    padding: 12,
    backgroundColor: "#0084FF",
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
