import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import React from "react";
import {
  ActionSheetIOS,
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { TRANSLATE_LANGUAGE_OPTIONS } from "@/constants/constant";
import { useTranslateMessageMutation } from "@/services/ai/conversationApi";
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
  const [isTranslateModalOpen, setIsTranslateModalOpen] = React.useState(false);
  const [selectedTargetLang, setSelectedTargetLang] =
    React.useState("Vietnamese");
  const [translatedText, setTranslatedText] = React.useState<string | null>(
    null,
  );
  const [translateMessage, { isLoading: isTranslating }] =
    useTranslateMessageMutation();

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

  const openTranslateModal = () => {
    if (!text.trim()) {
      Alert.alert("Thông báo", "Vui lòng nhập nội dung để dịch");
      return;
    }

    setTranslatedText(null);
    setIsTranslateModalOpen(true);
  };

  const handleTranslate = async () => {
    const content = text.trim();
    if (!content) {
      Alert.alert("Thông báo", "Vui lòng nhập nội dung để dịch");
      return;
    }

    try {
      const response = await translateMessage({
        content,
        targetLang: selectedTargetLang,
      }).unwrap();
      const nextTranslatedText = response?.data?.translatedText;

      if (!nextTranslatedText) {
        Alert.alert("Lỗi", "Không thể dịch văn bản");
        return;
      }

      setTranslatedText(nextTranslatedText);
      handleTextChange(nextTranslatedText);
    } catch (error: any) {
      Alert.alert(
        "Lỗi",
        error?.data?.message || "Đã có lỗi xảy ra khi dịch nội dung",
      );
    }
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

        <TouchableOpacity
          onPress={openTranslateModal}
          disabled={disabled || !text.trim()}
          style={{ marginLeft: 10, opacity: text.trim() ? 1 : 0.45 }}
        >
          <Ionicons name="language-outline" size={25} color="#0084FF" />
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

      <Modal
        visible={isTranslateModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsTranslateModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.translateModal}>
            <View style={styles.translateHeader}>
              <Text style={styles.translateTitle}>Dịch nội dung</Text>
              <TouchableOpacity onPress={() => setIsTranslateModalOpen(false)}>
                <Ionicons name="close" size={22} color="#111827" />
              </TouchableOpacity>
            </View>

            <View style={styles.pickerBox}>
              <Picker
                selectedValue={selectedTargetLang}
                onValueChange={(value) => setSelectedTargetLang(value)}
              >
                {TRANSLATE_LANGUAGE_OPTIONS.map((option) => (
                  <Picker.Item
                    key={option.value}
                    label={option.label}
                    value={option.value}
                  />
                ))}
              </Picker>
            </View>

            <View style={styles.translateBlock}>
              <Text style={styles.translateLabel}>Nội dung hiện tại</Text>
              <Text style={styles.translateContent}>{text}</Text>
            </View>

            {translatedText && (
              <View style={styles.translateBlock}>
                <Text style={styles.translateLabel}>Bản dịch</Text>
                <Text style={styles.translatedContent}>{translatedText}</Text>
              </View>
            )}

            <TouchableOpacity
              style={[
                styles.translateButton,
                isTranslating && { opacity: 0.65 },
              ]}
              onPress={handleTranslate}
              disabled={isTranslating}
            >
              {isTranslating ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Ionicons name="language-outline" size={18} color="#fff" />
                  <Text style={styles.translateButtonText}>Dịch</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    paddingHorizontal: 18,
  },
  translateModal: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    maxHeight: "82%",
  },
  translateHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  translateTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  pickerBox: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 12,
  },
  translateBlock: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  translateLabel: {
    color: "#6B7280",
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 6,
    textTransform: "uppercase",
  },
  translateContent: {
    color: "#111827",
    fontSize: 15,
    lineHeight: 21,
  },
  translatedContent: {
    color: "#0084FF",
    fontSize: 15,
    lineHeight: 21,
    fontWeight: "600",
  },
  translateButton: {
    height: 44,
    borderRadius: 22,
    backgroundColor: "#0084FF",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  translateButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
});
