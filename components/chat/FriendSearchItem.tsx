import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useCallback, useState } from "react";
import { useFriendActions } from "@/hooks/useFriendActions";
import { useFriendshipStatus } from "@/hooks/useFriendshipStatus";
import { useRouter } from "expo-router";

export type ChatSearchUser = {
  accountId: number;
  fullName?: string;
  username?: string;
  avatar?: string;
};

interface FriendSearchItemProps {
  item: ChatSearchUser;
  onPress: (item: ChatSearchUser) => void;
}

export function FriendSearchItem({ item, onPress }: FriendSearchItemProps) {
  const router = useRouter();
  const { handleSendFriendRequest } = useFriendActions();
  const {
    isFriend,
    hasSentRequest,
    hasReceivedRequest,
    isBlockedByMe,
    isBlockedByOther,
    isLoadingPair,
  } = useFriendshipStatus(item.accountId);
  const [isSending, setIsSending] = useState(false);

  const handleOpenProfile = useCallback(
    (event: unknown) => {
      if (event && typeof (event as any)?.stopPropagation === "function") {
        (event as any).stopPropagation();
      }
      router.push({
        pathname: "/profile/[userId]",
        params: { userId: String(item.accountId) },
      });
    },
    [item.accountId, router],
  );

  const handleAddFriend = useCallback(
    async (event: unknown) => {
      if (event && typeof (event as any)?.stopPropagation === "function") {
        (event as any).stopPropagation();
      }
      if (isFriend || isLoadingPair || isSending) {
        return;
      }
      setIsSending(true);
      try {
        await handleSendFriendRequest(item.accountId);
      } finally {
        setIsSending(false);
      }
    },
    [
      handleSendFriendRequest,
      item.accountId,
      isFriend,
      isLoadingPair,
      isSending,
    ],
  );

  return (
    <TouchableOpacity style={styles.chatItem} onPress={() => onPress(item)}>
      <TouchableOpacity activeOpacity={0.75} onPress={handleOpenProfile}>
        <Image
          source={{ uri: item.avatar || "https://via.placeholder.com/100" }}
          style={styles.avatar}
        />
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.chatContent}
        activeOpacity={0.75}
        onPress={handleOpenProfile}
      >
        <Text style={styles.chatName}>{item.fullName}</Text>
        <Text style={styles.chatMessage}>@{item.username}</Text>
      </TouchableOpacity>
      <View style={styles.buttonContainer}>
        {isBlockedByMe ? (
          <View style={[styles.statusTag, styles.blockedTag]}>
            <Text style={styles.statusTagText}>đã chặn</Text>
          </View>
        ) : isBlockedByOther ? (
          <View style={[styles.statusTag, styles.blockedTag]}>
            <Text style={styles.statusTagText}>bị chặn</Text>
          </View>
        ) : isFriend ? (
          <View style={styles.statusTag}>
            <Text style={styles.statusTagText}>bạn bè</Text>
          </View>
        ) : hasSentRequest ? (
          <View style={styles.statusTag}>
            <Text style={styles.statusTagText}>đã gửi yêu cầu kết bạn</Text>
          </View>
        ) : hasReceivedRequest ? (
          <View style={styles.statusTag}>
            <Text style={styles.statusTagText}>chờ xác nhận kết bạn</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={[
              styles.addFriendBtn,
              isLoadingPair && styles.disabledButton,
            ]}
            onPress={handleAddFriend}
            disabled={isLoadingPair || isSending}
          >
            {isSending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.addFriendText}>Kết bạn</Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chatItem: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: "center",
    borderBottomColor: "#f0f0f0",
    borderBottomWidth: 0.5,
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
  },
  chatContent: {
    flex: 1,
    marginLeft: 14,
    justifyContent: "center",
  },
  chatName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    flex: 1,
  },
  chatMessage: {
    fontSize: 14,
    color: "#666",
  },
  buttonContainer: {
    justifyContent: "center",
  },
  addFriendBtn: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 18,
    backgroundColor: "#0084FF",
    justifyContent: "center",
    alignItems: "center",
  },
  disabledButton: {
    opacity: 0.6,
  },
  addFriendText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
  friendTag: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 18,
    backgroundColor: "#e5e7eb",
    justifyContent: "center",
    alignItems: "center",
  },
  friendTagText: {
    color: "#374151",
    fontSize: 13,
    fontWeight: "600",
  },
  statusTag: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 18,
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
  },
  statusTagText: {
    color: "#9ca3af", // light gray
    fontSize: 13,
    fontWeight: "600",
  },
  blockedTag: {
    backgroundColor: "#f3f4f6",
  },
});
