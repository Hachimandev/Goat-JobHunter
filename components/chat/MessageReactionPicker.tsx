import React from "react";
import { Modal, View, TouchableOpacity, Text, StyleSheet } from "react-native";

const QUICK_REACTIONS = ["👍", "😂", "😮", "😢", "😡", "🎉", "🔥"];

interface Props {
  visible: boolean;
  onClose: () => void;
  onSelect: (emoji: string) => void;
}

export const MessageReactionPicker = ({
  visible,
  onClose,
  onSelect,
}: Props) => {
  return (
    <>
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={onClose}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={onClose}
        >
          <View style={styles.container}>
            <View style={styles.quickReactions}>
              {QUICK_REACTIONS.map((emoji) => (
                <TouchableOpacity
                  key={emoji}
                  style={styles.btn}
                  onPress={() => {
                    onSelect(emoji);
                    onClose();
                  }}
                >
                  <Text style={styles.emoji}>{emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "flex-end",
    paddingBottom: 100,
  },
  container: {
    marginHorizontal: 20,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 12,
  },
  quickReactions: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 4,
  },
  btn: {
    padding: 8,
  },
  emoji: {
    fontSize: 24,
  },
});
