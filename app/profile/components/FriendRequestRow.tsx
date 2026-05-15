import { useRouter } from "expo-router";
import { Check, X } from "lucide-react-native";
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export type FriendRequestItem = {
  requestId: number;
  requestedAt?: string;
  counterpart: {
    accountId: number;
    fullName?: string;
    username?: string;
    avatar?: string;
  };
};

interface FriendRequestRowProps {
  item: FriendRequestItem;
  type: "received" | "sent";
  isAccepting?: boolean;
  isRejecting?: boolean;
  isCancelling?: boolean;
  onAccept: (requestId: number) => void;
  onReject: (requestId: number) => void;
  onCancel: (requestId: number) => void;
}

export function FriendRequestRow({
  item,
  type,
  isAccepting = false,
  isRejecting = false,
  isCancelling = false,
  onAccept,
  onReject,
  onCancel,
}: FriendRequestRowProps) {
  const router = useRouter();
  const isReceived = type === "received";
  const openProfile = () => {
    router.push({
      pathname: "/profile/[userId]",
      params: { userId: String(item.counterpart.accountId) },
    });
  };

  return (
    <View style={styles.rowContainer}>
      <TouchableOpacity
        style={styles.userInfo}
        activeOpacity={0.75}
        onPress={openProfile}
      >
        {item.counterpart.avatar ? (
          <Image
            source={{ uri: item.counterpart.avatar }}
            style={styles.avatar}
          />
        ) : (
          <View style={styles.avatarFallback}>
            <Text style={styles.avatarFallbackText}>
              {item.counterpart.fullName?.charAt(0) || "U"}
            </Text>
          </View>
        )}
        <View style={styles.textBlock}>
          <Text style={styles.nameText}>
            {item.counterpart.fullName || "Người dùng"}
          </Text>
          <Text style={styles.subText}>
            @{item.counterpart.username || "unknown"}
          </Text>
        </View>
      </TouchableOpacity>

      <View style={styles.actionGroup}>
        {isReceived ? (
          <>
            <TouchableOpacity
              style={[styles.actionButton, styles.acceptButton]}
              onPress={() => onAccept(item.requestId)}
              disabled={isAccepting || isRejecting}
            >
              {isAccepting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Check size={16} color="#fff" />
              )}
              <Text style={styles.actionText}>Chấp nhận</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.rejectButton]}
              onPress={() => onReject(item.requestId)}
              disabled={isAccepting || isRejecting}
            >
              {isRejecting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <X size={16} color="#fff" />
              )}
              <Text style={styles.actionText}>Từ chối</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity
            style={[styles.actionButton, styles.cancelButton]}
            onPress={() => onCancel(item.requestId)}
            disabled={isCancelling}
          >
            {isCancelling ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <X size={16} color="#fff" />
            )}
            <Text style={styles.actionText}>Hủy</Text>
          </TouchableOpacity>
        )}
      </View>
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
  actionGroup: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  acceptButton: {
    backgroundColor: "#16a34a",
  },
  rejectButton: {
    backgroundColor: "#ef4444",
  },
  cancelButton: {
    backgroundColor: "#f97316",
  },
  actionText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
    marginLeft: 6,
  },
});
