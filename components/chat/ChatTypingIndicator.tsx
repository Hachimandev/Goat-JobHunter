import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";

import { TypingIndicatorParticipant } from "@/services/chatRoom/typing/typingIndicatorRuntime";

interface ChatTypingIndicatorProps {
  typingParticipants: TypingIndicatorParticipant[];
}

const getTypingText = (participants: TypingIndicatorParticipant[]) => {
  if (participants.length === 1) {
    return `${participants[0].username} đang soạn tin`;
  }

  if (participants.length === 2) {
    return `${participants[0].username}, ${participants[1].username} đang soạn tin`;
  }

  return `${participants[0].username} và ${participants.length - 1} người khác đang soạn tin`;
};

export function ChatTypingIndicator({
  typingParticipants,
}: ChatTypingIndicatorProps) {
  if (typingParticipants.length === 0) {
    return null;
  }

  const visibleParticipants = typingParticipants.slice(0, 2);

  return (
    <View style={styles.container}>
      <View style={styles.avatars}>
        {visibleParticipants.map((participant, index) => (
          <Image
            key={participant.accountId}
            source={{
              uri: participant.avatar || "https://via.placeholder.com/40",
            }}
            style={[styles.avatar, index > 0 && styles.avatarOverlap]}
          />
        ))}
      </View>
      <View style={styles.bubble}>
        <View style={styles.dots}>
          <View style={styles.dot} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>
        <Text numberOfLines={1} style={styles.text}>
          {getTypingText(typingParticipants)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 6,
    backgroundColor: "#fff",
  },
  avatars: {
    flexDirection: "row",
    width: 42,
    alignItems: "center",
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#fff",
    backgroundColor: "#e5e7eb",
  },
  avatarOverlap: {
    marginLeft: -8,
  },
  bubble: {
    flex: 1,
    minHeight: 30,
    borderRadius: 15,
    backgroundColor: "#F0F2F5",
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  dots: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 8,
    gap: 3,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: "#8E8E93",
  },
  text: {
    flex: 1,
    color: "#666",
    fontSize: 13,
    fontWeight: "500",
  },
});
