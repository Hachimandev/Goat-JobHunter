import { Blog } from "@/types/model";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import relativeTime from "dayjs/plugin/relativeTime";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/Feather";

dayjs.extend(relativeTime);
dayjs.locale("vi");

type BlogCardProps = {
  blog: Blog;
  onLike?: () => void;
  onSave?: () => void;
};

export default function BlogCard({ blog, onLike, onSave }: BlogCardProps) {
  const router = useRouter();

  const timeAgo = dayjs(blog.createdAt).fromNow(); // <- dayjs thay thế formatDistanceToNow

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      style={styles.card}
      // onPress={() => router.push(`/blogs/${blog.blogId}`)}
    >
      {/* Thumbnail */}
      {blog.images?.[0] && (
        <View style={styles.imageWrapper}>
          <Image source={{ uri: blog.images[0] }} style={styles.image} />

          <TouchableOpacity
            style={styles.bookmark}
            onPress={(e) => {
              e.stopPropagation();
              onSave?.();
            }}
          >
            <Icon name="bookmark" size={18} color="#000" />
          </TouchableOpacity>
        </View>
      )}

      {/* Content */}
      <View style={styles.content}>
        <Text numberOfLines={3} style={styles.text}>
          {blog.content.replace(/<[^>]*>/g, "")}
        </Text>

        <View style={styles.meta}>
          <Text style={styles.author}>{blog.author.fullName}</Text>
          <Text style={styles.dot}>•</Text>
          <Text style={styles.time}>{timeAgo}</Text>
        </View>

        <View style={styles.stats}>
          <View style={styles.stat}>
            <Icon name="eye" size={14} color="#000" />
            <Text>{blog.activity?.totalReads ?? 0}</Text>
          </View>

          <TouchableOpacity
            style={styles.stat}
            onPress={(e) => {
              e.stopPropagation();
              onLike?.();
            }}
          >
            <Icon name="heart" size={14} color="#000" />
            <Text>{blog.activity?.totalLikes ?? 0}</Text>
          </TouchableOpacity>

          <View style={styles.stat}>
            <Icon name="message-circle" size={14} color="#000" />
            <Text>{blog.activity?.totalComments ?? 0}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    marginHorizontal: 16,
    marginVertical: 10,
    borderRadius: 12,
    overflow: "hidden",
    elevation: 2,
  },

  imageWrapper: {
    width: "100%",
    aspectRatio: 16 / 9,
    position: "relative",
    backgroundColor: "#f3f4f6",
  },

  image: {
    width: "100%",
    height: "100%",
  },

  bookmark: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#ffffff",
    padding: 6,
    borderRadius: 999,
    elevation: 3,
  },

  content: {
    padding: 12,
  },

  text: {
    fontSize: 14,
    lineHeight: 20,
    color: "#374151",
    marginBottom: 8,
  },

  meta: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  author: {
    fontSize: 12,
    fontWeight: "600",
    color: "#111827",
  },

  dot: {
    marginHorizontal: 6,
    color: "#9ca3af",
  },

  time: {
    fontSize: 12,
    color: "#9ca3af",
  },

  stats: {
    flexDirection: "row",
    gap: 16,
  },

  stat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
});
