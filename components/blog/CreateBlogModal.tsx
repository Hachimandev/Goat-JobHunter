import useBlogActionsMobile from "@/hooks/useBlogActions";
import { useUser } from "@/hooks/useUser";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  ToastAndroid,
  TouchableOpacity,
  View,
} from "react-native";

export default function CreateBlogModal({ visible, onClose, onSuccess }) {
  const [content, setContent] = useState("");
  const [images, setImages] = useState<any[]>([]);
  const { handleCreateBlog, isCreating } = useBlogActionsMobile();
  const { isSignedIn, user } = useUser();
  const isDisabled =
    !isSignedIn || isCreating || (!content.trim() && images.length === 0);
  const notify = (msg: string) => {
    if (Platform.OS === "android") {
      ToastAndroid.show(msg, ToastAndroid.SHORT);
    } else {
      Alert.alert(msg);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setImages(result.assets);
    }
  };

  const handleSubmit = async () => {
    if (!isSignedIn || !user) {
      notify("Bạn cần đăng nhập để đăng bài.");
      return;
    }

    if (isCreating) return;

    try {
      await handleCreateBlog({
        content,
        files: images,
      });

      setContent("");
      setImages([]);
      onSuccess?.();
      onClose();
    } catch (e) {
      console.error("Error creating blog:", e);
    }
  };

  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.container}>
        {/* ===== Header ===== */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.cancel}>Huỷ</Text>
          </TouchableOpacity>

          <Text style={styles.title}>Tạo bài viết</Text>

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={isDisabled}
            style={[
              styles.postBtn,
              isDisabled && { backgroundColor: "#d1d5db" },
            ]}
          >
            <Text style={styles.postText}>
              {isCreating ? "Đang đăng..." : "Đăng"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* ===== User Info ===== */}
        <View style={styles.userRow}>
          <Image
            source={{
              uri: user?.avatar || "https://i.pravatar.cc/150",
            }}
            style={styles.avatar}
          />
          <Text style={styles.username}>
            {user?.fullName || user?.username || "Người dùng"}
          </Text>
        </View>

        {/* ===== Content Input ===== */}
        <TextInput
          placeholder="Bạn đang nghĩ gì?"
          value={content}
          onChangeText={setContent}
          multiline
          style={styles.input}
          placeholderTextColor="#6b7280"
        />

        {/* ===== Images Grid ===== */}
        {images.length > 0 && (
          <FlatList
            data={images}
            keyExtractor={(item) => item.uri}
            numColumns={3}
            contentContainerStyle={styles.imageGrid}
            renderItem={({ item }) => (
              <Image source={{ uri: item.uri }} style={styles.image} />
            )}
          />
        )}

        {/* ===== Footer Actions ===== */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.addImageBtn} onPress={pickImage}>
            <Ionicons name="images" size={22} color="#22c55e" />
            <Text style={styles.addImageText}>Ảnh</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },

  /* ===== Header ===== */
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  cancel: {
    color: "#2563eb",
    fontSize: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
  },
  postBtn: {
    backgroundColor: "#2563eb",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 6,
  },
  postText: {
    color: "#ffffff",
    fontWeight: "600",
  },

  /* ===== User ===== */
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  username: {
    fontWeight: "600",
    fontSize: 15,
  },

  /* ===== Input ===== */
  input: {
    paddingHorizontal: 16,
    paddingTop: 12,
    fontSize: 16,
    minHeight: 120,
    textAlignVertical: "top",
    color: "#111827",
  },

  /* ===== Images ===== */
  imageGrid: {
    paddingHorizontal: 8,
    paddingTop: 8,
  },
  image: {
    width: "33%",
    aspectRatio: 1,
    margin: 4,
    borderRadius: 8,
  },

  /* ===== Footer ===== */
  footer: {
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    padding: 12,
  },
  addImageBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  addImageText: {
    fontSize: 14,
    fontWeight: "500",
  },
});
