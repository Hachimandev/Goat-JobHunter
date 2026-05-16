import React, { useEffect, useMemo, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
} from "react-native";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  useGetRemindersByChatRoomQuery,
  useRespondToReminderMutation,
  useDeclineReminderMutation,
} from "@/services/chatRoom/reminder/reminderApi";
import { ReminderRsvpStatus } from "@/types/enum";
import { useUser } from "@/hooks/useUser";
import { EditReminderModal } from "./EditReminderModal";

interface Props {
  visible: boolean;
  onClose: () => void;
  chatRoomId: number;
  reminderId?: number | null;
}

export const ReminderDetailModal = ({
  visible,
  onClose,
  chatRoomId,
  reminderId,
}: Props) => {
  const { user } = useUser();
  const { data: remindersRes, refetch } = useGetRemindersByChatRoomQuery(
    { chatRoomId },
    { skip: !visible },
  );

  const [respondToReminder, { isLoading: isResponding }] =
    useRespondToReminderMutation();
  const [declineReminder, { isLoading: isDeclining }] =
    useDeclineReminderMutation();

  const [showEditModal, setShowEditModal] = useState(false);

  const reminder = useMemo(() => {
    if (!remindersRes?.data) return null;
    if (reminderId)
      return (
        remindersRes.data.find((r: any) => r.reminderId === reminderId) || null
      );
    return remindersRes.data[0] || null;
  }, [remindersRes, reminderId]);

  useEffect(() => {
    if (visible) refetch();
  }, [visible, refetch]);

  const isCreator = useMemo(() => {
    if (!reminder || !user) return false;
    return (
      reminder.createdBy === user.email ||
      reminder.createdBy === user.username ||
      (reminder as any).creatorId === user.accountId
    );
  }, [reminder, user]);
  // note: refetch is stable from RTK Query but include to satisfy lint

  const isExpired = useMemo(() => {
    if (!reminder) return false;
    return (
      reminder.reminderTime &&
      new Date(reminder.reminderTime).getTime() <= Date.now()
    );
  }, [reminder]);

  const handleJoin = async () => {
    if (!reminder) return;
    const isExpired =
      reminder.reminderTime && new Date(reminder.reminderTime) <= new Date();
    if (isExpired) {
      Alert.alert("Thông báo", "Lịch hẹn đã hết hạn, không thể xác nhận.");
      return;
    }
    try {
      await respondToReminder({
        chatRoomId,
        reminderId: reminder.reminderId,
        status: ReminderRsvpStatus.ACCEPTED,
      }).unwrap();
      refetch();
    } catch (e: any) {
      Alert.alert("Lỗi", e?.data?.message || "Không thể tham gia");
    }
  };

  const handleReject = async () => {
    if (!reminder) return;
    const isExpired =
      reminder.reminderTime && new Date(reminder.reminderTime) <= new Date();
    if (isExpired) {
      Alert.alert("Thông báo", "Lịch hẹn đã hết hạn, không thể thay đổi.");
      return;
    }
    try {
      await respondToReminder({
        chatRoomId,
        reminderId: reminder.reminderId,
        status: ReminderRsvpStatus.REJECTED,
      }).unwrap();
      refetch();
    } catch (e: any) {
      Alert.alert("Lỗi", e?.data?.message || "Không thể từ chối");
    }
  };

  const handleCancelReminder = async () => {
    if (!reminder) return;
    Alert.alert("Hủy lịch hẹn", "Bạn có chắc chắn muốn hủy lịch hẹn này?", [
      { text: "Đóng", style: "cancel" },
      {
        text: "Hủy lịch",
        style: "destructive",
        onPress: async () => {
          try {
            await declineReminder({
              chatRoomId,
              reminderId: reminder.reminderId,
            }).unwrap();
            refetch();
            onClose();
          } catch (e: any) {
            Alert.alert("Lỗi", e?.data?.message || "Không thể hủy lịch hẹn");
          }
        },
      },
    ]);
  };

  if (!visible) return null;

  const participants = Array.isArray((reminder as any)?.participants)
    ? (reminder as any).participants
    : [];
  const acceptedParticipants = participants.filter(
    (p: any) =>
      p.status === "ACCEPTED" || p.status === ReminderRsvpStatus.ACCEPTED,
  );
  const declinedParticipants = participants.filter(
    (p: any) =>
      p.status === "REJECTED" || p.status === ReminderRsvpStatus.REJECTED,
  );

  const acceptedCount =
    (reminder as any)?.acceptCount ?? acceptedParticipants.length;
  const declinedCount =
    (reminder as any)?.declineCount ?? declinedParticipants.length;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.overlay}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Chi tiết nhắc hẹn</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} />
            </TouchableOpacity>
          </View>

          <ScrollView style={{ padding: 16, maxHeight: 520 }}>
            {!reminder ? (
              <ActivityIndicator />
            ) : (
              <View>
                <View style={styles.cardRow}>
                  <View style={styles.leftBoxLarge}>
                    <Text style={styles.leftDayLarge}>
                      {reminder.reminderTime
                        ? format(new Date(reminder.reminderTime), "d")
                        : "-"}
                    </Text>
                    <Text style={styles.leftMonthLarge}>
                      {reminder.reminderTime
                        ? format(new Date(reminder.reminderTime), "LLL", {
                            locale: vi,
                          })
                        : ""}
                    </Text>
                  </View>

                  <View style={styles.cardBodyLarge}>
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                      }}
                    >
                      <Text style={styles.remTitleLarge}>{reminder.title}</Text>
                      {new Date(reminder.reminderTime || Date.now()) <=
                        new Date() && (
                        <View style={styles.expiredPill}>
                          <Text style={styles.expiredText}>Hết hạn</Text>
                        </View>
                      )}
                    </View>

                    <View style={styles.metaRow}>
                      <Ionicons name="time-outline" size={16} color="#6B7280" />
                      <Text style={styles.metaText}>
                        {reminder.reminderTime
                          ? format(
                              new Date(reminder.reminderTime),
                              "'Hôm nay lúc' HH:mm",
                              { locale: vi },
                            )
                          : "Thời gian không xác định"}
                      </Text>
                    </View>
                    <View style={styles.metaRow}>
                      <Ionicons
                        name="calendar-outline"
                        size={16}
                        color="#6B7280"
                      />
                      <Text style={styles.metaText}>
                        {" "}
                        {reminder.repeatType === "NONE"
                          ? "Không lặp lại"
                          : reminder.repeatType}
                      </Text>
                    </View>

                    <View style={styles.rsvpRow}>
                      <Text style={styles.joinBadge}>
                        Tham Gia {acceptedCount}
                      </Text>
                      <Text style={styles.declineBadge}>
                        Từ Chối {declinedCount}
                      </Text>
                    </View>

                    {acceptedParticipants.length > 0 && (
                      <View style={{ marginTop: 16 }}>
                        <Text
                          style={{
                            fontWeight: "700",
                            marginBottom: 8,
                            fontSize: 13,
                            color: "#374151",
                          }}
                        >
                          Người tham gia ({acceptedCount})
                        </Text>
                        <ScrollView
                          horizontal
                          showsHorizontalScrollIndicator={false}
                          contentContainerStyle={{ gap: 12 }}
                        >
                          {acceptedParticipants.map((p: any) => (
                            <View
                              key={p.accountId}
                              style={{ alignItems: "center", width: 52 }}
                            >
                              <Image
                                source={{
                                  uri:
                                    p.avatar ||
                                    "https://via.placeholder.com/40",
                                }}
                                style={{
                                  width: 36,
                                  height: 36,
                                  borderRadius: 18,
                                  backgroundColor: "#eee",
                                }}
                              />
                              <Text
                                style={{
                                  fontSize: 10,
                                  marginTop: 4,
                                  textAlign: "center",
                                  color: "#4B5563",
                                }}
                                numberOfLines={1}
                              >
                                {p.fullName || p.displayName || p.username}
                              </Text>
                            </View>
                          ))}
                        </ScrollView>
                      </View>
                    )}

                    {declinedParticipants.length > 0 && (
                      <View style={{ marginTop: 16 }}>
                        <Text
                          style={{
                            fontWeight: "700",
                            marginBottom: 8,
                            fontSize: 13,
                            color: "#374151",
                          }}
                        >
                          Từ chối ({declinedCount})
                        </Text>
                        <ScrollView
                          horizontal
                          showsHorizontalScrollIndicator={false}
                          contentContainerStyle={{ gap: 12 }}
                        >
                          {declinedParticipants.map((p: any) => (
                            <View
                              key={p.accountId}
                              style={{ alignItems: "center", width: 52 }}
                            >
                              <Image
                                source={{
                                  uri:
                                    p.avatar ||
                                    "https://via.placeholder.com/40",
                                }}
                                style={{
                                  width: 36,
                                  height: 36,
                                  borderRadius: 18,
                                  backgroundColor: "#eee",
                                }}
                              />
                              <Text
                                style={{
                                  fontSize: 10,
                                  marginTop: 4,
                                  textAlign: "center",
                                  color: "#4B5563",
                                }}
                                numberOfLines={1}
                              >
                                {p.fullName || p.displayName || p.username}
                              </Text>
                            </View>
                          ))}
                        </ScrollView>
                      </View>
                    )}

                    {reminder.content ? (
                      <Text style={{ marginTop: 8, color: "#059669" }}>
                        {reminder.content}
                      </Text>
                    ) : null}
                  </View>
                </View>

                <View style={styles.confirmBox}>
                  <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                  <View style={{ flex: 1, marginLeft: 8 }}>
                    <Text
                      style={{
                        fontWeight: "700",
                        color: "#111827",
                        fontSize: 13,
                      }}
                    >
                      {(reminder as any).userRsvp === "ACCEPTED"
                        ? "Bạn xác nhận: Tham gia."
                        : (reminder as any).userRsvp === "REJECTED"
                          ? "Bạn xác nhận: Từ chối."
                          : "Bạn xác nhận: Chưa phản hồi."}
                    </Text>
                  </View>
                  {!isExpired && (
                    <TouchableOpacity
                      onPress={() => {
                        Alert.alert("Xác nhận tham gia", "", [
                          { text: "Đóng", style: "cancel" },
                          {
                            text: "Tham gia",
                            onPress: handleJoin,
                          },
                          {
                            text: "Từ chối",
                            onPress: handleReject,
                          },
                        ]);
                      }}
                    >
                      <Text
                        style={{
                          color: "#0084FF",
                          fontWeight: "700",
                          fontSize: 13,
                        }}
                      >
                        {(reminder as any).userRsvp === "ACCEPTED" ||
                        (reminder as any).userRsvp === "REJECTED"
                          ? "Thay đổi"
                          : "Phản hồi"}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}
          </ScrollView>

          {isCreator && !isExpired && (
            <View style={styles.footer}>
              <TouchableOpacity
                style={[
                  styles.btn,
                  {
                    backgroundColor: "#fff",
                    borderWidth: 1,
                    borderColor: "#E5E7EB",
                  },
                ]}
                onPress={() => setShowEditModal(true)}
                disabled={!!isExpired}
              >
                <Text style={[styles.btnTxt, { color: "#374151" }]}>
                  Chỉnh sửa
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btn, { backgroundColor: "#FF3B30" }]}
                onPress={handleCancelReminder}
                disabled={!!isDeclining || !!isExpired}
              >
                {isDeclining ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.btnTxt}>Hủy lịch hẹn</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>

      {isCreator && reminder && (
        <EditReminderModal
          visible={showEditModal}
          onClose={() => setShowEditModal(false)}
          chatRoomId={chatRoomId}
          reminder={reminder}
          onSuccess={() => refetch()}
        />
      )}
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 12,
    borderBottomWidth: 0.5,
    borderColor: "#eee",
    alignItems: "center",
  },
  title: { fontWeight: "bold", fontSize: 16 },
  remTitle: { fontSize: 18, fontWeight: "700", marginBottom: 8 },
  remTime: { color: "#6b7280", marginBottom: 8 },
  remContent: { marginTop: 8, color: "#374151" },
  cardRow: { flexDirection: "row", alignItems: "flex-start" },
  leftBoxLarge: {
    width: 72,
    height: 72,
    borderRadius: 8,
    backgroundColor: "#10B981",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  leftDayLarge: { fontSize: 22, color: "#fff", fontWeight: "800" },
  leftMonthLarge: { fontSize: 12, color: "#fff", textTransform: "capitalize" },
  cardBodyLarge: { flex: 1 },
  remTitleLarge: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111",
    flex: 1,
    marginRight: 8,
  },
  expiredPill: {
    backgroundColor: "#ff3b30",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  expiredText: { color: "#fff", fontWeight: "700", fontSize: 12 },
  metaRow: { flexDirection: "row", alignItems: "center", marginTop: 8, gap: 8 },
  metaText: { color: "#6B7280", marginLeft: 8 },
  rsvpRow: { flexDirection: "row", gap: 8, marginTop: 12 },
  joinBadge: {
    backgroundColor: "#ECFDF5",
    color: "#10B981",
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    fontWeight: "700",
  },
  declineBadge: {
    backgroundColor: "#F3F4F6",
    color: "#6B7280",
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    fontWeight: "700",
  },
  confirmBox: {
    marginTop: 12,
    backgroundColor: "#F0FDF4",
    padding: 12,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  footer: { padding: 12, flexDirection: "row", gap: 8 },
  btn: { flex: 1, padding: 12, borderRadius: 10, alignItems: "center" },
  btnTxt: { color: "#fff", fontWeight: "700" },
});

export default ReminderDetailModal;
