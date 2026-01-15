import { Blog } from "@/types/model";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Bookmark, Eye, Heart, MessageCircle } from "lucide-react-native";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type BlogCardProps = {
  blog: Blog;
  onLike?: () => void;
  onSave?: () => void;
};

export default function BlogCard({ blog, onLike, onSave }: BlogCardProps) {
  const router = useRouter();

  const timeAgo = formatDistanceToNow(new Date(blog.createdAt), {
    addSuffix: true,
    locale: vi,
  });

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      style={styles.card}
      //   onPress={() => router.push(`/blogs/${blog.blogId}`)}
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
            <Bookmark size={18} />
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
            <Eye size={14} />
            <Text>{blog.activity?.totalReads ?? 0}</Text>
          </View>

          <TouchableOpacity
            style={styles.stat}
            onPress={(e) => {
              e.stopPropagation();
              onLike?.();
            }}
          >
            <Heart size={14} />
            <Text>{blog.activity?.totalLikes ?? 0}</Text>
          </TouchableOpacity>

          <View style={styles.stat}>
            <MessageCircle size={14} />
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
    elevation: 2, // Android shadow
  },

  /* ===== Image ===== */
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

  /* ===== Content ===== */
  content: {
    padding: 12,
  },

  text: {
    fontSize: 14,
    lineHeight: 20,
    color: "#374151",
    marginBottom: 8,
  },

  /* ===== Meta ===== */
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

  /* ===== Stats ===== */
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
