import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface ChatHeaderProps {
  name: string;
  status?: string;
}

export const ChatHeader = ({
  name,
  status = "Đang hoạt động",
}: ChatHeaderProps) => {
  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
        <Ionicons name="chevron-back" size={28} color="#fff" />
      </TouchableOpacity>

      <View style={styles.headerInfo}>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {name}
        </Text>
        <Text style={styles.headerStatus}>{status}</Text>
      </View>

      <TouchableOpacity style={styles.headerBtn}>
        <Ionicons name="call-outline" size={24} color="#fff" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.headerBtn}>
        <Ionicons name="information-circle-outline" size={26} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0084FF",
    height: 60,
    paddingHorizontal: 10,
  },
  headerBtn: { padding: 5, marginLeft: 5 },
  headerInfo: { flex: 1, marginLeft: 10 },
  headerTitle: { color: "#fff", fontSize: 17, fontWeight: "bold" },
  headerStatus: { color: "#E0E0E0", fontSize: 11 },
});
