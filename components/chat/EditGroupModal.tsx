import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  ScrollView,
  Modal,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useEditGroup } from "@/hooks/useEditGroup";

interface EditGroupModalProps {
  visible: boolean;
  groupId: number;
  groupName: string;
  groupAvatar: string;
  onClose: () => void;
  onSuccess?: () => void;
  onRefetch?: () => void;
}

export const EditGroupModal = ({
  visible,
  groupId,
  groupName,
  groupAvatar,
  onClose,
  onSuccess,
  onRefetch,
}: EditGroupModalProps) => {
  const [newGroupName, setNewGroupName] = useState(groupName);
  const [selectedImage, setSelectedImage] = useState<any>(null);
  const [imagePreview, setImagePreview] = useState(groupAvatar);
  const { isLoading, handleEditGroup } = useEditGroup();

  useEffect(() => {
    if (!visible) {
      setNewGroupName(groupName);
      setSelectedImage(null);
      setImagePreview(groupAvatar);
    }
  }, [visible, groupName, groupAvatar]);

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];

        // Validate image type
        if (asset.type !== "image") {
          alert("Chỉ chấp nhận file ảnh");
          return;
        }

        // Check file size (2MB = 2 * 1024 * 1024 bytes)
        const fileSizeInMB = asset.fileSize ? asset.fileSize / (1024 * 1024) : 0;
        if (fileSizeInMB > 2) {
          alert("Kích thước ảnh tối đa 2MB");
          return;
        }

        setSelectedImage(asset);
        setImagePreview(asset.uri);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      alert("Lỗi khi chọn ảnh");
    }
  };

  const handleSubmit = async () => {
    const success = await handleEditGroup(
      groupId,
      groupName,
      newGroupName,
      selectedImage
    );

    if (success) {
      if (onRefetch) {
        onRefetch();
      }
      if (onSuccess) {
        onSuccess();
      }
      onClose();
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.container}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} disabled={isLoading}>
              <Text style={styles.cancelBtn}>Hủy</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Chỉnh sửa nhóm</Text>
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={isLoading}
              style={styles.saveBtn}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#007AFF" />
              ) : (
                <Text style={styles.saveBtnText}>Lưu</Text>
              )}
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Avatar Section */}
            <View style={styles.avatarSection}>
              <View style={styles.avatarContainer}>
                {imagePreview ? (
                  <Image
                    source={{ uri: imagePreview }}
                    style={styles.avatarImage}
                  />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Ionicons name="image-outline" size={40} color="#ccc" />
                  </View>
                )}
                <TouchableOpacity
                  style={styles.cameraButton}
                  onPress={pickImage}
                  disabled={isLoading}
                >
                  <Ionicons name="camera" size={16} color="#fff" />
                </TouchableOpacity>
              </View>
              <Text style={styles.avatarHint}>Chỉ chấp nhận ảnh, tối đa 2MB</Text>
            </View>

            {/* Group Name Section */}
            <View style={styles.section}>
              <Text style={styles.label}>Tên nhóm</Text>
              <TextInput
                style={styles.input}
                placeholder="Nhập tên nhóm"
                value={newGroupName}
                onChangeText={setNewGroupName}
                maxLength={100}
                editable={!isLoading}
                placeholderTextColor="#999"
              />
              <Text style={styles.charCount}>
                {newGroupName.length}/100
              </Text>
            </View>

            {/* Info */}
            <View style={styles.infoSection}>
              <Ionicons name="information-circle" size={18} color="#007AFF" />
              <Text style={styles.infoText}>
                Những thay đổi sẽ được cập nhật cho tất cả thành viên nhóm
              </Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  content: {
    flex: 1,
    backgroundColor: "#fff",
    marginTop: 50,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  cancelBtn: {
    fontSize: 14,
    color: "#999",
  },
  saveBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  saveBtnText: {
    fontSize: 14,
    color: "#007AFF",
    fontWeight: "600",
  },
  scrollContent: {
    flex: 1,
    paddingHorizontal: 16,
  },
  avatarSection: {
    alignItems: "center",
    paddingVertical: 24,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 12,
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
  },
  cameraButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  avatarHint: {
    fontSize: 12,
    color: "#999",
    textAlign: "center",
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#000",
  },
  charCount: {
    fontSize: 12,
    color: "#999",
    marginTop: 6,
    textAlign: "right",
  },
  infoSection: {
    flexDirection: "row",
    backgroundColor: "#E5F3FF",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 20,
    marginBottom: 40,
    gap: 10,
  },
  infoText: {
    fontSize: 12,
    color: "#007AFF",
    flex: 1,
  },
});
