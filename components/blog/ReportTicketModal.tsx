import { ReportReason, reasonLabels } from "@/types/enum";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { RadioButton } from "react-native-paper";

interface Props {
  isVisible: boolean;
  onClose: () => void;
  targetId: number | null;
  targetType: "blog" | "comment";
}

const ReportTicketModal = ({
  isVisible,
  onClose,
  targetId,
  targetType,
}: Props) => {
  const [reason, setReason] = useState<ReportReason | "">("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (!reason) {
      setError("Vui lòng chọn một lý do báo cáo.");
      return;
    }
    if (reason === ReportReason.OTHER && !description.trim()) {
      setError("Vui lòng nhập mô tả chi tiết.");
      return;
    }

    console.log("Submit report:", {
      targetId,
      targetType,
      reason,
      description,
    });

    setReason("");
    setDescription("");
    onClose();
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalContainer}
        >
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Báo cáo vi phạm</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeBtn}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
            <Text style={styles.label}>Chọn lý do:</Text>

            <RadioButton.Group
              onValueChange={(value) => {
                setReason(value as ReportReason);
                setError("");
              }}
              value={reason}
            >
              {Object.entries(reasonLabels).map(([key, value]) => (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.radioItem,
                    reason === key && styles.radioItemActive,
                  ]}
                  onPress={() => setReason(key as ReportReason)}
                >
                  <RadioButton value={key} color="#ef4444" />
                  <Text style={styles.radioLabel}>{value}</Text>
                </TouchableOpacity>
              ))}
            </RadioButton.Group>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Mô tả chi tiết <Text style={{ color: "#ef4444" }}>*</Text>
              </Text>
              <TextInput
                style={styles.textArea}
                multiline
                numberOfLines={4}
                placeholder={
                  reason === ReportReason.OTHER
                    ? "Vui lòng mô tả rõ vi phạm..."
                    : "Thông tin bổ sung (không bắt buộc)"
                }
                value={description}
                onChangeText={setDescription}
                textAlignVertical="top"
              />
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelBtnText}>Hủy bỏ</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
              <Text style={styles.submitBtnText}>Gửi báo cáo</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "90%",
    paddingBottom: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  closeBtn: {
    fontSize: 20,
    color: "#666",
    padding: 5,
  },
  form: {
    padding: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    marginBottom: 10,
  },
  radioItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 10,
    marginBottom: 8,
  },
  radioItemActive: {
    borderColor: "#ef4444",
    backgroundColor: "#fef2f2",
  },
  radioLabel: {
    fontSize: 15,
    marginLeft: 8,
  },
  inputGroup: {
    marginTop: 15,
  },
  textArea: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    minHeight: 100,
    backgroundColor: "#fafafa",
  },
  errorText: {
    color: "#ef4444",
    fontSize: 12,
    marginTop: 10,
    fontStyle: "italic",
  },
  footer: {
    flexDirection: "row",
    padding: 20,
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    backgroundColor: "#f3f4f6",
  },
  cancelBtnText: {
    fontWeight: "600",
    color: "#4b5563",
  },
  submitBtn: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    backgroundColor: "#ef4444",
  },
  submitBtnText: {
    fontWeight: "600",
    color: "#fff",
  },
});

export default ReportTicketModal;
