import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ArrowLeft,
  Pencil,
  Shield,
  ShieldOff,
  UserCheck,
  UserPlus,
} from "lucide-react-native";
import React from "react";
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
import { useUser } from "@/hooks/useUser";
import { useFriendshipStatus } from "@/hooks/useFriendshipStatus";
import { useGetUserByIdQuery } from "@/services/user/userApi";
import {
  useBlockUserMutation,
  useCreateFriendRequestMutation,
  useUnblockUserMutation,
} from "@/services/friendship/friendshipApi";

const UNKNOWN = "Chưa cập nhật";
const HIDDEN = "Đã ẩn";

const getText = (value?: string | null, fallback = UNKNOWN) =>
  value && value.trim().length > 0 ? value : fallback;

const formatLongDate = (dateString?: string | null) => {
  if (!dateString) return UNKNOWN;
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return UNKNOWN;

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
};

const formatAddress = (
  addresses?: Array<{ fullAddress?: string; province?: string }>,
) => {
  if (!addresses?.length) return UNKNOWN;

  const addressText = addresses
    .map((address) =>
      [address.fullAddress, address.province].filter(Boolean).join(", "),
    )
    .filter(Boolean)
    .join("; ");

  return addressText || UNKNOWN;
};

const getInitial = (name?: string | null) =>
  getText(name, "U").charAt(0).toUpperCase();

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}:</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

