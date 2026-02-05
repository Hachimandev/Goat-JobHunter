import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ChatDetail() {
  const { name } = useLocalSearchParams<{ name: string }>();

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tùy chọn</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* CONTENT */}
      <ScrollView>
        {/* PROFILE */}
        <View style={styles.profile}>
          <Image
            source={{ uri: "https://i.pravatar.cc/300" }}
            style={styles.avatar}
          />
          <Text style={styles.name}>{name}</Text>
        </View>

        {/* QUICK ACTIONS */}
        <View style={styles.quickActions}>
          {[
            { icon: "search", label: "Tìm tin nhắn" },
            { icon: "person", label: "Trang cá nhân" },
            { icon: "color-palette", label: "Đổi hình nền" },
            { icon: "notifications-off", label: "Tắt thông báo" },
          ].map((item) => (
            <View key={item.label} style={styles.quickItem}>
              <Ionicons name={item.icon as any} size={22} />
              <Text style={styles.quickText}>{item.label}</Text>
            </View>
          ))}
        </View>

        {/* OPTIONS */}
        <Option title="Đổi tên gợi nhớ" />
        <Option title="Đánh dấu bạn thân" right />
        <Option title="Nhật ký chung" />
        <Option title="Ảnh, file, link" />

        <Divider />

        <Option title={`Xem nhóm chung (25)`} />
        <Option title="Ghim trò chuyện" right />
        <Option title="Ẩn trò chuyện" right />
        <Option title="Báo cuộc gọi đến" right active />
        <Option title="Tin nhắn tự xóa" desc="Không tự xóa" />
        <Option title="Cài đặt cá nhân" />

        <Divider />

        <Option title="Báo xấu" danger />
        <Option title="Quản lý chặn" arrow />
        <Option title="Dung lượng trò chuyện" />

        <Divider />

        <TouchableOpacity style={styles.delete}>
          <Text style={styles.deleteText}>Xóa lịch sử trò chuyện</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

/* OPTION COMPONENT */
function Option({ title, desc, right, arrow, danger, active }: any) {
  return (
    <TouchableOpacity style={styles.option}>
      <Text style={[styles.optionText, danger && { color: "red" }]}>
        {title}
      </Text>

      {desc && <Text style={styles.desc}>{desc}</Text>}

      {right && (
        <View
          style={[styles.toggle, active && { backgroundColor: "#0084FF" }]}
        />
      )}

      {arrow && <Ionicons name="chevron-forward" size={18} />}
    </TouchableOpacity>
  );
}

const Divider = () => <View style={styles.divider} />;

/* STYLES */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F2F2F7" },

  header: {
    height: 56,
    backgroundColor: "#0084FF",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    justifyContent: "space-between",
  },
  headerTitle: { color: "#fff", fontSize: 16, fontWeight: "600" },

  profile: {
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  avatar: { width: 90, height: 90, borderRadius: 45 },
  name: { marginTop: 10, fontSize: 18, fontWeight: "600" },

  quickActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#fff",
    paddingVertical: 16,
  },
  quickItem: { alignItems: "center" },
  quickText: { marginTop: 6, fontSize: 12 },

  option: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  optionText: { fontSize: 15 },
  desc: { color: "#999", fontSize: 13 },

  divider: { height: 10 },

  toggle: {
    width: 40,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#ccc",
  },

  delete: {
    backgroundColor: "#fff",
    paddingVertical: 16,
    alignItems: "center",
  },
  deleteText: { color: "red", fontSize: 15 },
});
