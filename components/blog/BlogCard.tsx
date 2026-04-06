import useBlogActionsMobile from "@/hooks/useBlogActions";
import { Blog } from "@/types/model";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import relativeTime from "dayjs/plugin/relativeTime";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/Feather";
import BlogActivity from "./BlogActivity";
import CommentSheet from "./CommentSheet";
import ReportTicketModal from "./ReportTicketModal";

dayjs.extend(relativeTime);
dayjs.locale("vi");

type BlogCardProps = {
  blog: Blog;
  onLike?: () => void;
  isSaved?: boolean;
};

export default function BlogCard({
  blog,
  onLike,
  isSaved: initialIsSaved,
}: BlogCardProps) {
  const router = useRouter();
  const [isReportVisible, setReportVisible] = useState(false);
  const timeAgo = dayjs(blog.createdAt).fromNow();
  const [isCommentVisible, setCommentVisible] = useState(false);

  const { handleToggleSaveBlog, isSaving } = useBlogActionsMobile();
  const [isSaved, setIsSaved] = useState(initialIsSaved);
  const [isExpanded, setIsExpanded] = useState(false);

  const onSavePress = async () => {
    const currentSavedStatus = !!isSaved;
    const newSavedStatus = !currentSavedStatus;

    setIsSaved(newSavedStatus);

    try {
      await handleToggleSaveBlog(blog.blogId, currentSavedStatus);
    } catch (err) {
      setIsSaved(currentSavedStatus);
    }
  };

  const plainText = blog.content.replace(/<[^>]*>/g, "").trim();
  const words = plainText.split(/\s+/);
  const wordCount = words.length;

  const SHORT_LIMIT = 65;
  const LONG_LIMIT = 120;

  const handleReadMore = () => {
    if (wordCount > LONG_LIMIT) {
      router.push(`/blog/${blog.blogId}`);
    } else {
      setIsExpanded(true);
    }
  };

  let displayText = plainText;
  if (!isExpanded && wordCount > SHORT_LIMIT) {
    displayText = words.slice(0, SHORT_LIMIT).join(" ") + "...";
  }

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
          <TouchableOpacity
            onPress={onSavePress}
            style={styles.iconBtn}
            disabled={isSaving}
          >
            <Icon
              name="bookmark"
              size={20}
              color={isSaved ? "#1976d2" : "#666"}
            />
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
        <Text style={styles.blogTitle}>{displayText}</Text>

        {!isExpanded && wordCount > SHORT_LIMIT && (
          <TouchableOpacity onPress={handleReadMore} style={styles.readMoreBtn}>
            <Text style={styles.readMoreText}>Xem Thêm</Text>
          </TouchableOpacity>
        )}

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
      <BlogActivity
        blog={blog}
        initialReaction={blog.userReaction}
        onCommentClick={() => setCommentVisible(true)}
      />

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
  readMoreBtn: {
    paddingVertical: 4,
    marginTop: 2,
    marginBottom: 15,
  },
  readMoreText: {
    color: "#00a651",
    fontWeight: "bold",
    fontSize: 15,
  },
});
