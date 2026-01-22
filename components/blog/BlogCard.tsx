import { Blog } from "@/types/model";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import relativeTime from "dayjs/plugin/relativeTime";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/Feather";
import CommentSheet from "./CommentSheet";
import ReportTicketModal from "./ReportTicketModal";

dayjs.extend(relativeTime);
dayjs.locale("vi");

type BlogCardProps = {
  blog: Blog;
  onLike?: () => void;
  onSave?: () => void;
};

export default function BlogCard({ blog, onLike, onSave }: BlogCardProps) {
  const router = useRouter();
  const [isReportVisible, setReportVisible] = useState(false);
  const timeAgo = dayjs(blog.createdAt).fromNow();
  const [isCommentVisible, setCommentVisible] = useState(false);

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      style={styles.card}
      onPress={() => router.push(`/blog/${blog.blogId}`)}
    >
      <View style={styles.headerRow}>
        <View style={styles.userInfo}>
          <Image source={{ uri: blog.author?.avatar }} style={styles.avatar} />
          <View>
            <Text style={styles.authorName}>{blog.author?.fullName}</Text>
            <Text style={styles.timeText}>
              {dayjs(blog.createdAt).fromNow()}
            </Text>
          </View>
        </View>
        <View style={styles.headerIcons}>
          <TouchableOpacity onPress={onSave} style={styles.iconBtn}>
            <Icon name="bookmark" size={20} color="#666" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => setReportVisible(true)}
          >
            <Icon name="flag" size={20} color="#666" />
          </TouchableOpacity>
          <ReportTicketModal
            isVisible={isReportVisible}
            onClose={() => setReportVisible(false)}
            targetId={blog.blogId}
            targetType="blog"
          />
        </View>
      </View>

      <View style={styles.textContainer}>
        <Text style={styles.blogTitle}>
          {blog.content
            .replace(/<[^>]*>/g, "")
            .split(/\s+/)
            .slice(0, 10)
            .join(" ") + "..."}
        </Text>

        {blog.tags && blog.tags.length > 0 && (
          <View style={styles.tagWrapper}>
            {blog.tags.map((tag: string, index: number) => (
              <View key={index} style={styles.tagChip}>
                <Text style={styles.tagText}>#{tag}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {blog.images?.[0] && (
        <Image
          source={{ uri: blog.images[0] }}
          style={styles.blogImage}
          contentFit="cover"
        />
      )}

      <View style={styles.footerRow}>
        <View style={styles.leftStats}>
          <TouchableOpacity
            style={styles.statItem}
            onPress={(e) => {
              e.stopPropagation();
              onLike?.();
            }}
          >
            <Icon name="thumbs-up" size={18} color="#666" />
            <Text style={styles.statText}>
              {blog.activity?.totalLikes || 0}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.statItem}
            onPress={(e) => {
              e.stopPropagation();
              setCommentVisible(!isCommentVisible);
            }}
          >
            <Icon name="message-circle" size={18} color="#666" />
            <Text style={styles.statText}>
              {blog.activity?.totalComments || 0}
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.statItem}>
          <Icon name="eye" size={18} color="#666" />
          <Text style={styles.statText}>
            {blog.activity?.totalReads || 0} lượt xem
          </Text>
        </View>
      </View>
      <CommentSheet
        blogId={blog.blogId}
        isVisible={isCommentVisible}
        onClose={() => setCommentVisible(false)}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: "#fff", marginBottom: 10, paddingVertical: 12 },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  userInfo: { flexDirection: "row", alignItems: "center" },
  avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 10 },
  authorName: { fontSize: 15, fontWeight: "bold", color: "#1c1e21" },
  timeText: { fontSize: 12, color: "#65676b" },
  headerIcons: { flexDirection: "row" },
  iconBtn: { marginLeft: 15 },
  textContainer: { paddingHorizontal: 15, marginBottom: 10 },
  blogTitle: { fontSize: 16, color: "#050505", marginBottom: 8 },
  tagWrapper: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  tagChip: {
    backgroundColor: "#e7f3ff",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 15,
  },
  tagText: { color: "#1877f2", fontSize: 12, fontWeight: "500" },
  blogImage: { width: "100%", aspectRatio: 16 / 9, marginVertical: 5 },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingTop: 10,
    borderTopWidth: 0.5,
    borderTopColor: "#ddd",
  },
  leftStats: { flexDirection: "row", gap: 20 },
  statItem: { flexDirection: "row", alignItems: "center", gap: 5 },
  statText: { fontSize: 13, color: "#65676b" },
});
