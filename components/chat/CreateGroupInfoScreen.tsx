import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Image,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { User } from "@/types/model";
import { useGroupCreation } from "@/hooks/useGroupCreation";

export const CreateGroupInfoScreen = () => {
  const { selectedUsers: selectedUsersParam } = useLocalSearchParams<{
    selectedUsers: string;
  }>();

  const selectedUsers: User[] = selectedUsersParam
    ? JSON.parse(selectedUsersParam)
    : [];

  const [groupName, setGroupName] = useState("");
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState("");
  const { isLoading, createGroup } = useGroupCreation();

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      const asset = result.assets[0];

      // Validate file type - ImagePicker returns type as "image" or "video"
      if (asset.type !== "image") {
        setAvatarError("Chỉ chấp nhận file ảnh");
        return;
      }

      // Validate file size (2MB = 2 * 1024 * 1024 bytes)
      if (asset.fileSize && asset.fileSize > 2 * 1024 * 1024) {
        setAvatarError("Kích thước ảnh tối đa 2MB");
        return;
      }

      setAvatarError("");
      setAvatarUri(asset.uri);
    }
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập tên nhóm");
      return;
    }

    if (!avatarUri) {
      Alert.alert("Lỗi", "Vui lòng chọn ảnh đại diện cho nhóm");
      return;
    }

    const avatarFile = {
      uri: avatarUri,
      type: "image/jpeg",
      name: `group-${Date.now()}.jpg`,
    };

    const success = await createGroup({
      name: groupName,
      avatar: avatarFile,
      selectedUsers,
    });

    if (success) {
      // Reset and go back
      setGroupName("");
      setAvatarUri(null);
    }
  };

  const getAvatarPlaceholder = () => {
    return groupName.charAt(0).toUpperCase() || "G";
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          disabled={isLoading}
        >
          <Ionicons name="chevron-back" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tạo nhóm</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarContainer}>
            {avatarUri ? (
              <Image
                source={{ uri: avatarUri }}
                style={styles.avatarImage}
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarPlaceholderText}>
                  {getAvatarPlaceholder()}
                </Text>
              </View>
            )}

            <TouchableOpacity
              style={styles.uploadButton}
              onPress={handlePickImage}
              disabled={isLoading}
            >
              <Feather name="camera" size={16} color="#fff" />
            </TouchableOpacity>
          </View>

          <Text style={styles.avatarHint}>Chỉ chấp nhận file ảnh, tối đa 2MB</Text>
          {avatarError && (
            <Text style={styles.errorText}>{avatarError}</Text>
          )}
        </View>

        {/* Group Name Section */}
        <View style={styles.section}>
          <Text style={styles.label}>Tên nhóm *</Text>
          <TextInput
            style={styles.input}
            placeholder="Nhập tên nhóm..."
            placeholderTextColor="#999"
            value={groupName}
            onChangeText={setGroupName}
            maxLength={100}
            editable={!isLoading}
          />
          <Text style={styles.charCount}>
            {groupName.length}/100 ký tự
          </Text>
        </View>

        {/* Members Section */}
        <View style={styles.section}>
          <Text style={styles.label}>Thành viên ({selectedUsers.length})</Text>
          <View style={styles.membersList}>
            {selectedUsers.map((user) => (
              <View key={user.accountId} style={styles.memberItem}>
                <Image
                  source={{
                    uri: user.avatar || "https://i.pravatar.cc/150?img=1",
                  }}
                  style={styles.memberAvatar}
                />
                <View style={styles.memberInfo}>
                  <Text style={styles.memberName}>{user.fullName}</Text>
                  <Text style={styles.memberEmail} numberOfLines={1}>
                    {user.email}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Footer with Create Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => router.back()}
          disabled={isLoading}
        >
          <Text style={styles.cancelButtonText}>Hủy</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.createButton,
            (isLoading || !groupName.trim() || !avatarUri) &&
              styles.createButtonDisabled,
          ]}
          onPress={handleCreateGroup}
          disabled={isLoading || !groupName.trim() || !avatarUri}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.createButtonText}>Tạo nhóm</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  avatarSection: {
    alignItems: "center",
    marginVertical: 24,
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
    backgroundColor: "#007AFF",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarPlaceholderText: {
    fontSize: 40,
    fontWeight: "600",
    color: "#fff",
  },
  uploadButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#007AFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#fff",
  },
  avatarHint: {
    fontSize: 12,
    color: "#999",
    textAlign: "center",
  },
  errorText: {
    fontSize: 12,
    color: "#FF3B30",
    marginTop: 4,
  },
  section: {
    marginVertical: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#000",
  },
  charCount: {
    fontSize: 12,
    color: "#999",
    textAlign: "right",
    marginTop: 4,
  },
  membersList: {
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 12,
  },
  memberItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  memberAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 13,
    fontWeight: "500",
    color: "#000",
  },
  memberEmail: {
    fontSize: 11,
    color: "#999",
    marginTop: 2,
  },
  footer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "600",
  },
  createButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#007AFF",
    alignItems: "center",
    justifyContent: "center",
  },
  createButtonDisabled: {
    backgroundColor: "#ddd",
  },
  createButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
