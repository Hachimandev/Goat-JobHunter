import BlogDetailContent from "@/components/blog/BlogDetailContent";
import CommentInput from "@/components/blog/CommentInput";
import CommentSection from "@/components/blog/CommentSection";
import { useUser } from "@/hooks/useUser";
import {
  useFetchBlogByIdQuery,
  useGetCommentsByBlogIdQuery,
} from "@/services/blog/blogApi";
import { formatComments } from "@/utils/formatComments";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Icon } from "react-native-paper";

export default function BlogDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { isSignedIn } = useUser();
  const { data: blogData } = useFetchBlogByIdQuery(Number(id));
  const {
    data: commentData,
    isLoading: isLoadingComments,
    isError,
  } = useGetCommentsByBlogIdQuery(Number(id));

  const blog = blogData?.data;
  const nestedComments = useMemo(
    () => formatComments(commentData?.data || []),
    [commentData],
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerSticky}>
        <TouchableOpacity onPress={() => router.back()}>
          <Icon source="chevron-left" size={30} color="#000" />
        </TouchableOpacity>
        <Text numberOfLines={1} style={styles.headerTitle}>
          {blog?.content
            .replace(/<[^>]*>/g, "")
            .split(/\s+/)
            .slice(0, 2)
            .join(" ") + "..."}
        </Text>
        <Icon source="share-variant-outline" size={24} color="#000" />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <FlatList
          data={[1]}
          keyExtractor={(item) => item.toString()}
          renderItem={() => (
            <View>
              <BlogDetailContent blog={blog} />
              <CommentSection
                comments={nestedComments}
                blogId={Number(id)}
                isLoading={isLoadingComments}
                isError={isError}
              />
            </View>
          )}
          ListFooterComponent={<View style={{ height: 50 }} />}
          showsVerticalScrollIndicator={false}
        />

        {isSignedIn ? (
          <View style={styles.bottomBar}>
            <CommentInput blogId={Number(id)} />
          </View>
        ) : (
          <TouchableOpacity
            style={styles.loginPrompt}
            onPress={() => router.push("/signin")}
          >
            <Text style={styles.loginPromptText}>
              Đăng nhập để để lại bình luận
            </Text>
          </TouchableOpacity>
        )}
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  headerSticky: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
    zIndex: 10,
  },
  headerTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    marginHorizontal: 10,
  },
  bottomBar: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    backgroundColor: "#fff",
  },
  loginPrompt: {
    padding: 15,
    backgroundColor: "#f0f2f5",
    alignItems: "center",
    justifyContent: "center",
  },
  loginPromptText: {
    color: "#1976d2",
    fontWeight: "600",
  },
});
