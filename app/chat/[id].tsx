import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const CURRENT_USER = "me";

export default function ChatDetail() {
  const { name } = useLocalSearchParams<{ name: string }>();
  const [messages, setMessages] = useState([
    { id: "1", from: "Sơn Lưu", text: "hello" },
    { id: "2", from: "me", text: "Ok" },
  ]);
  const [text, setText] = useState("");

  const send = () => {
    if (!text.trim()) return;
    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), from: CURRENT_USER, text },
    ]);
    setText("");
  };
  const goBack = () => router.back();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        {/* left */}
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={goBack}>
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>{name}</Text>
            <Text style={styles.headerStatus}>Hoạt động 5 phút trước</Text>
          </View>
        </View>
        {/* right */}
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={() => console.log("Call")}>
            <Ionicons name="call-outline" size={22} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => console.log("Video call")}>
            <Ionicons name="videocam-outline" size={22} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: "/chat/detail",
                params: { name },
              })
            }
          >
            <Ionicons
              name="information-circle-outline"
              size={24}
              color="#fff"
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Messages */}
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 12 }}
        renderItem={({ item }) => {
          const isMe = item.from === CURRENT_USER;
          return (
            <View
              style={[
                styles.messageRow,
                { justifyContent: isMe ? "flex-end" : "flex-start" },
              ]}
            >
              <View
                style={[
                  styles.bubble,
                  isMe ? styles.myBubble : styles.otherBubble,
                ]}
              >
                <Text style={{ color: isMe ? "#fff" : "#000" }}>
                  {item.text}
                </Text>
              </View>
            </View>
          );
        }}
      />

      {/* Input */}
      <View style={styles.inputBar}>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Tin nhắn"
          style={styles.input}
        />
        <TouchableOpacity onPress={send} style={styles.sendBtn}>
          <Text style={{ color: "#fff" }}>➤</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F4F6",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#0084FF",
    height: 56,
    paddingHorizontal: 12,
  },
  back: {
    color: "#fff",
    fontSize: 20,
    marginRight: 12,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },

  messageRow: {
    marginVertical: 4,
    flexDirection: "row",
  },
  bubble: {
    padding: 10,
    borderRadius: 16,
    maxWidth: "75%",
  },
  myBubble: {
    backgroundColor: "#0084FF",
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    backgroundColor: "#E5E5EA",
    borderBottomLeftRadius: 4,
  },

  inputBar: {
    flexDirection: "row",
    padding: 8,
    backgroundColor: "#fff",
    alignItems: "center",
  },
  input: {
    flex: 1,
    backgroundColor: "#F1F1F1",
    borderRadius: 20,
    paddingHorizontal: 14,
  },
  sendBtn: {
    marginLeft: 8,
    backgroundColor: "#0084FF",
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerInfo: {
    marginLeft: 4,
  },

  headerActions: {
    flexDirection: "row",
    gap: 16,
  },
  headerStatus: {
    color: "#E0E0E0",
    fontSize: 12,
  },
});
