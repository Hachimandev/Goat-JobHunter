import { useCreatePollMutation } from "@/services/poll/pollApi";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";

interface CreatePollModalProps {
  visible: boolean;
  onClose: () => void;
  chatRoomId: number;
  disabled?: boolean;
  disabledReason?: string;
}

export const CreatePollModal = ({
  visible,
  onClose,
  chatRoomId,
  disabled = false,
  disabledReason,
}: CreatePollModalProps) => {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [deadline, setDeadline] = useState<Date | null>(null);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  const [isPinned, setIsPinned] = useState(false);
  const [isMultiple, setIsMultiple] = useState(false);
  const [canAddOption, setCanAddOption] = useState(true);

  const [createPoll, { isLoading }] = useCreatePollMutation();

  const handleAddOption = () => {
    if (options.length < 10) setOptions([...options, ""]);
  };

  const handleRemoveOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const onSubmit = async () => {
    if (disabled) {
      Alert.alert(
        "Thông báo",
        disabledReason || "Bạn không có quyền tạo bình chọn trong nhóm này",
      );
      return;
    }

    if (!question.trim() || options.filter((o) => o.trim()).length < 2) {
      Alert.alert("Thông báo", "Vui lòng nhập câu hỏi và ít nhất 2 lựa chọn");
      return;
    }

    try {
      await createPoll({
        chatRoomId,
        question: question.trim(),
        options: options.filter((o) => o.trim()),
        multipleChoice: isMultiple,
        allowAddOption: canAddOption,
        pinned: isPinned,
        expiresAt: deadline ? deadline.toISOString() : undefined,
      }).unwrap();
      onClose();
      setQuestion("");
      setOptions(["", ""]);
    } catch {
      Alert.alert("Lỗi", "Tạo bình chọn thất bại");
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
    >
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.headerBtnTxt}>Hủy</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Tạo bình chọn</Text>
            <TouchableOpacity onPress={onSubmit} disabled={isLoading || disabled}>
              <Text
                style={[
                  styles.headerBtnTxt,
                  styles.submitBtn,
                  (isLoading || disabled) && { opacity: 0.5 },
                ]}
              >
                Xong
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.container}
            keyboardShouldPersistTaps="handled"
          >
            {disabled && (
              <View style={styles.disabledNotice}>
                <Text style={styles.disabledNoticeText}>
                  {disabledReason || "Bạn không có quyền tạo bình chọn trong nhóm này"}
                </Text>
              </View>
            )}

            <View style={styles.inputSection}>
              <TextInput
                placeholder="Đặt câu hỏi bình chọn"
                placeholderTextColor="#8E8E93"
                style={styles.questionInput}
                multiline
                value={question}
                onChangeText={setQuestion}
                maxLength={200}
              />
              <Text style={styles.charCount}>{question.length}/200</Text>
            </View>

            {/* Danh sách lựa chọn */}
            <View style={styles.optionsSection}>
              {options.map((opt, index) => (
                <View key={index} style={styles.optionItem}>
                  <MaterialCommunityIcons name="menu" size={20} color="#ccc" />
                  <TextInput
                    placeholder={`Lựa chọn ${index + 1}`}
                    placeholderTextColor="#8E8E93"
                    style={styles.optionInput}
                    value={opt}
                    onChangeText={(txt) => {
                      const newOpts = [...options];
                      newOpts[index] = txt;
                      setOptions(newOpts);
                    }}
                  />
                  {options.length > 2 && (
                    <TouchableOpacity onPress={() => handleRemoveOption(index)}>
                      <Ionicons name="close-circle" size={20} color="#8E8E93" />
                    </TouchableOpacity>
                  )}
                </View>
              ))}

              <TouchableOpacity
                style={styles.addOptionBtn}
                onPress={handleAddOption}
              >
                <Ionicons name="add" size={24} color="#0084FF" />
                <Text style={styles.addOptionTxt}>Thêm lựa chọn</Text>
              </TouchableOpacity>
            </View>

            {/* Thiết lập nâng cao */}
            <View style={styles.settingsSection}>
              <Text style={styles.sectionTitle}>THIẾT LẬP NÂNG CAO</Text>

              <TouchableOpacity
                style={styles.settingRow}
                onPress={() => setDatePickerVisibility(true)}
              >
                <View style={styles.rowLabelGroup}>
                  <Ionicons name="time-outline" size={20} color="#666" />
                  <Text style={styles.settingLabel}>Thời hạn bình chọn</Text>
                </View>
                <Text style={styles.dateDisplay}>
                  {deadline
                    ? deadline.toLocaleString("vi-VN")
                    : "Không thời hạn"}
                </Text>
              </TouchableOpacity>

              <View style={styles.settingRow}>
                <View style={styles.rowLabelGroup}>
                  <Ionicons name="pin-outline" size={20} color="#666" />
                  <Text style={styles.settingLabel}>
                    Ghim lên đầu trò chuyện
                  </Text>
                </View>
                <Switch value={isPinned} onValueChange={setIsPinned} />
              </View>

              <View style={styles.settingRow}>
                <View style={styles.rowLabelGroup}>
                  <Ionicons name="copy-outline" size={20} color="#666" />
                  <Text style={styles.settingLabel}>
                    Cho phép chọn nhiều phương án
                  </Text>
                </View>
                <Switch value={isMultiple} onValueChange={setIsMultiple} />
              </View>

              <View style={styles.settingRow}>
                <View style={styles.rowLabelGroup}>
                  <Ionicons name="add-circle-outline" size={20} color="#666" />
                  <Text style={styles.settingLabel}>
                    Thành viên có thể thêm phương án
                  </Text>
                </View>
                <Switch value={canAddOption} onValueChange={setCanAddOption} />
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>

        <DateTimePickerModal
          isVisible={isDatePickerVisible}
          mode="datetime"
          onConfirm={(date) => {
            setDeadline(date);
            setDatePickerVisibility(false);
          }}
          onCancel={() => setDatePickerVisibility(false)}
        />
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff" },
  header: {
    height: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
    borderColor: "#E5E5E5",
  },
  headerTitle: { fontSize: 17, fontWeight: "600" },
  headerBtnTxt: { fontSize: 16, color: "#000" },
  submitBtn: { color: "#0084FF", fontWeight: "600" },
  container: { flex: 1, backgroundColor: "#F2F2F7" },
  inputSection: { backgroundColor: "#fff", padding: 16, marginBottom: 12 },
  disabledNotice: {
    margin: 12,
    padding: 12,
    borderRadius: 10,
    backgroundColor: "#FFEAEA",
  },
  disabledNoticeText: {
    color: "#B42318",
    fontSize: 13,
    fontWeight: "500",
  },
  questionInput: { fontSize: 16, minHeight: 60, textAlignVertical: "top" },
  charCount: {
    textAlign: "right",
    color: "#8E8E93",
    fontSize: 12,
    marginTop: 4,
  },
  optionsSection: {
    backgroundColor: "#fff",
    paddingLeft: 16,
    marginBottom: 12,
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    height: 50,
    borderBottomWidth: 0.5,
    borderColor: "#E5E5E5",
    paddingRight: 16,
  },
  optionInput: { flex: 1, marginLeft: 12, fontSize: 16 },
  addOptionBtn: { flexDirection: "row", alignItems: "center", height: 50 },
  addOptionTxt: { color: "#0084FF", marginLeft: 8, fontSize: 16 },
  settingsSection: { paddingHorizontal: 16 },
  sectionTitle: {
    fontSize: 13,
    color: "#8E8E93",
    marginBottom: 8,
    marginTop: 12,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
  },
  rowLabelGroup: { flexDirection: "row", alignItems: "center" },
  settingLabel: { marginLeft: 10, fontSize: 15 },
  dateDisplay: { color: "#0084FF", fontSize: 14 },
});
