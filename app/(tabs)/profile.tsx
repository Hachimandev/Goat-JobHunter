import { useRouter } from "expo-router";
import {
  Bell,
  Bookmark,
  Building,
  Clipboard,
  FileText,
  HardDrive,
  Settings,
  User,
} from "lucide-react-native";
import React from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { clearUser } from "../../lib/authSlice";
import { useAppDispatch, useAppSelector } from "../../lib/hooks";
import { useLogoutMutation } from "../../services/auth/authApi";
import { tokenManager } from "../../lib/tokenManager";

export default function ProfileScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const [logout] = useLogoutMutation();

  const handleLogin = () => {
    router.push("/(auth)/signin");
  };

  const handleGoToInfo = () => {
    router.push("/profile/info");
  };

  const handleLogout = async () => {
    try {
      await tokenManager.clearTokens();

      dispatch(clearUser());

      try {
        await logout().unwrap();
      } catch (apiError) {
        console.log("Logout API failed (ignored):", apiError);
      }

      router.replace("/");
    } catch (error) {
      console.error("Logout error:", error);

      await tokenManager.clearTokens();
      dispatch(clearUser());
      router.replace("/");
    }
  };

  if (!user || !isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Cá nhân</Text>
          </View>

          {/* Not logged in state */}
          <View style={styles.notLoggedInContainer}>
            <User size={80} color="#1976d2" />
            <Text style={styles.title}>Chưa đăng nhập</Text>
            <Text style={styles.subtitle}>
              Đăng nhập để truy cập đầy đủ tính năng
            </Text>

            <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
              <Text style={styles.loginButtonText}>Đăng nhập</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.signupButton}
              onPress={() => router.push("/(auth)/signup")}
            >
              <Text style={styles.signupButtonText}>Tạo tài khoản mới</Text>
            </TouchableOpacity>
          </View>

          {/* Guest features */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Dành cho khách</Text>

            <TouchableOpacity style={styles.menuItem}>
              <Clipboard size={20} color="#6b7280" style={styles.menuIcon} />
              <Text style={styles.menuText}>Xem việc làm</Text>
              <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem}>
              <Building size={20} color="#6b7280" style={styles.menuIcon} />
              <Text style={styles.menuText}>Xem công ty</Text>
              <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem}>
              <Settings size={20} color="#6b7280" style={styles.menuIcon} />
              <Text style={styles.menuText}>Cài đặt</Text>
              <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* User info */}
        <TouchableOpacity
          style={styles.userInfoContainer}
          onPress={handleGoToInfo}
        >
          <View style={styles.avatar}>
            {user.avatar ? (
              <Image source={{ uri: user.avatar }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarText}>
                {user.fullName?.charAt(0) || "U"}
              </Text>
            )}
          </View>
          <Text style={styles.userName}>{user.fullName || "User"}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
        </TouchableOpacity>

        {/* Menu items */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push("/profile/saved-blogs")}
          >
            <Bookmark size={20} color="#6b7280" style={styles.menuIcon} />
            <Text style={styles.menuText}>Bài viết đã lưu</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <FileText size={20} color="#6b7280" style={styles.menuIcon} />
            <Text style={styles.menuText}>Đơn ứng tuyển</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push("/jobs/saved")}
          >
            <HardDrive size={20} color="#6b7280" style={styles.menuIcon} />
            <Text style={styles.menuText}>Việc đã lưu</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <FileText size={20} color="#6b7280" style={styles.menuIcon} />
            <Text style={styles.menuText}>Quản lý CV</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Bell size={20} color="#6b7280" style={styles.menuIcon} />
            <Text style={styles.menuText}>Thông báo</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Settings size={20} color="#6b7280" style={styles.menuIcon} />
            <Text style={styles.menuText}>Cài đặt</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Logout button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Đăng xuất</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    backgroundColor: "#fff",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
  },
  notLoggedInContainer: {
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  icon: {
    fontSize: 80,
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 32,
  },
  loginButton: {
    backgroundColor: "#1976d2",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: "100%",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  signupButton: {
    backgroundColor: "#fff",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: "100%",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  signupButtonText: {
    color: "#374151",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  section: {
    backgroundColor: "#fff",
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6b7280",
    paddingHorizontal: 12,
    paddingVertical: 8,
    textTransform: "uppercase",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  menuIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: "#111827",
  },
  menuArrow: {
    fontSize: 24,
    color: "#9ca3af",
  },
  userInfoContainer: {
    alignItems: "center",
    paddingVertical: 32,
    paddingHorizontal: 24,
    backgroundColor: "#fff",
  },
  avatarText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
  },
  userName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: "#6b7280",
  },
  logoutButton: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 24,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ef4444",
  },
  logoutButtonText: {
    color: "#ef4444",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#1976d2",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    overflow: "hidden", // Quan trọng: để ảnh không tràn ra ngoài border radius
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
});
