import dayjs from "dayjs";
import { Image } from "expo-image";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import RenderHtml from "react-native-render-html";

export default function BlogDetailContent({ blog }: { blog: any }) {
  const { width } = useWindowDimensions();

  // Style cho các thẻ HTML
  const tagsStyles = {
    body: { color: "#1a1a1a", fontSize: 16, lineHeight: 24 },
    p: { marginBottom: 12 },
    h2: {
      fontSize: 20,
      fontWeight: "bold" as const,
      marginTop: 15,
      marginBottom: 8,
    },
    img: { borderRadius: 12, marginVertical: 10 },
    code: {
      backgroundColor: "#f0f0f0",
      padding: 4,
      borderRadius: 4,
      fontFamily: "monospace",
    },
  };

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: blog?.images?.[0] }}
        style={styles.heroImage}
        contentFit="cover"
      />

      <View style={styles.paddingBox}>
        <Text style={styles.title}>{blog?.title}</Text>

        <View style={styles.authorRow}>
          <Image source={{ uri: blog?.author?.avatar }} style={styles.avatar} />
          <View>
            <Text style={styles.authorName}>{blog?.author?.fullName}</Text>
            <Text style={styles.subText}>
              {dayjs(blog?.createdAt).format("DD/MM/YYYY")} • 5 phút đọc
            </Text>
          </View>
        </View>

        {/* Tags horizontal scroll */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tagScroll}
        >
          {blog?.tags?.map((tag: string, index: number) => (
            <View key={index} style={styles.tagChip}>
              <Text style={styles.tagText}>#{tag}</Text>
            </View>
          ))}
        </ScrollView>

        <RenderHtml
          contentWidth={width - 32}
          source={{ html: blog?.content || "" }}
          tagsStyles={tagsStyles}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: "#fff" },
  heroImage: { width: "100%", aspectRatio: 16 / 9 },
  paddingBox: { padding: 16 },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 16,
    lineHeight: 32,
  },
  authorRow: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  avatar: { width: 42, height: 42, borderRadius: 21, marginRight: 12 },
  authorName: { fontSize: 15, fontWeight: "600" },
  subText: { fontSize: 12, color: "#666", marginTop: 2 },
  tagScroll: { marginBottom: 20 },
  tagChip: {
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
  },
  tagText: { fontSize: 13, color: "#2563eb" },
});
