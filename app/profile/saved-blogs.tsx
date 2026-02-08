import BlogCard from "@/components/blog/BlogCard";
import { useGetSavedBlogsQuery } from "@/services/user/savedBlogsApi";
import { useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/Feather";
export default function SavedBlogsScreen() {
  const router = useRouter();
  const { data, isLoading, refetch } = useGetSavedBlogsQuery();

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1976d2" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Icon name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bài viết đã lưu</Text>
        <View style={{ width: 24 }} />{" "}
      </View>

      <FlatList
        data={data?.data?.result || []}
        keyExtractor={(item) => item.blogId.toString()}
        renderItem={({ item }) => <BlogCard blog={item} isSaved={true} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Chưa có bài viết nào được lưu</Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
        refreshing={isLoading}
        onRefresh={refetch}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f0f2f5" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  backButton: {
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
    flex: 1,
  },
  listContent: {
    paddingBottom: 20,
  },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyContainer: { padding: 50, alignItems: "center" },
  emptyText: { color: "#666", fontSize: 16 },
});
