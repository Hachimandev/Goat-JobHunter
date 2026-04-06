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
import MaterialIcon from "react-native-vector-icons/MaterialCommunityIcons";

// Khai báo data icon khớp với Web
export const reactions = [
  { id: ReactionType.LIKE, icon: "thumb-up", color: "#1976d2" },
  { id: ReactionType.CELEBRATE, icon: "party-popper", color: "#4caf50" },
  { id: ReactionType.SUPPORT, icon: "hand-heart", color: "#ff7043" },
  { id: ReactionType.LOVE, icon: "heart", color: "#f44336" },
  { id: ReactionType.INSIGHTFUL, icon: "lightbulb-outline", color: "#fbc02d" },
  { id: ReactionType.FUNNY, icon: "emoticon-happy-outline", color: "#ffb300" },
];

export function ReactionButton({
  initialReaction,
  totalReactions,
  onReactionChange,
}: any) {
  const [showPicker, setShowPicker] = useState(false);

  // Tìm data của reaction hiện tại
  const current = reactions.find((r) => r.id === initialReaction);

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
        <MaterialIcon
          name={current ? current.icon : "thumb-up-outline"}
          size={22}
          color={current ? current.color : "#666"}
        />
        <Text style={[styles.txt, current && { color: current.color }]}>
          {totalReactions}
        </Text>
      </TouchableOpacity>

      <Modal visible={showPicker} transparent animationType="fade">
        <Pressable style={styles.overlay} onPress={() => setShowPicker(false)}>
          <View style={styles.picker}>
            {reactions.map((r) => (
              <TouchableOpacity
                key={r.id}
                onPress={() => {
                  onReactionChange(r.id);
                  setShowPicker(false);
                }}
                style={[styles.item, { backgroundColor: r.color }]}
              >
                <MaterialIcon name={r.icon} size={24} color="#fff" />
              </TouchableOpacity>
            ))}
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
