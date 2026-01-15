import BlogDetailContent from "@/components/blog/BlogDetailContent";
import CommentItem from "@/components/blog/CommentItem";
import {
  useFetchBlogByIdQuery,
  useGetCommentsByBlogIdQuery,
} from "@/services/blog/blogApi";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

export default function BlogDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { data: blogData } = useFetchBlogByIdQuery(Number(id));
  const { data: commentData } = useGetCommentsByBlogIdQuery(Number(id));

  const blog = blogData?.data;
  const comments = commentData?.data || [];

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* Custom Header Sticky */}
      <View style={styles.headerSticky}>
        <TouchableOpacity onPress={() => router.back()}>
          <Icon name="chevron-left" size={30} color="#000" />
        </TouchableOpacity>
        <Text numberOfLines={1} style={styles.headerTitle}>
          {blog?.title}
        </Text>
        <Icon name="share-variant-outline" size={24} color="#000" />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <FlatList
          data={comments}
          keyExtractor={(item: any) =>
            item.id?.toString() || Math.random().toString()
          }
          ListHeaderComponent={<BlogDetailContent blog={blog} />}
          renderItem={({ item }) => <CommentItem comment={item} />}
          ListFooterComponent={<View style={{ height: 100 }} />}
          showsVerticalScrollIndicator={false}
        />

        {/* Action Bar Bottom */}
        <View style={styles.bottomBar}>
          <TextInput
            placeholder="Viết bình luận..."
            style={styles.input}
            placeholderTextColor="#888"
          />
          <View style={styles.iconGroup}>
            <View style={styles.statIcon}>
              <Icon name="heart-outline" size={24} color="#444" />
              <Text style={styles.statCount}>
                {blog?.activity?.totalLikes || 0}
              </Text>
            </View>
            <View style={styles.statIcon}>
              <Icon name="comment-outline" size={24} color="#444" />
              <Text style={styles.statCount}>
                {blog?.activity?.totalComments || 0}
              </Text>
            </View>
            <Icon name="bookmark-outline" size={24} color="#444" />
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  headerSticky: {
    height: 50,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    justifyContent: "space-between",
  },
  headerTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    marginHorizontal: 10,
  },
  bottomBar: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    backgroundColor: "#fff",
  },
  input: {
    flex: 1,
    backgroundColor: "#f0f2f5",
    borderRadius: 20,
    paddingHorizontal: 15,
    height: 38,
  },
  iconGroup: {
    flexDirection: "row",
    marginLeft: 12,
    gap: 15,
    alignItems: "center",
  },
  statIcon: { alignItems: "center", flexDirection: "row" },
  statCount: { fontSize: 12, marginLeft: 2, color: "#666" },
});
