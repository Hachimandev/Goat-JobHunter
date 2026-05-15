import { useFriendActions } from "@/hooks/useFriendActions";
import { useFriendshipStatus } from "@/hooks/useFriendshipStatus";
import { useUser } from "@/hooks/useUser";
import { useFetchUserByIdQuery } from "@/services/user/userApi";
import { ArrowLeft, Ban, Check, Clock, Shield, ShieldOff, UserCheck, UserPlus } from "lucide-react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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

const formatAddress = (addresses?: Array<{ fullAddress?: string; province?: string }>) => {
  if (!addresses?.length) return UNKNOWN;

  const addressText = addresses
    .map((address) => [address.fullAddress, address.province].filter(Boolean).join(", "))
    .filter(Boolean)
    .join("; ");

  return addressText || UNKNOWN;
};

const getInitial = (name?: string | null) => getText(name, "U").charAt(0).toUpperCase();

type InfoItem = {
  label: string;
  value: string;
};

function InfoSection({ title, items }: { title: string; items: InfoItem[] }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {items.map((item) => (
        <View key={`${title}-${item.label}`} style={styles.infoRow}>
          <Text style={styles.infoLabel}>{item.label}:</Text>
          <Text style={styles.infoValue}>{item.value}</Text>
        </View>
      ))}
    </View>
  );
}

