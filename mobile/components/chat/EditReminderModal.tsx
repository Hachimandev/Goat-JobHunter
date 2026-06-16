import { useUpdateReminderMutation } from "@/services/chatRoom/reminder/reminderApi";
import { ReminderRepeatType } from "@/types/enum";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { addMinutes, addDays, setHours, setMinutes, format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import DateTimePickerModal from "react-native-modal-datetime-picker";

interface EditReminderModalProps {
  visible: boolean;
  onClose: () => void;
  chatRoomId: number;
  reminder: any;
  onSuccess?: () => void;
}

const repeatOptions: { label: string; value: ReminderRepeatType }[] = [
  { label: "Không lặp lại", value: ReminderRepeatType.NONE },
  { label: "Hàng ngày", value: ReminderRepeatType.DAILY },
  { label: "Hàng tuần", value: ReminderRepeatType.WEEKLY },
  { label: "Hàng tháng", value: ReminderRepeatType.MONTHLY },
  { label: "Hàng năm", value: ReminderRepeatType.YEARLY },
];

export const EditReminderModal = ({
  visible,
  onClose,
  chatRoomId,
  reminder,
  onSuccess,
}: EditReminderModalProps) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [reminderTime, setReminderTime] = useState<Date | null>(null);
  const [repeatType, setRepeatType] = useState<ReminderRepeatType>(
    ReminderRepeatType.NONE,
  );
  const [allowResponse, setAllowResponse] = useState(false);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  const insets = useSafeAreaInsets();

  const [updateReminder, { isLoading }] = useUpdateReminderMutation();

  useEffect(() => {
    if (visible && reminder) {
      setTitle(reminder.title || "");
      setContent(reminder.content || "");
      setReminderTime(
        reminder.reminderTime ? new Date(reminder.reminderTime) : null,
      );
      setRepeatType(reminder.repeatType || ReminderRepeatType.NONE);
      setAllowResponse(reminder.allowResponse !== false);
    }
  }, [visible, reminder]);

  const onSubmit = async () => {
    if (!title.trim()) {
      Alert.alert("Thông báo", "Vui lòng nhập tiêu đề lịch hẹn");
      return;
    }

    if (!reminderTime) {
      Alert.alert("Thông báo", "Vui lòng chọn thời gian lịch hẹn");
      return;
    }

    try {
      await updateReminder({
        chatRoomId,
        reminderId: reminder.reminderId,
        title: title.trim(),
        content: content.trim(),
        reminderTime: reminderTime.toISOString(),
        repeatType,
        allowResponse,
      }).unwrap();
      onSuccess?.();
      onClose();
    } catch (e: any) {
      Alert.alert(
        "Lỗi",
        e?.data?.message || "Cập nhật lịch hẹn thất bại. Vui lòng thử lại.",
      );
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
    >
      <View
        style={[
          styles.safeArea,
          { paddingTop: insets.top, paddingBottom: insets.bottom },
        ]}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.headerBtnTxt}>Hủy</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Chỉnh sửa lịch hẹn</Text>
            <TouchableOpacity onPress={onSubmit} disabled={isLoading}>
              <Text
                style={[
                  styles.headerBtnTxt,
                  styles.submitBtn,
                  isLoading && { opacity: 0.5 },
                ]}
              >
                Lưu
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.container}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.inputSection}>
              <Text style={styles.label}>Tiêu đề</Text>
              <TextInput
                placeholder="Nhập tiêu đề"
                placeholderTextColor="#8E8E93"
                style={styles.textInput}
                value={title}
                onChangeText={setTitle}
                maxLength={120}
              />
            </View>

            <View style={styles.inputSection}>
              <Text style={styles.label}>Mô tả</Text>
              <TextInput
                placeholder="Nhập mô tả (tuỳ chọn)"
                placeholderTextColor="#8E8E93"
                style={[styles.textInput, styles.textArea]}
                value={content}
                onChangeText={setContent}
                multiline
                numberOfLines={4}
                maxLength={500}
              />
            </View>

            <View style={styles.inputSection}>
              <Text style={styles.label}>Thời gian</Text>
              <View>
                <TouchableOpacity
                  style={styles.dateButton}
                  onPress={() => setDatePickerVisibility(true)}
                >
                  <View style={styles.rowLabelGroup}>
                    <Ionicons name="time-outline" size={20} color="#666" />
                    <Text style={styles.dateButtonText}>Chọn thời gian</Text>
                  </View>
                  <Text style={styles.selectedDateText}>
                    {reminderTime
                      ? format(reminderTime, "PPpp", { locale: vi })
                      : "Chưa chọn"}
                  </Text>
                </TouchableOpacity>

                <View style={styles.quickButtonsRow}>
                  <TouchableOpacity
                    style={styles.quickBtn}
                    onPress={() => setReminderTime(addMinutes(new Date(), 15))}
                  >
                    <Text style={styles.quickBtnTxt}>15 phút</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.quickBtn}
                    onPress={() => setReminderTime(addMinutes(new Date(), 30))}
                  >
                    <Text style={styles.quickBtnTxt}>30 phút</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.quickBtn}
                    onPress={() => {
                      const tomorrow9 = setMinutes(
                        setHours(addDays(new Date(), 1), 9),
                        0,
                      );
                      setReminderTime(tomorrow9);
                    }}
                  >
                    <Text style={styles.quickBtnTxt}>9:00 ngày mai</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <View style={styles.inputSection}>
              <Text style={styles.label}>Lặp lại</Text>
              <View style={styles.repeatOptions}>
                {repeatOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.repeatOption,
                      repeatType === option.value && styles.repeatOptionActive,
                    ]}
                    onPress={() => setRepeatType(option.value)}
                  >
                    <Text
                      style={[
                        styles.repeatOptionText,
                        repeatType === option.value &&
                          styles.repeatOptionTextActive,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.settingRow}>
              <View style={styles.rowLabelGroup}>
                <MaterialCommunityIcons
                  name="account-check-outline"
                  size={20}
                  color="#666"
                />
                <Text style={styles.settingLabel}>Cho phép phản hồi</Text>
              </View>
              <Switch value={allowResponse} onValueChange={setAllowResponse} />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>

        <DateTimePickerModal
          isVisible={isDatePickerVisible}
          mode="datetime"
          date={reminderTime || new Date()}
          onConfirm={(date) => {
            setReminderTime(date);
            setDatePickerVisibility(false);
          }}
          onCancel={() => setDatePickerVisibility(false)}
        />
      </View>
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
  label: { fontSize: 13, color: "#333", marginBottom: 8, fontWeight: "600" },
  textInput: {
    minHeight: 44,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: "#000",
    backgroundColor: "#fff",
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  dateButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 10,
    padding: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dateButtonText: { color: "#666", marginLeft: 8, fontSize: 14 },
  selectedDateText: { color: "#000", fontSize: 14, maxWidth: "70%" },
  repeatOptions: {
    flexWrap: "wrap",
    flexDirection: "row",
    gap: 8,
  },
  quickButtonsRow: { flexDirection: "row", gap: 8, marginTop: 8 },
  quickBtn: {
    backgroundColor: "#fff",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  quickBtnTxt: { color: "#0084FF", fontWeight: "700" },
  repeatOption: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 10,
    backgroundColor: "#fff",
  },
  repeatOptionActive: {
    backgroundColor: "#0084FF",
    borderColor: "#0084FF",
  },
  repeatOptionText: { fontSize: 13, color: "#333" },
  repeatOptionTextActive: { color: "#fff" },
  settingRow: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  rowLabelGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  settingLabel: { fontSize: 14, color: "#333" },
});
