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

export default function ProfileInfoScreen() {
  const router = useRouter();
  const { user } = useAppSelector((state) => state.auth);

  const InfoRow = ({ label, value, icon }) => (
    <View style={styles.infoRow}>
      <View style={styles.labelContainer}>
        <Text style={styles.infoIcon}>{icon}</Text>
        <Text style={styles.infoLabel}>{label}</Text>
      </View>
      <Text style={styles.infoValue}>{value || "Chưa cập nhật"}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thông tin cá nhân</Text>
        <TouchableOpacity
          onPress={() => router.push("/profile/edit")}
          activeOpacity={0.6}
        >
          <Text style={styles.editHeaderText}>Cập nhật</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.topSection}>
          <View style={styles.avatarLarge}>
            <Text style={styles.avatarLargeText}>
              {user?.fullName?.charAt(0)}
            </Text>
          </View>
          <Text style={styles.mainName}>{user?.fullName}</Text>
          <Text style={styles.mainSub}>{user?.email}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Thông tin cơ bản</Text>
          <InfoRow icon="👤" label="Tên hiển thị" value={user?.username} />
          <InfoRow icon="👫" label="Giới tính" value={user?.gender} />
          <InfoRow
            icon="🎂"
            label="Ngày sinh"
            value={user?.dob ? formatDate(user.dob) : ""}
          />
          <InfoRow icon="📞" label="Số điện thoại" value={user?.phone} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Địa chỉ</Text>
          {user?.addresses && user.addresses.length > 0 ? (
            user.addresses.map((addr, idx) => (
              <View key={idx} style={styles.addressBox}>
                <Text style={styles.addressProvince}>{addr.province}</Text>
                <Text style={styles.addressDetail}>{addr.fullAddress}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>Chưa cập nhật địa chỉ</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Công việc & Học vấn</Text>
          {user?.role?.name === "APPLICANT" ? (
            <>
              <InfoRow icon="🎓" label="Trình độ" value={user?.level} />
              <InfoRow icon="🏫" label="Học vấn" value={user?.education} />
            </>
          ) : (
            <InfoRow icon="💼" label="Vị trí" value={user?.position} />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f0f2f5" },
  header: {
    height: 56,
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: "#ccc",
  },
  backIcon: { fontSize: 24, color: "#000" },
  headerTitle: { fontSize: 18, fontWeight: "600" },
  editHeaderText: { color: "#1976d2", fontWeight: "500" },
  topSection: {
    backgroundColor: "#fff",
    alignItems: "center",
    paddingVertical: 30,
    marginBottom: 12,
  },
  avatarLarge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#1976d2",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  avatarLargeText: { color: "#fff", fontSize: 40, fontWeight: "bold" },
  mainName: { fontSize: 22, fontWeight: "bold", color: "#1c1e21" },
  mainSub: { fontSize: 14, color: "#65676b", marginTop: 4 },
  section: {
    backgroundColor: "#fff",
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#1c1e21",
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
  infoIcon: { marginRight: 10, fontSize: 16 },
  infoLabel: { fontSize: 15, color: "#65676b" },
  infoValue: {
    fontSize: 15,
    color: "#1c1e21",
    fontWeight: "500",
    maxWidth: "60%",
    textAlign: "right",
  },
  addressBox: {
    backgroundColor: "#f7f8fa",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  addressProvince: { fontWeight: "bold", fontSize: 14, color: "#1c1e21" },
  addressDetail: { fontSize: 13, color: "#65676b", marginTop: 2 },
  emptyText: { color: "#999", fontStyle: "italic" },
});