export default function UserProfileScreen() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const router = useRouter();
  const { user: currentUser } = useUser();
  const userIdNum = Number(userId);

  const {
    data: userData,
    isLoading: isLoadingUser,
    isFetching: isFetchingUser,
    isError,
  } = useFetchUserByIdQuery(userIdNum, {
    skip: !Number.isFinite(userIdNum) || userIdNum <= 0,
  });

  const {
    isSelf,
    isFriend,
    hasSentRequest,
    hasReceivedRequest,
    isBlockedByMe,
    isBlockedByOther,
    canSendRequest,
    canAccept,
    canBlock,
    canUnblock,
    incomingRequestId,
    isLoadingPair,
  } = useFriendshipStatus(userIdNum);

  const {
    handleSendFriendRequest,
    handleAcceptFriendRequest,
    handleBlockUser,
    handleUnblockUser,
    isMutating,
  } = useFriendActions();

  const profile = userData?.data as any;
  const isOwnProfile = isSelf || currentUser?.accountId === profile?.accountId;
  const hideSensitiveContact = !isOwnProfile;
  const isApplicant = profile?.role?.name === "APPLICANT" || "availableStatus" in (profile ?? {});
  const displayName = getText(profile?.fullName, "Người dùng");
  const description = getText(profile?.headline, "Chưa cập nhật mô tả");
  const bio = getText(profile?.bio, "Chưa cập nhật tiểu sử");

  const isBusy = isLoadingPair || isMutating;

  const basicItems: InfoItem[] = [
    { label: "Số điện thoại", value: hideSensitiveContact ? HIDDEN : getText(profile?.phone) },
    { label: "Giới tính", value: getText(profile?.gender) },
    { label: "Ngày sinh", value: formatLongDate(profile?.dob) },
    { label: "Vai trò", value: getText(profile?.role?.name) },
  ];

  const applicantItems: InfoItem[] = [
    { label: "Địa chỉ", value: formatAddress(profile?.addresses) },
    { label: "Học vấn", value: getText(profile?.education) },
    { label: "Trình độ", value: getText(profile?.level) },
    {
      label: "Trạng thái tìm việc",
      value: profile?.availableStatus ? "Đang tìm việc" : "Chưa sẵn sàng",
    },
  ];

  const renderFriendAction = () => {
    if (isSelf || isBlockedByMe) return null;

    if (isFriend) {
      return (
        <View style={[styles.primaryAction, styles.friendStatus]}>
          <UserCheck size={18} color="#0f766e" />
          <Text style={[styles.primaryActionText, styles.friendStatusText]}>Bạn bè</Text>
        </View>
      );
    }

    if (hasReceivedRequest) {
      return (
        <TouchableOpacity
          style={[styles.primaryAction, styles.acceptButton, isBusy && styles.disabledAction]}
          onPress={() => incomingRequestId && handleAcceptFriendRequest(incomingRequestId)}
          disabled={!canAccept || isBusy || !incomingRequestId}
        >
          {isBusy ? <ActivityIndicator color="#fff" /> : <Check size={18} color="#fff" />}
          <Text style={styles.primaryActionText}>Chấp nhận bạn bè</Text>
        </TouchableOpacity>
      );
    }

    if (hasSentRequest) {
      return (
        <View style={[styles.primaryAction, styles.sentStatus]}>
          <Clock size={18} color="#92400e" />
          <Text style={[styles.primaryActionText, styles.sentStatusText]}>Đã gửi yêu cầu</Text>
        </View>
      );
    }

    return (
      <TouchableOpacity
        style={[styles.primaryAction, styles.addButton, (!canSendRequest || isBusy) && styles.disabledAction]}
        onPress={() => handleSendFriendRequest(userIdNum)}
        disabled={!canSendRequest || isBusy}
      >
        {isBusy ? <ActivityIndicator color="#fff" /> : <UserPlus size={18} color="#fff" />}
        <Text style={styles.primaryActionText}>Kết bạn</Text>
      </TouchableOpacity>
    );
  };

  const renderBlockAction = () => {
    if (isSelf) return null;

    return (
      <TouchableOpacity
        style={[
          styles.secondaryAction,
          isBlockedByMe ? styles.unblockButton : styles.blockButton,
          isBusy && styles.disabledAction,
        ]}
        onPress={() => (isBlockedByMe ? handleUnblockUser(userIdNum) : handleBlockUser(userIdNum))}
        disabled={(isBlockedByMe ? !canUnblock : !canBlock) || isBusy}
      >
        {isBusy ? (
          <ActivityIndicator color={isBlockedByMe ? "#0f172a" : "#991b1b"} />
        ) : isBlockedByMe ? (
          <ShieldOff size={18} color="#0f172a" />
        ) : (
          <Shield size={18} color="#991b1b" />
        )}
        <Text style={[styles.secondaryActionText, isBlockedByMe && styles.unblockText]}>
          {isBlockedByMe ? "Bỏ chặn" : "Chặn"}
        </Text>
      </TouchableOpacity>
    );
  };

  if (isLoadingUser || isFetchingUser) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      </SafeAreaView>
    );
  }

  if (isBlockedByOther) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
            <ArrowLeft size={23} color="#0f172a" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Trang cá nhân</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.center}>
          <View style={styles.emptyIcon}>
            <Ban size={30} color="#64748b" />
          </View>
          <Text style={styles.emptyTitle}>Không thể xem trang cá nhân</Text>
          <Text style={styles.emptyText}>Bạn không có quyền truy cập thông tin của người dùng này.</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (isError || !profile) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
            <ArrowLeft size={23} color="#0f172a" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Trang cá nhân</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.center}>
          <Text style={styles.emptyTitle}>Không tìm thấy người dùng</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
          <ArrowLeft size={23} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Trang cá nhân</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <View style={styles.cover} />
          <View style={styles.profileTop}>
            {profile.avatar ? (
              <Image source={{ uri: profile.avatar }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarFallbackText}>{getInitial(displayName)}</Text>
              </View>
            )}
            <View style={styles.identity}>
              <Text style={styles.nameText} numberOfLines={2}>
                {displayName}
              </Text>
              <Text style={styles.usernameText}>@{getText(profile.username, "unknown")}</Text>
            </View>
          </View>

          {isBlockedByMe && (
            <View style={styles.blockedNotice}>
              <ShieldOff size={16} color="#991b1b" />
              <Text style={styles.blockedNoticeText}>Bạn đã chặn người này</Text>
            </View>
          )}

          {!isSelf && (
            <View style={styles.actionsRow}>
              {renderFriendAction()}
              {renderBlockAction()}
            </View>
          )}
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryLine}>
            <Text style={styles.summaryLabel}>Mô tả: </Text>
            {description}
          </Text>
          <Text style={styles.summaryLine}>
            <Text style={styles.summaryLabel}>Tiểu sử: </Text>
            {bio}
          </Text>
        </View>

        <InfoSection title="Thông tin ứng viên cơ bản" items={basicItems} />
        {isApplicant && <InfoSection title="Hồ sơ ứng viên" items={applicantItems} />}
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
    height: 58,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#0f172a",
  },
  headerSpacer: {
    width: 40,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  hero: {
    backgroundColor: "#fff",
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  cover: {
    height: 92,
    backgroundColor: "#dbeafe",
    borderBottomWidth: 1,
    borderBottomColor: "#bfdbfe",
  },
  profileTop: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 16,
    paddingBottom: 14,
    marginTop: -38,
  },
  avatar: {
    width: 92,
    height: 92,
    borderRadius: 46,
    borderWidth: 4,
    borderColor: "#fff",
    backgroundColor: "#e2e8f0",
  },
  avatarFallback: {
    width: 92,
    height: 92,
    borderRadius: 46,
    borderWidth: 4,
    borderColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2563eb",
  },
  avatarFallbackText: {
    color: "#fff",
    fontSize: 34,
    fontWeight: "800",
  },
  identity: {
    flex: 1,
    marginLeft: 14,
    paddingBottom: 8,
  },
  nameText: {
    fontSize: 23,
    lineHeight: 29,
    fontWeight: "900",
    color: "#0f172a",
  },
  usernameText: {
    marginTop: 3,
    fontSize: 14,
    color: "#64748b",
    fontWeight: "600",
  },
  actionsRow: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  primaryAction: {
    flex: 1,
    minHeight: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    paddingHorizontal: 12,
    gap: 8,
  },
  secondaryAction: {
    minWidth: 104,
    minHeight: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    paddingHorizontal: 12,
    gap: 8,
    borderWidth: 1,
  },
  addButton: {
    backgroundColor: "#2563eb",
  },
  acceptButton: {
    backgroundColor: "#16a34a",
  },
  friendStatus: {
    backgroundColor: "#ccfbf1",
    borderWidth: 1,
    borderColor: "#99f6e4",
  },
  sentStatus: {
    backgroundColor: "#fef3c7",
    borderWidth: 1,
    borderColor: "#fde68a",
  },
  blockButton: {
    backgroundColor: "#fff1f2",
    borderColor: "#fecdd3",
  },
  unblockButton: {
    backgroundColor: "#f8fafc",
    borderColor: "#cbd5e1",
  },
  disabledAction: {
    opacity: 0.65,
  },
  primaryActionText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "800",
  },
  friendStatusText: {
    color: "#0f766e",
  },
  sentStatusText: {
    color: "#92400e",
  },
  secondaryActionText: {
    color: "#991b1b",
    fontSize: 14,
    fontWeight: "800",
  },
  unblockText: {
    color: "#0f172a",
  },
  blockedNotice: {
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 10,
    borderRadius: 12,
    backgroundColor: "#fef2f2",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  blockedNoticeText: {
    color: "#991b1b",
    fontWeight: "800",
  },
  summaryCard: {
    marginTop: 14,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    gap: 10,
  },
  summaryLine: {
    color: "#334155",
    fontSize: 14,
    lineHeight: 21,
  },
  summaryLabel: {
    color: "#0f172a",
    fontWeight: "800",
  },
  section: {
    marginTop: 14,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: "#0f172a",
    marginBottom: 8,
  },
  infoRow: {
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },
  infoLabel: {
    color: "#64748b",
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 3,
  },
  infoValue: {
    color: "#111827",
    fontSize: 15,
    lineHeight: 21,
    fontWeight: "600",
  },
  emptyIcon: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: "#e2e8f0",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#0f172a",
    textAlign: "center",
  },
  emptyText: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
    color: "#64748b",
    textAlign: "center",
  },
});
