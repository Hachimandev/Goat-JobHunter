import dayjs from "dayjs";
import { Image } from "expo-image";
import { StyleSheet, Text, useWindowDimensions, View } from "react-native";
import RenderHtml from "react-native-render-html";

export default function BlogDetailContent({ blog }: any) {
  const { width } = useWindowDimensions();

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Image source={{ uri: blog?.author?.avatar }} style={styles.avatar} />
        <View style={{ flex: 1 }}>
          <Text style={styles.authorName}>{blog?.author?.fullName}</Text>
          <Text style={styles.time}>{dayjs(blog?.createdAt).fromNow()}</Text>
        </View>
      </View>

      <View style={styles.body}>
        <Text style={styles.title}>{blog?.title}</Text>
        <View style={styles.tagContainer}>
          {blog?.tags?.map((tag: string, i: number) => (
            <View key={i} style={styles.tagBadge}>
              <Text style={styles.tagText}>#{tag}</Text>
            </View>
          ))}
        </View>

        {blog?.images?.[0] && (
          <Image source={{ uri: blog.images[0] }} style={styles.mainImage} />
        )}

        <RenderHtml
          contentWidth={width - 32}
          source={{ html: blog?.content || "" }}
          tagsStyles={{ body: { fontSize: 16, lineHeight: 24 } }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: "#fff" },
  headerRow: { flexDirection: "row", alignItems: "center", padding: 16 },
  avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 12 },
  authorName: { fontWeight: "bold", fontSize: 15 },
  time: { color: "#666", fontSize: 12 },
  body: { paddingHorizontal: 16 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 10 },
  tagContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 15,
    gap: 8,
  },
  tagBadge: {
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tagText: { fontSize: 12, color: "#1976d2" },
  mainImage: {
    width: "100%",
    aspectRatio: 16 / 9,
    borderRadius: 12,
    marginBottom: 15,
  },
});
