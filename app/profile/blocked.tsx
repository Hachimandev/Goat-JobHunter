import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import React from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  useGetMyBlockedUsersQuery,
  useUnblockUserMutation,
} from "@/services/friendship/friendshipApi";

export default function BlockedUsersScreen() {
  const router = useRouter();
  const { data, isLoading, refetch } = useGetMyBlockedUsersQuery({
    page: 1,
    size: 50,
  });
  const [unblockUser, { isLoading: isUnblocking }] = useUnblockUserMutation();

  const handleUnblock = async (targetUserId: number) => {
    try {
      await unblockUser({ targetUserId }).unwrap();
      refetch();
    } catch (error) {
      console.error("Failed to unblock user:", error);
    }
  };

  const renderBlockedUser = ({ item }: { item: any }) => (
    <View style={styles.userRow}>
      <TouchableOpacity
        style={styles.userInfo}
        activeOpacity={0.75}
        onPress={() =>
          router.push({
            pathname: "/profile/[userId]",
            params: { userId: String(item.accountId) },
          })
        }
      >
        {item.avatar ? (
          <Image source={{ uri: item.avatar }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarFallback}>
            <Text style={styles.avatarFallbackText}>
              {item.fullName?.charAt(0) || "U"}
            </Text>
          </View>
        )}
        <View style={styles.textBlock}>
          <Text style={styles.nameText}>{item.fullName || "Người dùng"}</Text>
          <Text style={styles.subText}>@{item.username || "unknown"}</Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.unblockButton}
        onPress={() => handleUnblock(item.accountId)}
        disabled={isUnblocking}
      >
        <Text style={styles.unblockText}>Bỏ chặn</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ArrowLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Người dùng đã chặn</Text>
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" />
        </View>
      ) : (
        <FlatList
          data={data?.data?.result || []}
          keyExtractor={(item) => item.accountId.toString()}
          renderItem={renderBlockedUser}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.emptyText}>
                Chưa có người dùng nào bị chặn
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContainer: {
    padding: 16,
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  avatarFallback: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#e0e0e0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarFallbackText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#666",
  },
  textBlock: {
    flex: 1,
  },
  nameText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  subText: {
    fontSize: 14,
    color: "#666",
  },
  unblockButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  unblockText: {
    color: "#fff",
    fontWeight: "bold",
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
  },
});