export default function UserProfileScreen() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const router = useRouter();
  const { user: currentUser } = useUser();
  const userIdNum = Number(userId);

  const { data: userData, isLoading: isLoadingUser } = useGetUserByIdQuery(
    userIdNum,
    {
      skip: !Number.isFinite(userIdNum) || userIdNum <= 0,
    },
  );

  const {
    isSelf,
    isFriend,
    hasSentRequest,
    hasReceivedRequest,
    isBlockedByMe,
    isBlockedByOther,
    isBlockedAnyDirection,
    canSendRequest,
    isLoadingPair,
  } = useFriendshipStatus(userIdNum);

  const [createFriendRequest, { isLoading: isCreatingRequest }] =
    useCreateFriendRequestMutation();
  const [blockUser, { isLoading: isBlocking }] = useBlockUserMutation();
  const [unblockUser, { isLoading: isUnblocking }] = useUnblockUserMutation();

  const profile = userData?.data as any;
  const isOwnProfile = isSelf || currentUser?.accountId === userIdNum;
  const isBusy = isLoadingPair || isCreatingRequest || isBlocking || isUnblocking;

  const handleFriendAction = async () => {
    if (!canSendRequest) return;

    try {
      await createFriendRequest({ targetUserId: userIdNum }).unwrap();
    } catch (error) {
      console.error("Friend action failed:", error);
      Alert.alert("Lỗi", "Không thể gửi yêu cầu kết bạn");
    }
  };

  const handleBlockAction = async () => {
    try {
      if (isBlockedByMe) {
        await unblockUser({ targetUserId: userIdNum }).unwrap();
      } else {
        await blockUser({ targetUserId: userIdNum }).unwrap();
      }
    } catch (error) {
      console.error("Block action failed:", error);
      Alert.alert("Lỗi", "Không thể thực hiện hành động");
    }
  };

  const getFriendButtonText = () => {
    if (isLoadingPair || isCreatingRequest) return "Đang tải...";
    if (isFriend) return "Bạn bè";
    if (hasSentRequest) return "Đã gửi yêu cầu";
    if (hasReceivedRequest) return "Chờ xác nhận";
    return "Kết bạn";
  };

  const getBlockButtonText = () => {
    if (isBlocking || isUnblocking) return "Đang xử lý...";
    return isBlockedByMe ? "Bỏ chặn" : "Chặn";
  };

  if (isBlockedByOther) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Trang cá nhân</Text>
        </View>
        <View style={styles.center}>
          <Text style={styles.blockedMessage}>
            Bạn không thể xem thông tin của người dùng này
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (isLoadingUser) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      </SafeAreaView>
    );
  }

  if (!profile) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Text>Không tìm thấy người dùng</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Trang cá nhân</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.profileCard}>
          {profile.avatar ? (
            <Image source={{ uri: profile.avatar }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarFallback}>
              <Text style={styles.avatarFallbackText}>
                {getInitial(profile.fullName)}
              </Text>
            </View>
          )}
          <Text style={styles.nameText}>{getText(profile.fullName, "Người dùng")}</Text>
          <Text style={styles.usernameText}>@{getText(profile.username, "unknown")}</Text>

          {isOwnProfile && (
            <TouchableOpacity
              style={styles.editProfileRow}
              activeOpacity={0.75}
              onPress={() => router.push("/profile/edit")}
            >
              <Pencil size={17} color="#2563eb" />
              <Text style={styles.editProfileText}>Cập nhật thông tin</Text>
            </TouchableOpacity>
          )}

          {isBlockedByMe && (
            <View style={styles.blockedNotice}>
              <Text style={styles.blockedNoticeText}>Bạn đã chặn người này</Text>
            </View>
          )}

          {!isSelf && (
            <View style={styles.actionsContainer}>
              {!isBlockedByMe && (
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    isFriend ? styles.friendButtonActive : styles.friendButton,
                    isBusy && styles.disabledButton,
                  ]}
                  onPress={handleFriendAction}
                  disabled={
                    isBusy ||
                    isFriend ||
                    hasSentRequest ||
                    hasReceivedRequest ||
                    isBlockedAnyDirection
                  }
                >
                  {isFriend ? (
                    <UserCheck size={18} color="#fff" />
                  ) : (
                    <UserPlus size={18} color="#fff" />
                  )}
                  <Text style={styles.actionButtonText}>{getFriendButtonText()}</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[
                  styles.actionButton,
                  isBlockedByMe ? styles.unblockButton : styles.blockButton,
                  isBusy && styles.disabledButton,
                ]}
                onPress={handleBlockAction}
                disabled={isBusy}
              >
                {isBlockedByMe ? (
                  <ShieldOff size={18} color="#fff" />
                ) : (
                  <Shield size={18} color="#fff" />
                )}
                <Text style={styles.actionButtonText}>{getBlockButtonText()}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.summaryText}>
            <Text style={styles.summaryLabel}>Mô tả: </Text>
            {getText(profile.headline, "Chưa cập nhật mô tả")}
          </Text>
          <Text style={styles.summaryText}>
            <Text style={styles.summaryLabel}>Tiểu sử: </Text>
            {getText(profile.bio, "Chưa cập nhật tiểu sử")}
          </Text>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Thông tin ứng viên cơ bản</Text>
          <InfoRow
            label="Số điện thoại"
            value={isOwnProfile ? getText(profile.phone) : HIDDEN}
          />
          <InfoRow label="Giới tính" value={getText(profile.gender)} />
          <InfoRow label="Ngày sinh" value={formatLongDate(profile.dob)} />
          <InfoRow label="Vai trò" value={getText(profile.role?.name)} />
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Hồ sơ ứng viên</Text>
          <InfoRow label="Địa chỉ" value={formatAddress(profile.addresses)} />
          <InfoRow label="Học vấn" value={getText(profile.education)} />
          <InfoRow label="Trình độ" value={getText(profile.level)} />
          <InfoRow
            label="Trạng thái tìm việc"
            value={
              typeof profile.availableStatus === "boolean"
                ? profile.availableStatus
                  ? "Đang tìm việc"
                  : "Chưa sẵn sàng"
                : UNKNOWN
            }
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
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
    marginRight: 12,
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 28,
  },
  profileCard: {
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  avatar: {
    width: 104,
    height: 104,
    borderRadius: 52,
    marginBottom: 14,
    backgroundColor: "#e5e7eb",
  },
  avatarFallback: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: "#2563eb",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },
  avatarFallbackText: {
    fontSize: 36,
    fontWeight: "900",
    color: "#fff",
  },
  nameText: {
    fontSize: 24,
    fontWeight: "900",
    color: "#111827",
    textAlign: "center",
  },
  usernameText: {
    fontSize: 15,
    color: "#64748b",
    marginTop: 4,
  },
  editProfileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "#eff6ff",
    borderWidth: 1,
    borderColor: "#bfdbfe",
  },
  editProfileText: {
    color: "#2563eb",
    fontSize: 14,
    fontWeight: "800",
  },
  actionsContainer: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
    width: "100%",
  },
  actionButton: {
    flex: 1,
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    paddingHorizontal: 12,
    gap: 8,
  },
  friendButton: {
    backgroundColor: "#2563eb",
  },
  friendButtonActive: {
    backgroundColor: "#16a34a",
  },
  blockButton: {
    backgroundColor: "#dc2626",
  },
  unblockButton: {
    backgroundColor: "#64748b",
  },
  disabledButton: {
    opacity: 0.65,
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "800",
  },
  blockedNotice: {
    marginTop: 12,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#fee2e2",
  },
  blockedNoticeText: {
    color: "#991b1b",
    fontWeight: "800",
  },
  sectionCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginTop: 14,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: "#111827",
    marginBottom: 6,
  },
  summaryText: {
    fontSize: 14,
    color: "#334155",
    lineHeight: 22,
    marginBottom: 6,
  },
  summaryLabel: {
    fontWeight: "900",
    color: "#111827",
  },
  infoRow: {
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },
  infoLabel: {
    fontSize: 13,
    color: "#64748b",
    fontWeight: "700",
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 15,
    color: "#111827",
    fontWeight: "600",
    lineHeight: 21,
  },
  blockedMessage: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
});
