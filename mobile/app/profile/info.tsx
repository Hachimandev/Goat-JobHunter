import { useUser } from "@/hooks/useUser";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  Bell,
  Briefcase,
  Building,
  Cake,
  Camera,
  GraduationCap,
  Phone,
  User,
  Users,
} from "lucide-react-native";
import React, { useState } from "react";
import {
  Alert,
  Modal,
  Platform,
  Image as RNImage,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { ActivityIndicator } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { formatDate } from "../../utils/formatDate";
import { useDeleteMyAccountMutation } from "@/services/auth/authApi";

const formatLabel = (str?: string) => {
  if (!str) return "Chưa cập nhật";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export default function ProfileInfoScreen() {
  const router = useRouter();

  const {
    user,
    handleUpdateApplicant,
    handleUpdateRecruiter,
    isUpdatingApplicant,
    isUpdatingRecruiter,
    signOut,
  } = useUser();
  const [deleteAccountMutation, { isLoading: isDeletingAccount }] =
    useDeleteMyAccountMutation();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const userData = user as any;
  const isUpdating = isUpdatingApplicant || isUpdatingRecruiter;

  const handleAvatarPress = () => {
    if (Platform.OS === "web") {
      onPickImage(false);
    } else {
      Alert.alert(
        "Cập nhật ảnh đại diện",
        "Bạn muốn chụp ảnh mới hay chọn từ thư viện?",
        [
          { text: "Máy ảnh", onPress: () => onPickImage(true) },
          { text: "Thư viện ảnh", onPress: () => onPickImage(false) },
          { text: "Hủy", style: "cancel" },
        ],
      );
    }
  };

  const onPickImage = async (useCamera: boolean) => {
    if (Platform.OS !== "web") {
      const permission = useCamera
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        return Alert.alert("Lỗi", "Ứng dụng cần quyền truy cập để thực hiện");
      }
    }

    let result;

    if (useCamera && Platform.OS !== "web") {
      result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.6,
      });
    } else {
      result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.6,
      });
    }

    if (!result.canceled) {
      uploadAvatar(result.assets[0]);
    }
  };

  const uploadAvatar = async (asset: ImagePicker.ImagePickerAsset) => {
    try {
      const formData = new FormData();
      formData.append("accountId", String(userData.accountId));

      if (Platform.OS === "web") {
        const response = await fetch(asset.uri);
        const blob = await response.blob();

        const fieldName =
          userData?.role?.name === "COMPANY" ? "logo" : "avatar";
        formData.append(fieldName, blob, asset.fileName || "avatar.jpg");
      } else {
        const fileData = {
          uri:
            Platform.OS === "android"
              ? asset.uri
              : asset.uri.replace("file://", ""),
          name: asset.fileName || `avatar_${Date.now()}.jpg`,
          type: asset.mimeType || "image/jpeg",
        };
        const fieldName =
          userData?.role?.name === "COMPANY" ? "logo" : "avatar";
        formData.append(fieldName, fileData as any);
      }

      const res =
        userData?.role?.name === "APPLICANT"
          ? await handleUpdateApplicant(formData)
          : await handleUpdateRecruiter(formData);

      if (res?.success) Alert.alert("Thành công", "Đã cập nhật ảnh đại diện");
    } catch (e) {
      Alert.alert("Lỗi", "Cập nhật ảnh thất bại");
    }
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(tabs)/profile");
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập mật khẩu");
      return;
    }

    Alert.alert(
      "Xác nhận xóa tài khoản",
      "Hành động này không thể hoàn tác. Tất cả dữ liệu của bạn sẽ bị xóa.",
      [
        {
          text: "Hủy",
          style: "cancel",
        },
        {
          text: "Xóa",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteAccountMutation({
                password: deletePassword,
              }).unwrap();

              Alert.alert(
                "Thành công",
                "Tài khoản của bạn đã được xóa",
                [
                  {
                    text: "OK",
                    onPress: async () => {
                      setShowDeleteModal(false);
                      setDeletePassword("");
                      await signOut();
                      router.replace("/(auth)/signin");
                    },
                  },
                ]
              );
            } catch (error: any) {
              Alert.alert(
                "Lỗi",
                error?.data?.message || "Không thể xóa tài khoản"
              );
              setDeletePassword("");
            }
          },
        },
      ]
    );
  };

  const InfoRow = ({
    label,
    value,
    icon: IconComponent,
  }: {
    label: string;
    value?: string;
    icon: React.ReactNode;
  }) => (
    <View style={styles.infoRow}>
      <View style={styles.labelContainer}>
        {IconComponent}
        <Text style={styles.infoLabel}>{label}</Text>
      </View>
      <Text style={styles.infoValue} numberOfLines={1}>
        {value || "Chưa cập nhật"}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header đồng bộ với trang Edit */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Hồ sơ cá nhân</Text>
        <TouchableOpacity
          onPress={() => router.push("/profile/edit")}
          style={styles.editBtn}
        >
          <Text style={styles.editHeaderText}>Sửa</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Top Profile Card */}
        <View style={styles.topSection}>
          <TouchableOpacity onPress={handleAvatarPress} disabled={isUpdating}>
            <View style={styles.avatarLarge}>
              {isUpdating ? (
                <ActivityIndicator color="#fff" />
              ) : userData?.avatar ? (
                <RNImage
                  source={{ uri: userData.avatar }}
                  style={styles.fullAvatar}
                />
              ) : (
                <Text style={styles.avatarLargeText}>
                  {userData?.fullName?.charAt(0).toUpperCase()}
                </Text>
              )}
              {/* Badge Icon máy ảnh */}
              <View style={styles.cameraBadge}>
                <Camera size={14} color="#fff" />
              </View>
            </View>
          </TouchableOpacity>
          <Text style={styles.mainName}>{userData?.fullName}</Text>
          <Text style={styles.mainSub}>{userData?.email}</Text>
        </View>

        {/* Thông tin cơ bản */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Thông tin cơ bản</Text>
          <InfoRow
            icon={<User size={18} color="#6b7280" />}
            label="Tên hiển thị"
            value={userData?.username}
          />
          <InfoRow
            icon={<Users size={18} color="#6b7280" />}
            label="Giới tính"
            value={
              userData?.gender === "MALE"
                ? "Nam"
                : userData?.gender === "FEMALE"
                  ? "Nữ"
                  : "Khác"
            }
          />
          <InfoRow
            icon={<Cake size={18} color="#6b7280" />}
            label="Ngày sinh"
            value={userData?.dob ? formatDate(userData.dob) : "Chưa cập nhật"}
          />
          <InfoRow
            icon={<Phone size={18} color="#6b7280" />}
            label="Số điện thoại"
            value={userData?.phone}
          />
          <InfoRow
            icon={<Bell size={18} color="#6b7280" />}
            label="Trạng thái"
            value={
              userData?.availableStatus ? "Hồ sơ công khai" : "Hồ sơ đang ẩn"
            }
          />
        </View>

        {/* Giới thiệu */}
        {(userData?.headline || userData?.bio) && (
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Giới thiệu</Text>
            {userData?.headline && (
              <>
                <Text style={styles.subLabel}>Headline</Text>
                <Text style={styles.textAreaValue}>{userData.headline}</Text>
                <View style={styles.divider} />
              </>
            )}
            {userData?.bio && (
              <>
                <Text style={styles.subLabel}>Bio</Text>
                <Text style={styles.textAreaValue}>{userData.bio}</Text>
              </>
            )}
          </View>
        )}

        {/* Địa chỉ */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Địa chỉ</Text>
          {userData?.addresses && userData.addresses.length > 0 ? (
            userData.addresses.map((addr: any, idx: number) => (
              <View key={idx} style={styles.addressBox}>
                <Text style={styles.addressProvince}>{addr.province}</Text>
                <Text style={styles.addressDetail}>{addr.fullAddress}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>Chưa cập nhật địa chỉ</Text>
          )}
        </View>

        {/* Phân quyền đặc thù */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Công việc & Học vấn</Text>
          {userData?.role?.name === "APPLICANT" ? (
            <>
              <InfoRow
                icon={<GraduationCap size={18} color="#6b7280" />}
                label="Trình độ"
                value={formatLabel(userData?.level)}
              />
              <InfoRow
                icon={<Building size={18} color="#6b7280" />}
                label="Học vấn"
                value={formatLabel(userData?.education)}
              />
            </>
          ) : (
            <InfoRow
              icon={<Briefcase size={18} color="#6b7280" />}
              label="Vị trí"
              value={userData?.position}
            />
          )}
        </View>

        {/* Delete Account Section */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => setShowDeleteModal(true)}
            disabled={isDeletingAccount}
          >
            {isDeletingAccount ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.deleteButtonText}>Xóa tài khoản</Text>
            )}
          </TouchableOpacity>
          <Text style={styles.deleteWarningText}>
            Cảnh báo: Hành động này sẽ xóa vĩnh viễn tài khoản và tất cả dữ liệu của bạn.
          </Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Delete Account Modal */}
      <Modal
        visible={showDeleteModal}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setShowDeleteModal(false);
          setDeletePassword("");
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Xóa tài khoản</Text>
            <Text style={styles.modalDescription}>
              Vui lòng nhập mật khẩu của bạn để xác nhận xóa tài khoản. Hành động này không thể hoàn tác.
            </Text>

            <TextInput
              style={styles.passwordInput}
              placeholder="Nhập mật khẩu"
              secureTextEntry
              value={deletePassword}
              onChangeText={setDeletePassword}
              editable={!isDeletingAccount}
            />

            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowDeleteModal(false);
                  setDeletePassword("");
                }}
                disabled={isDeletingAccount}
              >
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleDeleteAccount}
                disabled={isDeletingAccount}
              >
                {isDeletingAccount ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.confirmButtonText}>Xóa tài khoản</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f4f7f6" },
  header: {
    height: 56,
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  backButton: { width: 40, height: 40, justifyContent: "center" },
  backIcon: { fontSize: 24, color: "#333" },
  headerTitle: { fontSize: 17, fontWeight: "bold", color: "#333" },
  editBtn: { minWidth: 40, alignItems: "flex-end" },
  editHeaderText: { color: "#00a651", fontWeight: "bold", fontSize: 15 },
  scrollContent: { paddingBottom: 20 },
  topSection: {
    backgroundColor: "#fff",
    alignItems: "center",
    paddingVertical: 25,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  avatarLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#1976d2",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  avatarLargeText: { color: "#fff", fontSize: 32, fontWeight: "bold" },
  mainName: { fontSize: 20, fontWeight: "bold", color: "#1c1e21" },
  mainSub: { fontSize: 13, color: "#65676b", marginTop: 4 },
  section: {
    backgroundColor: "#fff",
    marginHorizontal: 12,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  sectionHeader: {
    fontSize: 15,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#1976d2",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: "#f0f0f0",
  },
  labelContainer: { flexDirection: "row", alignItems: "center" },
  infoIcon: { marginRight: 10, fontSize: 14 },
  infoLabel: { fontSize: 14, color: "#666" },
  infoValue: {
    fontSize: 14,
    color: "#1c1e21",
    fontWeight: "500",
    maxWidth: "50%",
  },
  subLabel: { fontSize: 12, fontWeight: "600", color: "#888", marginBottom: 6 },
  textAreaValue: { fontSize: 14, color: "#333", lineHeight: 20 },
  divider: { height: 1, backgroundColor: "#f0f0f0", marginVertical: 12 },
  addressBox: {
    backgroundColor: "#f8fafc",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  addressProvince: { fontWeight: "bold", fontSize: 13, color: "#333" },
  addressDetail: { fontSize: 13, color: "#666", marginTop: 2 },
  emptyText: {
    color: "#999",
    fontStyle: "italic",
    textAlign: "center",
    marginTop: 10,
  },
  fullAvatar: { width: 80, height: 80, borderRadius: 40 },
  cameraBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#00a651",
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  deleteButton: {
    backgroundColor: "#dc2626",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  deleteButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  deleteWarningText: {
    fontSize: 12,
    color: "#dc2626",
    textAlign: "center",
    fontStyle: "italic",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    width: "100%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1c1e21",
    marginBottom: 12,
  },
  modalDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
    lineHeight: 20,
  },
  passwordInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    marginBottom: 16,
  },
  modalButtonContainer: {
    flexDirection: "row",
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: {
    backgroundColor: "#e5e7eb",
  },
  cancelButtonText: {
    color: "#1c1e21",
    fontSize: 14,
    fontWeight: "bold",
  },
  confirmButton: {
    backgroundColor: "#dc2626",
  },
  confirmButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
});

