import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  useAcceptFriendRequestMutation,
  useBlockUserMutation,
  useCancelFriendRequestMutation,
  useGetMyFriendshipsQuery,
  useGetMyReceivedFriendRequestsQuery,
  useGetMySentFriendRequestsQuery,
  useRejectFriendRequestMutation,
  useGetMyBlockedUsersQuery,
  useUnblockUserMutation,
} from "@/services/friendship/friendshipApi";
import { FriendRow } from "./components/FriendRow";
import { FriendRequestRow } from "./components/FriendRequestRow";

const tabs = [
  { key: "friends", label: "Bạn bè" },
  { key: "received", label: "Đã nhận" },
  { key: "sent", label: "Đã gửi" },
  { key: "blocked", label: "Đã chặn" },
] as const;

type TabKey = (typeof tabs)[number]["key"];

type FriendItem = {
  relationshipId: number;
  friendsSince?: string;
  friend: {
    accountId: number;
    fullName?: string;
    username?: string;
    avatar?: string;
  };
};

type FriendRequestItem = {
  requestId: number;
  requestedAt?: string;
  counterpart: {
    accountId: number;
    fullName?: string;
    username?: string;
    avatar?: string;
  };
};

type BlockedUserItem = {
  accountId: number;
  fullName?: string;
  username?: string;
  avatar?: string;
};

