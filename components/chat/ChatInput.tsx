import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

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
  disabled,
}: ChatInputProps) => {
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
          onPress={onPickImage}
          disabled={disabled}
          style={{ marginLeft: 10 }}
        >
          <Ionicons name="image" size={26} color="#0084FF" />
        </TouchableOpacity>

        <TextInput
          value={text}
          onChangeText={setText}
          placeholder={disabled ? "Không thể nhắn tin" : "Tin nhắn"}
          style={styles.input}
          multiline
          editable={!disabled}
        />

        <TouchableOpacity
          onPress={onSend}
          style={[
            styles.sendBtn,
            !text.trim() && selectedImages.length === 0 && { opacity: 0.5 },
          ]}
          disabled={(!text.trim() && selectedImages.length === 0) || disabled}
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
});
