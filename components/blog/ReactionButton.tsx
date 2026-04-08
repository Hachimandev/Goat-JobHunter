import { ReactionType } from "@/types/enum";
import React, { useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { ThumbsUp, PartyPopper, Hand, Heart, Lightbulb, Smile } from 'lucide-react-native';

// Khai báo data icon khớp với Web
const reactionIcons: { [key in ReactionType]: React.ComponentType<any> } = {
  [ReactionType.LIKE]: ThumbsUp,
  [ReactionType.CELEBRATE]: PartyPopper,
  [ReactionType.SUPPORT]: Hand,
  [ReactionType.LOVE]: Heart,
  [ReactionType.INSIGHTFUL]: Lightbulb,
  [ReactionType.FUNNY]: Smile,
};

export const reactions = [
  { id: ReactionType.LIKE, color: "#1976d2" },
  { id: ReactionType.CELEBRATE, color: "#4caf50" },
  { id: ReactionType.SUPPORT, color: "#ff7043" },
  { id: ReactionType.LOVE, color: "#f44336" },
  { id: ReactionType.INSIGHTFUL, color: "#fbc02d" },
  { id: ReactionType.FUNNY, color: "#ffb300" },
];

export function ReactionButton({
  initialReaction,
  totalReactions,
  onReactionChange,
}: any) {
  const [showPicker, setShowPicker] = useState(false);

  // Tìm data của reaction hiện tại
  const current = reactions.find((r) => r.id === initialReaction);
  const CurrentIcon = initialReaction ? reactionIcons[initialReaction as ReactionType] : ThumbsUp;

  const handlePress = () => {
    onReactionChange(initialReaction ? null : ReactionType.LIKE);
  };

  return (
    <View>
      <TouchableOpacity
        activeOpacity={0.7}
        delayLongPress={300}
        onLongPress={() => setShowPicker(true)}
        onPress={handlePress}
        style={styles.btn}
      >
        <CurrentIcon
          size={22}
          color={current ? current.color : "#666"}
          fill={current ? current.color : "none"}
        />
        <Text style={[styles.txt, current && { color: current.color }]}>
          {totalReactions}
        </Text>
      </TouchableOpacity>

      <Modal visible={showPicker} transparent animationType="fade">
        <Pressable style={styles.overlay} onPress={() => setShowPicker(false)}>
          <View style={styles.picker}>
            {reactions.map((r) => {
              const ReactionIcon = reactionIcons[r.id];
              return (
                <TouchableOpacity
                  key={r.id}
                  onPress={() => {
                    onReactionChange(r.id);
                    setShowPicker(false);
                  }}
                  style={[styles.item, { backgroundColor: r.color }]}
                >
                  <ReactionIcon size={24} color="#fff" fill="#fff" />
                </TouchableOpacity>
              );
            })}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  btn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 5,
  },
  txt: { fontSize: 14, fontWeight: "600", color: "#666" },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  picker: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 40,
    gap: 10,
    elevation: 10,
    shadowOpacity: 0.2,
  },
  item: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
});
