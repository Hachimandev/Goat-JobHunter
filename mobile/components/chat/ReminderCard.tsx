import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Ionicons } from "@expo/vector-icons";

interface Props {
  title: string;
  createdAt: string;
  expired?: boolean;
  content?: string | null;
  repeatLabel?: string;
  allowResponse?: boolean;
  acceptedCount?: number;
  declinedCount?: number;
  userStatus?: string;
  onView?: () => void;
  onJoin?: () => void;
  onDecline?: () => void;
  onChangeRsvp?: () => void;
}

export const ReminderCard = ({
  title,
  createdAt,
  expired = false,
  content,
  repeatLabel,
  allowResponse = true,
  acceptedCount = 0,
  declinedCount = 0,
  userStatus,
  onView,
  onJoin,
  onDecline,
  onChangeRsvp,
}: Props) => {
  const date = createdAt ? new Date(createdAt) : null;
  const showActions = allowResponse && !expired;
  const isResponded = userStatus === "ACCEPTED" || userStatus === "REJECTED";
  const isAccepted = userStatus === "ACCEPTED";

  return (
    <View style={[styles.card, expired && styles.cardExpired]}>
      <View style={styles.leftBox}>
        <Text style={styles.leftDay}>{date ? format(date, "d") : "-"}</Text>
        <Text style={styles.leftMonth}>
          {date ? format(date, "LLL", { locale: vi }) : ""}
        </Text>
      </View>

      <View style={styles.body}>
        <View style={styles.rowTop}>
          <Text style={styles.title} numberOfLines={2}>
            {title}
          </Text>
          <TouchableOpacity onPress={onView}>
            <Text style={styles.viewLink}>Xem</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.timeText}>
          {date
            ? format(date, "PPp", { locale: vi })
            : "Thời gian không xác định"}
        </Text>

        {repeatLabel ? (
          <Text style={styles.metaText}>{repeatLabel}</Text>
        ) : null}

        {content ? (
          <Text style={styles.contentText} numberOfLines={2}>
            {content}
          </Text>
        ) : null}

        {allowResponse ? (
          <View style={styles.statsRow}>
            <Text style={styles.acceptBadge}>Tham gia {acceptedCount}</Text>
            <Text style={styles.declineBadge}>Từ chối {declinedCount}</Text>
          </View>
        ) : null}

        {/* KHỐI XÁC NHẬN RSVP ĐÃ ĐƯỢC TỐI ƯU ĐỘNG */}
        {allowResponse && isResponded ? (
          <View
            style={[
              styles.confirmBox,
              isAccepted ? styles.confirmBoxAccept : styles.confirmBoxDecline,
            ]}
          >
            <View style={styles.confirmLeftContent}>
              <Ionicons
                name={isAccepted ? "checkmark-circle" : "close-circle"}
                size={16}
                color={isAccepted ? "#10B981" : "#EF4444"}
              />
              <Text
                style={[
                  styles.confirmText,
                  isAccepted
                    ? styles.confirmTextAccept
                    : styles.confirmTextDecline,
                ]}
                numberOfLines={1}
              >
                {isAccepted
                  ? "Bạn xác nhận: Tham gia"
                  : "Bạn xác nhận: Từ chối"}
              </Text>
            </View>
            {showActions && (
              <TouchableOpacity onPress={onChangeRsvp} style={styles.changeBtn}>
                <Text style={styles.changeLink}>Thay đổi</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          showActions && (
            <View style={styles.actionsRow}>
              <TouchableOpacity style={styles.joinBtn} onPress={onJoin}>
                <Text style={styles.joinTxt}>Tham gia</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.declineBtn} onPress={onDecline}>
                <Text style={styles.declineTxt}>Từ chối</Text>
              </TouchableOpacity>
            </View>
          )
        )}

        {expired && <Text style={styles.expiredText}>Nhắc hẹn đã đến hạn</Text>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    alignItems: "flex-start",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    width: "100%", // Đồng bộ kéo rộng ra 100% không gian vùng bao ngoài
    shadowColor: "#111827",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  cardExpired: {
    backgroundColor: "#fdfdfd",
  },
  leftBox: {
    width: 58,
    height: 64,
    borderRadius: 10,
    backgroundColor: "#0F766E",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    overflow: "hidden",
  },
  leftDay: { fontSize: 22, color: "#fff", fontWeight: "800" },
  leftMonth: { fontSize: 12, color: "#fff", textTransform: "capitalize" },
  body: { flex: 1, minWidth: 0 },
  rowTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  title: {
    fontSize: 15,
    fontWeight: "800",
    color: "#111827",
    flex: 1,
    marginRight: 8,
  },
  viewLink: { color: "#0084FF", fontWeight: "800", fontSize: 13 },
  timeText: { fontSize: 13, color: "#6B7280", marginTop: 6 },
  metaText: { fontSize: 12, color: "#6B7280", marginTop: 4 },
  contentText: { fontSize: 13, color: "#374151", marginTop: 6, lineHeight: 18 },
  statsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
  },
  acceptBadge: {
    backgroundColor: "#ECFDF5",
    color: "#047857",
    fontSize: 11,
    fontWeight: "700",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  declineBadge: {
    backgroundColor: "#F3F4F6",
    color: "#4B5563",
    fontSize: 11,
    fontWeight: "700",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  actionsRow: { flexDirection: "row", gap: 8, marginTop: 10 },
  joinBtn: {
    backgroundColor: "#0F766E",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  joinTxt: { color: "#fff", fontWeight: "700", fontSize: 12 },
  declineBtn: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 8,
  },
  declineTxt: { color: "#111827", fontWeight: "700", fontSize: 12 },
  expiredText: {
    color: "#DC2626",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 8,
  },

  // --- KHU VỰC CẤU TRÚC LẠI BOX XÁC NHẬN ---
  confirmBox: {
    marginTop: 10,
    padding: 10,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  confirmBoxAccept: {
    backgroundColor: "#F0FDF4", // Nền xanh nhạt chuẩn Zalo
  },
  confirmBoxDecline: {
    backgroundColor: "#FEF2F2", // Đổi sang nền đỏ nhạt khi Từ chối
  },
  confirmLeftContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 10, // Đẩy khoảng cách an toàn, chặn hoàn toàn đè chữ
  },
  confirmText: {
    fontWeight: "600",
    fontSize: 12,
    marginLeft: 6,
    flex: 1,
  },
  confirmTextAccept: {
    color: "#111827", // Màu chữ tối thông thường cho việc đồng ý
  },
  confirmTextDecline: {
    color: "#991B1B", // Đổi sang màu chữ đỏ sậm huyền bí khi Từ chối
  },
  changeBtn: {
    justifyContent: "center",
    alignItems: "center",
  },
  changeLink: {
    color: "#0084FF",
    fontWeight: "700",
    fontSize: 12,
  },
});

export default ReminderCard;
