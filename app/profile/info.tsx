import { useRouter } from "expo-router";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppSelector } from "../../lib/hooks";
import { formatDate } from "../../utils/formatDate";

const formatLabel = (str?: string) => {
  if (!str) return "Chưa cập nhật";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export default function ProfileInfoScreen() {
  const router = useRouter();
  const { user } = useAppSelector((state) => state.auth);
  const userData = user as any;

  // Hàm xử lý quay lại an toàn
  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(tabs)/profile");
    }
  };

  const InfoRow = ({
    label,
    value,
    icon,
  }: {
    label: string;
    value?: string;
    icon: string;
  }) => (
    <View style={styles.infoRow}>
      <View style={styles.labelContainer}>
        <Text style={styles.infoIcon}>{icon}</Text>
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
          <Text style={styles.backIcon}>←</Text>
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
          <View style={styles.avatarLarge}>
            <Text style={styles.avatarLargeText}>
              {userData?.fullName?.charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text style={styles.mainName}>
            {userData?.fullName || "Người dùng"}
          </Text>
          <Text style={styles.mainSub}>{userData?.email}</Text>
        </View>

        {/* Thông tin cơ bản */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Thông tin cơ bản</Text>
          <InfoRow icon="👤" label="Tên hiển thị" value={userData?.username} />
          <InfoRow
            icon="👫"
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
            icon="🎂"
            label="Ngày sinh"
            value={userData?.dob ? formatDate(userData.dob) : "Chưa cập nhật"}
          />
          <InfoRow icon="📞" label="Số điện thoại" value={userData?.phone} />
          <InfoRow
            icon="📢"
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
                icon="🎓"
                label="Trình độ"
                value={formatLabel(userData?.level)}
              />
              <InfoRow
                icon="🏫"
                label="Học vấn"
                value={formatLabel(userData?.education)}
              />
            </>
          ) : (
            <InfoRow icon="💼" label="Vị trí" value={userData?.position} />
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
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
});
