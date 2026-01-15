import BlogCard from "@/components/blog/BlogCard";
import { useGetBlogsQuery } from "@/services/blog/blogApi";
import { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  View,
} from "react-native";

export default function BlogPage() {
  const [page, setPage] = useState(0);
  const size = 10;

  const { data, isLoading, isFetching, refetch } = useGetBlogsQuery({
    page,
    size,
  });

  const blogs = data?.items ?? [];

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <FlatList
      data={blogs}
      keyExtractor={(item) => item.blogId.toString()}
      renderItem={({ item }) => (
        <BlogCard
          blog={item}
          onLike={() => {
            // TODO: hook like
          }}
          onSave={() => {
            // TODO: hook save
          }}
        />
      )}
      refreshControl={
        <RefreshControl refreshing={isFetching} onRefresh={refetch} />
      }
      onEndReached={() => {
        if (!isFetching && data && page + 1 < data.totalPages) {
          setPage((prev) => prev + 1);
        }
      }}
      onEndReachedThreshold={0.5}
      ListFooterComponent={
        isFetching ? <ActivityIndicator style={{ marginVertical: 16 }} /> : null
      }
    />
  );
}
