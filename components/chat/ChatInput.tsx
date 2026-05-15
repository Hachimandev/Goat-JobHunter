import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ActionSheetIOS,
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import * as ImagePicker from "expo-image-picker";

interface ChatInputProps {
  text: string;
  setText: (t: string) => void;
  onSend: () => void;
  onPickImage: () => void;
  onOpenEmoji: () => void;
  isSending: boolean;
  replyTarget: any;
  setReplyTarget: (t: any) => void;
  selectedImages: any[];
  onRemoveImage: (idx: number) => void;
  disabled?: boolean;
  selectedFiles: any[];
  onPickDocument: () => void;
  onRemoveFile: (idx: number) => void;
  onMediaCaptured: (assets: ImagePicker.ImagePickerAsset[]) => void;
  disabledReason?: string;
  onTypingChange?: (typing: boolean) => void | Promise<void>;
  onTypingStop?: () => void | Promise<void>;
}

export const ChatInput = ({
  text,
  setText,
  onSend,
  onPickImage,
  onOpenEmoji,
  isSending,
  replyTarget,
  setReplyTarget,
  selectedImages,
  onRemoveImage,
  selectedFiles,
  onPickDocument,
  onRemoveFile,
  onMediaCaptured,
  disabled,
  disabledReason,
  onTypingChange,
  onTypingStop,
}: ChatInputProps) => {
  const handleTextChange = (value: string) => {
    setText(value);

    if (!disabled) {
      void onTypingChange?.(value.trim().length > 0);
    }
  };

  const handleSendPress = async () => {
    await onTypingStop?.();
    onSend();
  };

  const handleImageBtnPress = () => {
    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ["Hủy", "Thư viện ảnh & Video", "Chụp ảnh", "Quay phim"],
          cancelButtonIndex: 0,
          tintColor: "#0084FF",
        },
        (buttonIndex) => {
          if (buttonIndex === 1) onPickImage();
          else if (buttonIndex === 2) handleLaunchCamera("photo");
          else if (buttonIndex === 3) handleLaunchCamera("video");
        },
      );
    } else {
      Alert.alert("Tùy chọn phương tiện", "Chọn hành động bạn muốn thực hiện", [
        { text: "Thư viện", onPress: onPickImage },
        { text: "Chụp ảnh", onPress: () => handleLaunchCamera("photo") },
        { text: "Quay phim", onPress: () => handleLaunchCamera("video") },
        { text: "Hủy", style: "cancel" },
      ]);
    }
  };

  const handleLaunchCamera = async (type: "photo" | "video") => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Lỗi", "Ứng dụng cần quyền truy cập Camera");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: type === "photo" ? ["images"] : ["videos"],
      quality: 0.4,
      allowsEditing: type === "photo",
      videoMaxDuration: 20,
    });

    if (!result.canceled) {
      onMediaCaptured(result.assets);
    }
  };

  if (disabled) {
    return (
      <View style={{ padding: 10, alignItems: "center" }}>
        <Text style={{ color: "#888", textAlign: "center" }}>
          {disabledReason ||
            "Bạn không thể gửi tin nhắn trong cuộc trò chuyện này."}
        </Text>
      </View>
    );
  }

  return (
    <View style={disabled && { opacity: 0.5 }}>
      {/* Reply Preview */}
      {replyTarget && (
        <View style={styles.replyPreviewContainer}>
          <View style={styles.replyBarIndicator} />
          <View style={styles.replyContentBox}>
            <Text style={styles.replyTargetName}>
              Đang trả lời: {replyTarget.sender?.fullName}
            </Text>
            <Text numberOfLines={1} style={styles.replyTargetText}>
              {replyTarget.content || "[Hình ảnh]"}
            </Text>
          </View>
          <TouchableOpacity onPress={() => setReplyTarget(null)}>
            <Ionicons name="close-circle" size={24} color="#888" />
          </TouchableOpacity>
        </View>
      )}

      {selectedFiles.length > 0 && (
        <View style={styles.filePreviewBar}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {selectedFiles.map((file, idx) => (
              <View key={idx} style={styles.filePreviewItem}>
                <Ionicons name="document-text" size={30} color="#0084FF" />
                <Text numberOfLines={1} style={styles.fileNameText}>
                  {file.name}
                </Text>
                <TouchableOpacity
                  style={styles.removeFileBtn}
                  onPress={() => onRemoveFile(idx)}
                >
                  <Ionicons name="close-circle" size={18} color="#FF3B30" />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Image Preview Bar */}
      {selectedImages.length > 0 && (
        <View style={styles.imagePreviewBar}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {selectedImages.map((img, idx) => (
              <View key={idx} style={styles.previewItem}>
                <Image source={{ uri: img.uri }} style={styles.previewImage} />
                <TouchableOpacity
                  style={styles.removeImgBtn}
                  onPress={() => onRemoveImage(idx)}
                >
                  <Ionicons name="close-circle" size={20} color="#FF3B30" />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Input Bar */}
      <View style={styles.inputContainer}>
        <TouchableOpacity onPress={onOpenEmoji} disabled={disabled}>
          <Ionicons name="happy-outline" size={26} color="#0084FF" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleImageBtnPress}
          disabled={disabled}
          style={{ marginLeft: 10 }}
        >
          <Ionicons name="image" size={26} color="#0084FF" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onPickDocument}
          disabled={disabled}
          style={{ marginLeft: 10 }}
        >
          <Ionicons name="attach" size={28} color="#0084FF" />
        </TouchableOpacity>

        <TextInput
          value={text}
          onChangeText={handleTextChange}
          placeholder={
            disabled ? disabledReason || "Không thể nhắn tin" : "Tin nhắn"
          }
          style={styles.input}
          multiline
          editable={!disabled}
        />

        <TouchableOpacity
          onPress={() => void handleSendPress()}
          style={[
            styles.sendBtn,
            !text.trim() &&
              selectedImages.length === 0 &&
              selectedFiles.length === 0 && { opacity: 0.5 },
          ]}
          disabled={
            (!text.trim() &&
              selectedImages.length === 0 &&
              selectedFiles.length === 0) ||
            disabled
          }
        >
          {isSending ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons name="send" size={20} color="#fff" />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#fff",
    borderTopWidth: 0.5,
    borderTopColor: "#EEE",
  },
  input: {
    flex: 1,
    backgroundColor: "#F0F2F5",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginHorizontal: 10,
    fontSize: 15,
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#0084FF",
    alignItems: "center",
    justifyContent: "center",
  },
  replyPreviewContainer: {
    flexDirection: "row",
    padding: 10,
    backgroundColor: "#f9f9f9",
    borderTopWidth: 0.5,
    borderTopColor: "#ddd",
    alignItems: "center",
  },
  replyBarIndicator: {
    width: 4,
    backgroundColor: "#0084FF",
    borderRadius: 2,
    marginRight: 10,
    height: "100%",
  },
  replyContentBox: { flex: 1 },
  replyTargetName: { fontSize: 12, fontWeight: "bold", color: "#0084FF" },
  replyTargetText: { fontSize: 13, color: "#666" },
  imagePreviewBar: {
    padding: 10,
    backgroundColor: "#fff",
    borderTopWidth: 0.5,
    borderTopColor: "#EEE",
  },
  previewItem: { marginRight: 12, position: "relative" },
  previewImage: { width: 60, height: 60, borderRadius: 10 },
  removeImgBtn: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "#fff",
    borderRadius: 10,
  },
  filePreviewBar: {
    padding: 10,
    backgroundColor: "#fff",
    borderTopWidth: 0.5,
    borderTopColor: "#EEE",
  },
  filePreviewItem: {
    width: 100,
    alignItems: "center",
    marginRight: 10,
    backgroundColor: "#F0F2F5",
    padding: 8,
    borderRadius: 10,
  },
  fileNameText: { fontSize: 10, marginTop: 4, color: "#444" },
  removeFileBtn: { position: "absolute", top: -2, right: -2 },
});