export default function FriendsScreen() {
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState<TabKey>("friends");

  const {
    data: friendsData,
    isLoading: isFriendsLoading,
    isFetching: isFriendsFetching,
    refetch: refetchFriends,
  } = useGetMyFriendshipsQuery({ page: 1, size: 50 });

  const {
    data: receivedData,
    isLoading: isReceivedLoading,
    isFetching: isReceivedFetching,
    refetch: refetchReceived,
  } = useGetMyReceivedFriendRequestsQuery({ page: 1, size: 50 });

  const {
    data: sentData,
    isLoading: isSentLoading,
    isFetching: isSentFetching,
    refetch: refetchSent,
  } = useGetMySentFriendRequestsQuery({ page: 1, size: 50 });

  const {
    data: blockedData,
    isLoading: isBlockedLoading,
    isFetching: isBlockedFetching,
    refetch: refetchBlocked,
  } = useGetMyBlockedUsersQuery({ page: 1, size: 50 });

  const [acceptFriendRequest] = useAcceptFriendRequestMutation();
  const [rejectFriendRequest] = useRejectFriendRequestMutation();
  const [cancelFriendRequest] = useCancelFriendRequestMutation();
  const [blockUser] = useBlockUserMutation();
  const [unblockUser] = useUnblockUserMutation();
  const [pendingAction, setPendingAction] = useState<
    | { type: "accept"; id: number }
    | { type: "reject"; id: number }
    | { type: "cancel"; id: number }
    | { type: "remove"; id: number }
    | { type: "unblock"; id: number }
    | null
  >(null);

  const friends = friendsData?.data?.result ?? [];
  const receivedRequests = receivedData?.data?.result ?? [];
  const sentRequests = sentData?.data?.result ?? [];
  const blockedUsers = blockedData?.data?.result ?? [];

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(tabs)/profile");
    }
  };

  const handleAccept = async (requestId: number) => {
    setPendingAction({ type: "accept", id: requestId });
    try {
      await acceptFriendRequest({ requestId }).unwrap();
      await Promise.all([refetchReceived(), refetchFriends()]);
    } catch {
      Alert.alert("Lỗi", "Không thể chấp nhận lời mời. Vui lòng thử lại.");
    } finally {
      setPendingAction(null);
    }
  };

  const handleReject = async (requestId: number) => {
    Alert.alert(
      "Từ chối lời mời",
      "Bạn có chắc muốn từ chối lời mời kết bạn này không?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Từ chối",
          style: "destructive",
          onPress: async () => {
            setPendingAction({ type: "reject", id: requestId });
            try {
              await rejectFriendRequest({ requestId }).unwrap();
              await refetchReceived();
            } catch {
              Alert.alert(
                "Lỗi",
                "Không thể từ chối lời mời. Vui lòng thử lại.",
              );
            } finally {
              setPendingAction(null);
            }
          },
        },
      ],
    );
  };

  const handleCancel = async (requestId: number) => {
    Alert.alert(
      "Hủy lời mời",
      "Bạn có chắc muốn hủy lời mời kết bạn đã gửi không?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xác nhận",
          style: "destructive",
          onPress: async () => {
            setPendingAction({ type: "cancel", id: requestId });
            try {
              await cancelFriendRequest({ requestId }).unwrap();
              await refetchSent();
            } catch {
              Alert.alert("Lỗi", "Không thể hủy lời mời. Vui lòng thử lại.");
            } finally {
              setPendingAction(null);
            }
          },
        },
      ],
    );
  };

  const handleRemove = async (relationshipId: number, targetUserId: number) => {
    Alert.alert(
      "Xóa bạn",
      "Bạn có chắc muốn xóa bạn này khỏi danh sách bạn bè?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xác nhận",
          style: "destructive",
          onPress: async () => {
            setPendingAction({ type: "remove", id: relationshipId });
            try {
              await blockUser({ targetUserId }).unwrap();
              await refetchFriends();
            } catch {
              Alert.alert("Lỗi", "Không thể xóa bạn. Vui lòng thử lại.");
            } finally {
              setPendingAction(null);
            }
          },
        },
      ],
    );
  };

  const handleUnblock = async (targetUserId: number) => {
    Alert.alert("Bỏ chặn", "Bạn có chắc muốn bỏ chặn người dùng này?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xác nhận",
        style: "destructive",
        onPress: async () => {
          setPendingAction({ type: "unblock", id: targetUserId });
          try {
            await unblockUser({ targetUserId }).unwrap();
            await refetchBlocked();
          } catch {
            Alert.alert("Lỗi", "Không thể bỏ chặn. Vui lòng thử lại.");
          } finally {
            setPendingAction(null);
          }
        },
      },
    ]);
  };

  const isLoading =
    isFriendsLoading ||
    isReceivedLoading ||
    isSentLoading ||
    isBlockedLoading ||
    isFriendsFetching ||
    isReceivedFetching ||
    isSentFetching ||
    isBlockedFetching;

  const renderEmpty = (message: string) => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>{message}</Text>
    </View>
  );

  const renderFriendRow = (item: FriendItem) => (
    <FriendRow
      key={item.relationshipId}
      item={item}
      isRemoving={
        pendingAction?.type === "remove" &&
        pendingAction.id === item.relationshipId
      }
      onRemove={handleRemove}
    />
  );

  const renderRequestRow = (
    item: FriendRequestItem,
    type: "received" | "sent",
  ) => (
    <FriendRequestRow
      key={item.requestId}
      item={item}
      type={type}
      isAccepting={
        pendingAction?.type === "accept" && pendingAction.id === item.requestId
      }
      isRejecting={
        pendingAction?.type === "reject" && pendingAction.id === item.requestId
      }
      isCancelling={
        pendingAction?.type === "cancel" && pendingAction.id === item.requestId
      }
      onAccept={handleAccept}
      onReject={handleReject}
      onCancel={handleCancel}
    />
  );

  const renderTabContent = () => {
    if (selectedTab === "friends") {
      if (isFriendsLoading) {
        return (
          <ActivityIndicator
            style={styles.loading}
            size="large"
            color="#1976d2"
          />
        );
      }

      if (friends.length === 0) {
        return renderEmpty("Bạn chưa có bạn bè nào.");
      }

      return friends.map(renderFriendRow);
    }

    if (selectedTab === "received") {
      if (isReceivedLoading) {
        return (
          <ActivityIndicator
            style={styles.loading}
            size="large"
            color="#1976d2"
          />
        );
      }

      if (receivedRequests.length === 0) {
        return renderEmpty("Không có lời mời kết bạn mới.");
      }

      return receivedRequests.map((request) =>
        renderRequestRow(request, "received"),
      );
    }

    if (selectedTab === "sent") {
      if (isSentLoading) {
        return (
          <ActivityIndicator
            style={styles.loading}
            size="large"
            color="#1976d2"
          />
        );
      }

      if (sentRequests.length === 0) {
        return renderEmpty("Bạn chưa gửi lời mời kết bạn nào.");
      }

      return sentRequests.map((request) => renderRequestRow(request, "sent"));
    }

    // Render blocked users tab
    if (selectedTab === "blocked") {
      if (isBlockedLoading) {
        return (
          <ActivityIndicator
            style={styles.loading}
            size="large"
            color="#1976d2"
          />
        );
      }

      if (blockedUsers.length === 0) {
        return renderEmpty("Bạn chưa chặn ai cả.");
      }

      return blockedUsers.map((user: BlockedUserItem) => (
        <View key={user.accountId} style={styles.blockedUserRow}>
          <TouchableOpacity
            style={styles.blockedUserInfo}
            activeOpacity={0.75}
            onPress={() =>
              router.push({
                pathname: "/profile/[userId]",
                params: { userId: String(user.accountId) },
              })
            }
          >
            {user.avatar ? (
              <Image source={{ uri: user.avatar }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarFallbackText}>
                  {user.fullName?.charAt(0) || "U"}
                </Text>
              </View>
            )}
            <View style={styles.userDetails}>
              <Text style={styles.nameText}>
                {user.fullName || "Người dùng"}
              </Text>
              <Text style={styles.usernameText}>
                @{user.username || "unknown"}
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.unblockButton}
            onPress={() => handleUnblock(user.accountId)}
            disabled={
              pendingAction?.type === "unblock" &&
              pendingAction.id === user.accountId
            }
          >
            <Text style={styles.unblockButtonText}>
              {pendingAction?.type === "unblock" &&
              pendingAction.id === user.accountId
                ? "Đang xử lý..."
                : "Bỏ chặn"}
            </Text>
          </TouchableOpacity>
        </View>
      ));
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bạn bè</Text>
      </View>

      <View style={styles.tabBar}>
        {tabs.map((tab) => {
          const active = tab.key === selectedTab;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tabButton, active && styles.tabButtonActive]}
              onPress={() => setSelectedTab(tab.key)}
            >
              <Text style={[styles.tabText, active && styles.tabTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
      >
        {isLoading ? (
          <ActivityIndicator
            style={styles.loading}
            size="large"
            color="#1976d2"
          />
        ) : (
          renderTabContent()
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },
  tabBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#f3f4f6",
    marginHorizontal: 4,
  },
  tabButtonActive: {
    backgroundColor: "#1976d2",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4b5563",
  },
  tabTextActive: {
    color: "#fff",
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  rowContainer: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
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
    backgroundColor: "#d1d5db",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarFallbackText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#374151",
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
    flexWrap: "wrap",
    marginTop: 12,
    justifyContent: "flex-start",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 999,
    marginRight: 8,
    marginTop: 8,
  },
  acceptButton: {
    backgroundColor: "#10b981",
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
    fontWeight: "700",
    marginLeft: 6,
  },
  emptyContainer: {
    marginTop: 48,
    alignItems: "center",
  },
  emptyText: {
    color: "#6b7280",
    fontSize: 15,
  },
  loading: {
    marginTop: 44,
  },
  blockedUserRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  blockedUserInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  userDetails: {
    flex: 1,
    marginLeft: 12,
  },
  usernameText: {
    fontSize: 13,
    color: "#6b7280",
    marginTop: 2,
  },
  unblockButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: "#6c757d",
    borderRadius: 6,
  },
  unblockButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
});
