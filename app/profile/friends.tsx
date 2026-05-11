import { useRouter } from "expo-router";
import { ArrowLeft, Check, User, Users, X } from "lucide-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  useAcceptFriendRequestMutation,
  useCancelFriendRequestMutation,
  useGetMyFriendshipsQuery,
  useGetMyReceivedFriendRequestsQuery,
  useGetMySentFriendRequestsQuery,
  useRejectFriendRequestMutation,
} from "@/services/friendship/friendshipApi";

const tabs = [
  { key: "friends", label: "Bạn bè" },
  { key: "received", label: "Đã nhận" },
  { key: "sent", label: "Đã gửi" },
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

  const [acceptFriendRequest, { isLoading: isAccepting }] =
    useAcceptFriendRequestMutation();
  const [rejectFriendRequest, { isLoading: isRejecting }] =
    useRejectFriendRequestMutation();
  const [cancelFriendRequest, { isLoading: isCancelling }] =
    useCancelFriendRequestMutation();

  const friends = friendsData?.data?.result ?? [];
  const receivedRequests = receivedData?.data?.result ?? [];
  const sentRequests = sentData?.data?.result ?? [];

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(tabs)/profile");
    }
  };

  const handleAccept = async (requestId: number) => {
    try {
      await acceptFriendRequest({ requestId }).unwrap();
      await Promise.all([refetchReceived(), refetchFriends()]);
    } catch (error) {
      Alert.alert("Lỗi", "Không thể chấp nhận lời mời. Vui lòng thử lại.");
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
            try {
              await rejectFriendRequest({ requestId }).unwrap();
              await refetchReceived();
            } catch (error) {
              Alert.alert(
                "Lỗi",
                "Không thể từ chối lời mời. Vui lòng thử lại.",
              );
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
            try {
              await cancelFriendRequest({ requestId }).unwrap();
              await refetchSent();
            } catch (error) {
              Alert.alert("Lỗi", "Không thể hủy lời mời. Vui lòng thử lại.");
            }
          },
        },
      ],
    );
  };

  const isLoading =
    isFriendsLoading ||
    isReceivedLoading ||
    isSentLoading ||
    isFriendsFetching ||
    isReceivedFetching ||
    isSentFetching;

  const renderEmpty = (message: string) => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>{message}</Text>
    </View>
  );

  const renderFriendRow = (item: FriendItem) => {
    return (
      <View key={item.relationshipId} style={styles.rowContainer}>
        <View style={styles.userInfo}>
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
        </View>
      </View>
    );
  };

  const renderRequestRow = (
    item: FriendRequestItem,
    type: "received" | "sent",
  ) => {
    const isReceived = type === "received";
    return (
      <View key={item.requestId} style={styles.rowContainer}>
        <View style={styles.userInfo}>
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
        </View>
        <View style={styles.actionGroup}>
          {isReceived ? (
            <>
              <TouchableOpacity
                style={[styles.actionButton, styles.acceptButton]}
                onPress={() => handleAccept(item.requestId)}
                disabled={isAccepting}
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
                onPress={() => handleReject(item.requestId)}
                disabled={isRejecting}
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
              onPress={() => handleCancel(item.requestId)}
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
  };

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
});
