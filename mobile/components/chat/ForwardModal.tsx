import { useFetchChatRoomsQuery } from "@/services/chatRoom/chatRoomApi";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  FlatList,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface ForwardModalProps {
  visible: boolean;
  onClose: () => void;
  // Hàm này sẽ được gọi khi người dùng nhấn vào một phòng chat
  onForwardSelect: (targetRoomId: number) => void;
}

export const ForwardModal = ({
  visible,
  onClose,
  onForwardSelect,
}: ForwardModalProps) => {
  const { data: roomsRes } = useFetchChatRoomsQuery({ page: 1, size: 20 });
  const chatRooms = roomsRes?.data?.result || [];

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Chuyển tiếp tới</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={26} color="#000" />
            </TouchableOpacity>
          </View>

          <FlatList
            data={chatRooms}
            keyExtractor={(item) => item.roomId.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.roomItem}
                onPress={() => onForwardSelect(item.roomId)} // Gọi hàm từ file cha
              >
                <Image
                  source={{
                    uri: item.avatar || "https://via.placeholder.com/100",
                  }}
                  style={styles.avatar}
                />
                <Text style={styles.roomName}>{item.name}</Text>
                <Ionicons
                  name="paper-plane-outline"
                  size={20}
                  color="#0084FF"
                />
              </TouchableOpacity>
            )}
          />
        </View>
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
  content: {
    backgroundColor: "#fff",
    height: "70%",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  title: { fontSize: 18, fontWeight: "bold" },
  roomItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: "#EEE",
  },
  avatar: { width: 45, height: 45, borderRadius: 22.5, marginRight: 15 },
  roomName: { flex: 1, fontSize: 16 },
});
