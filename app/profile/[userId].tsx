import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ArrowLeft,
  UserPlus,
  UserMinus,
  Shield,
  ShieldOff,
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
import { formatDate } from "../../utils/formatDate";
import { useGetUserByIdQuery } from "@/services/user/userApi";
import {
  useCreateFriendRequestMutation,
  useBlockUserMutation,
  useUnblockUserMutation,
} from "@/services/friendship/friendshipApi";
import { useFriendshipStatus } from "@/hooks/useFriendshipStatus";
import { RelationshipState } from "@/services/friendship/friendshipType";

const formatLabel = (str?: string) => {
  if (!str) return "Chưa cập nhật";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export default function UserProfileScreen() {
  const { userId } = useLocalSearchParams();
  const router = useRouter();
  const userIdNum = parseInt(userId as string);

  const { data: userData, isLoading: isLoadingUser } = useGetUserByIdQuery(
    userIdNum,
    {
      skip: Number.isNaN(userIdNum),
    },
  );

  const {
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

  const user = userData?.data;

  // Nếu người đó chặn mình, không cho xem profile
  if (isBlockedByOther) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <ArrowLeft size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Thông tin cá nhân</Text>
        </View>
        <View style={styles.center}>
          <Text style={styles.blockedMessage}>
            Bạn không thể xem thông tin của người dùng này
          </Text>
        </View>
      </SafeAreaView>
    );
  }

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

    if (isFriend) {
      return "Bạn bè";
    } else if (hasSentRequest) {
      return "Đã gửi yêu cầu";
    } else if (hasReceivedRequest) {
      return "Chờ xác nhận";
    } else {
      return "Kết bạn";
    }
  };

  const getFriendButtonIcon = () => {
    if (isFriend) {
      return <UserMinus size={20} color="#fff" />;
    } else {
      return <UserPlus size={20} color="#fff" />;
    }
  };

  const getBlockButtonText = () => {
    if (isBlocking || isUnblocking) return "Đang xử lý...";
    return isBlockedByMe ? "Bỏ chặn" : "Chặn";
  };

  const getBlockButtonIcon = () => {
    return isBlockedByMe ? (
      <ShieldOff size={20} color="#fff" />
    ) : (
      <Shield size={20} color="#fff" />
    );
  };

  if (isLoadingUser) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator size="large" />
        </View>
      </SafeAreaView>
    );
  }

  if (!user) {
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
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ArrowLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thông tin cá nhân</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Avatar */}
        <View style={styles.avatarContainer}>
          {user.avatar ? (
            <Image source={{ uri: user.avatar }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarFallback}>
              <Text style={styles.avatarFallbackText}>
                {user.fullName?.charAt(0) || "U"}
              </Text>
            </View>
          )}
          <Text style={styles.nameText}>{user.fullName || "Người dùng"}</Text>
          <Text style={styles.usernameText}>@{user.username || "unknown"}</Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              styles.friendButton,
              isFriend && styles.friendButtonActive,
            ]}
            onPress={handleFriendAction}
            disabled={
              isLoadingPair ||
              isCreatingRequest ||
              isFriend ||
              isBlockedAnyDirection
            }
          >
            {getFriendButtonIcon()}
            <Text style={styles.actionButtonText}>{getFriendButtonText()}</Text>
          </TouchableOpacity>
          y
          <TouchableOpacity
            style={[
              styles.actionButton,
              isBlockedByMe ? styles.unblockButton : styles.blockButton,
            ]}
            onPress={handleBlockAction}
            disabled={isBlocking || isUnblocking || isLoadingPair}
          >
            {getBlockButtonIcon()}
            <Text style={styles.actionButtonText}>{getBlockButtonText()}</Text>
          </TouchableOpacity>
        </View>

        {/* User Info */}
        <View style={styles.infoContainer}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email:</Text>
            <Text style={styles.infoValue}>
              {user.email || "Chưa cập nhật"}
            </Text>
          </View>

          {user.dateOfBirth && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Ngày sinh:</Text>
              <Text style={styles.infoValue}>
                {formatDate(user.dateOfBirth)}
              </Text>
            </View>
          )}

          {user.phone && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Số điện thoại:</Text>
              <Text style={styles.infoValue}>{user.phone}</Text>
            </View>
          )}

          {user.role && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Vai trò:</Text>
              <Text style={styles.infoValue}>
                {formatLabel(user.role.name)}
              </Text>
            </View>
          )}

          {/* Applicant specific info */}
          {user.applicant && (
            <>
              {user.applicant.skills && user.applicant.skills.length > 0 && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Kỹ năng:</Text>
                  <Text style={styles.infoValue}>
                    {user.applicant.skills.map((s: any) => s.name).join(", ")}
                  </Text>
                </View>
              )}

              {user.applicant.experience && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Kinh nghiệm:</Text>
                  <Text style={styles.infoValue}>
                    {user.applicant.experience} năm
                  </Text>
                </View>
              )}
            </>
          )}

          {/* Recruiter specific info */}
          {user.recruiter && (
            <>
              {user.recruiter.company && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Công ty:</Text>
                  <Text style={styles.infoValue}>
                    {user.recruiter.company.name}
                  </Text>
                </View>
              )}

              {user.recruiter.position && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Chức vụ:</Text>
                  <Text style={styles.infoValue}>
                    {user.recruiter.position}
                  </Text>
                </View>
              )}
            </>
          )}
        </View>
      </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  avatarContainer: {
    alignItems: "center",
    padding: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  avatarFallback: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#e0e0e0",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  avatarFallbackText: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#666",
  },
  nameText: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  usernameText: {
    fontSize: 16,
    color: "#666",
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 120,
    justifyContent: "center",
  },
  friendButton: {
    backgroundColor: "#007AFF",
  },
  friendButtonActive: {
    backgroundColor: "#28a745",
  },
  blockButton: {
    backgroundColor: "#dc3545",
  },
  unblockButton: {
    backgroundColor: "#6c757d",
  },
  actionButtonText: {
    color: "#fff",
    fontWeight: "bold",
    marginLeft: 8,
  },
  infoContainer: {
    padding: 16,
  },
  infoRow: {
    flexDirection: "row",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  infoLabel: {
    fontWeight: "bold",
    width: 120,
  },
  infoValue: {
    flex: 1,
  },
  blockedMessage: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
});
