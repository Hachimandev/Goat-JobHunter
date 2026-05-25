import { useRouter } from "expo-router";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export type FriendItem = {
  relationshipId: number;
  friendsSince?: string;
  friend: {
    accountId: number;
    fullName?: string;
    username?: string;
    avatar?: string;
  };
};

interface FriendRowProps {
  item: FriendItem;
  isRemoving?: boolean;
  onRemove: (relationshipId: number, targetUserId: number) => void;
}

export function FriendRow({ item }: FriendRowProps) {
  const router = useRouter();

  const openProfile = () => {
    router.push({
      pathname: "/profile/[userId]",
      params: { userId: String(item.friend.accountId) },
    });
  };

  return (
    <View style={styles.rowContainer}>
      <TouchableOpacity
        style={styles.userInfo}
        activeOpacity={0.75}
        onPress={openProfile}
      >
        {item.friend.avatar ? (
          <Image source={{ uri: item.friend.avatar }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarFallback}>
            <Text style={styles.avatarFallbackText}>
              {item.friend.fullName?.charAt(0) || "U"}
            </Text>
          </View>
        )}
        <View style={styles.textBlock}>
          <Text style={styles.nameText}>
            {item.friend.fullName || "Người dùng"}
          </Text>
          <Text style={styles.subText}>
            @{item.friend.username || "unknown"}
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  rowContainer: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 999,
    marginRight: 12,
  },
  avatarFallback: {
    width: 50,
    height: 50,
    borderRadius: 999,
    marginRight: 12,
    backgroundColor: "#e5e7eb",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarFallbackText: {
    color: "#374151",
    fontSize: 18,
    fontWeight: "700",
  },
  textBlock: {
    flex: 1,
  },
  nameText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  subText: {
    fontSize: 13,
    color: "#6b7280",
    marginTop: 2,
  },
});
