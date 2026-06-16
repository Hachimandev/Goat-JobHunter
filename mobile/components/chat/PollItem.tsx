import { useFetchPollByIdInChatRoomQuery } from "@/services/poll/pollApi";
import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export const PollItem = ({ message, onOpenVote }: any) => {
  const pollIdRaw = message.content.match(/poll_([a-z0-9]+)/)?.[0];

  const { data: pollResponse, isLoading } = useFetchPollByIdInChatRoomQuery(
    {
      chatRoomId: String(message.chatRoomId),
      pollId: pollIdRaw || "",
    },
    { skip: !pollIdRaw },
  );

  const poll = pollResponse?.data;

  if (isLoading)
    return (
      <ActivityIndicator size="small" color="#0084FF" style={{ padding: 20 }} />
    );
  if (!poll) return null;

  const totalVotes =
    poll.options?.reduce((s: number, o: any) => s + (o.voteCount || 0), 0) || 0;

  return (
    <View style={styles.card}>
      <Text style={styles.question}>{poll.question}</Text>
      <Text style={styles.subText}>
        {poll.isClosed
          ? "Bình chọn đã đóng"
          : poll.multipleChoice
            ? "Chọn nhiều phương án"
            : "Chọn một phương án"}
      </Text>

      {poll.options?.slice(0, 3).map((opt: any) => {
        const percent =
          totalVotes > 0 ? Math.round((opt.voteCount / totalVotes) * 100) : 0;
        return (
          <View key={opt.optionId} style={styles.track}>
            {/* Thanh tiến độ chạy ngầm */}
            <View style={[styles.fill, { width: `${percent}%` }]} />
            <View style={styles.optionInfo}>
              <Text style={styles.optText} numberOfLines={1}>
                {opt.text}
              </Text>
              <Text style={styles.voteCount}>{opt.voteCount}</Text>
            </View>
          </View>
        );
      })}

      {poll.options.length > 3 && (
        <Text style={styles.moreLabel}>
          + {poll.options.length - 3} lựa chọn khác
        </Text>
      )}

      <TouchableOpacity style={styles.btn} onPress={() => onOpenVote(poll)}>
        <Text style={styles.btnText}>
          {poll.isClosed ? "Xem kết quả" : "Bình chọn"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    width: 260,
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
  question: { fontSize: 15, fontWeight: "bold", color: "#1A1A1A" },
  subText: { fontSize: 11, color: "#8E8E93", marginBottom: 10 },
  track: {
    height: 34,
    backgroundColor: "#F2F2F7",
    borderRadius: 8,
    marginBottom: 6,
    overflow: "hidden",
    justifyContent: "center",
  },
  fill: { ...StyleSheet.absoluteFillObject, backgroundColor: "#E1F0FF" },
  optionInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 10,
  },
  optText: { fontSize: 13, color: "#333", flex: 1 },
  voteCount: {
    fontSize: 12,
    color: "#0084FF",
    fontWeight: "600",
    marginLeft: 4,
  },
  moreLabel: {
    fontSize: 11,
    color: "#8E8E93",
    textAlign: "center",
    marginVertical: 4,
  },
  btn: {
    borderTopWidth: 0.5,
    borderColor: "#EEE",
    marginTop: 8,
    paddingTop: 10,
    alignItems: "center",
  },
  btnText: { color: "#0084FF", fontWeight: "bold", fontSize: 14 },
});
