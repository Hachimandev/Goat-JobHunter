import BlogCard from "@/components/blog/BlogCard";
import { useFetchBlogsQuery } from "@/services/blog/blogApi";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// Categories list
const categories = [
  { key: "all", label: "Tất cả" },
  { key: "tim-viec", label: "Tìm việc" },
  { key: "phong-van", label: "Phỏng vấn" },
  { key: "cv-resume", label: "CV/Resume" },
  { key: "ky-nang-mem", label: "Kỹ năng mềm" },
  { key: "xu-huong-nghe-nghiep", label: "Xu hướng nghề nghiệp" },
];

export default function BlogPage() {
  const [page, setPage] = useState(0);
  const size = 10;
  const [blogs, setBlogs] = useState<any[]>([]);
  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const { data, isLoading, isFetching, refetch } = useFetchBlogsQuery(
    {
      page: page, // Bắt đầu từ 0 cho Spring Boot
      size: size,
      title: searchText || undefined,
      // Nếu chọn "Tất cả" thì không gửi tags, nếu chọn cụ thể thì gửi mảng chứa label đó
      tags:
        selectedCategory === "all"
          ? undefined
          : [categories.find((c) => c.key === selectedCategory)?.label || ""],
    },
    { skip: false }
  );

  // Merge dữ liệu khi page thay đổi
  useFocusEffect(
    useCallback(() => {
      // Log để xác nhận cấu trúc
      console.log("Danh sách bài viết nhận được:", data?.data?.result);

      // Sửa từ data.items thành data.data.result
      if (data?.data?.result) {
        if (page === 0) {
          setBlogs(data.data.result);
        } else {
          setBlogs((prev) => [...prev, ...data.data.result]);
        }
      }
    }, [data, page])
  );

  // Handle infinite scroll
  const handleLoadMore = () => {
    if (!isFetching && data?.data?.meta) {
      const { currentPage, totalPages } = data.data.meta;
      if (currentPage < totalPages) {
        setPage((prev) => prev + 1);
      }
    }
  };

  // Pull to refresh
  const handleRefresh = () => {
    setPage(0);
    refetch();
  };

  // Handle category change
  const handleCategoryPress = (key: string) => {
    setSelectedCategory(key);
    setPage(0);
  };

  // Render empty state
  const renderEmpty = () => {
    if (isLoading) return null;
    return (
      <View style={styles.empty}>
        <Text>Không có bài viết nào</Text>
      </View>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Header / Search */}
      <View style={styles.header}>
        <TextInput
          placeholder="Tìm kiếm bài viết..."
          value={searchText}
          onChangeText={setSearchText}
          style={styles.searchInput}
        />
      </View>

      {/* Categories */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryContainer}
      >
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat.key}
            style={[
              styles.categoryChip,
              selectedCategory === cat.key
                ? styles.categoryChipSelected
                : styles.categoryChipUnselected,
            ]}
            onPress={() => handleCategoryPress(cat.key)}
          >
            <Text
              style={
                selectedCategory === cat.key
                  ? styles.categoryTextSelected
                  : styles.categoryTextUnselected
              }
            >
              {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Blog List */}
      <FlatList
        data={blogs}
        keyExtractor={(item) => item.blogId.toString()}
        renderItem={({ item }) => (
          <BlogCard
            blog={item}
            onLike={() => {
              // TODO: handle like/unlike
            }}
            onSave={() => {
              // TODO: handle save/unsave
            }}
          />
        )}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl refreshing={isFetching} onRefresh={handleRefresh} />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          isFetching ? (
            <ActivityIndicator style={{ marginVertical: 16 }} />
          ) : null
        }
      />

      {/* Initial Loading */}
      {isLoading && page === 0 && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  /* ===== Header / Search ===== */
  header: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#ffffff",
  },
  searchInput: {
    backgroundColor: "#f3f4f6",
    borderRadius: 20,
    paddingHorizontal: 14,
    height: 40,
    fontSize: 14,
    color: "#111827",
  },

  /* ===== Categories ===== */
  categoryContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    height: 65,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    height: 40, // Ép chiều cao cố định
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
  },
  categoryChipSelected: {
    backgroundColor: "#2563eb", // primary color
    borderColor: "#2563eb",
  },
  categoryChipUnselected: {
    backgroundColor: "#ffffff",
    borderColor: "#d1d5db", // gray-300
  },
  categoryTextSelected: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 13,
  },
  categoryTextUnselected: {
    color: "#374151",
    fontWeight: "500",
    fontSize: 13,
  },

  /* ===== BlogCard ===== */
  card: {
    backgroundColor: "#ffffff",
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    overflow: "hidden",
    elevation: 2, // Android shadow
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
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
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
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  text: {
    fontSize: 14,
    lineHeight: 20,
    color: "#4b5563", // gray-700
    marginBottom: 8,
  },
  meta: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  author: {
    fontSize: 12,
    fontWeight: "600",
    color: "#111827",
  },
  dot: {
    marginHorizontal: 6,
    color: "#9ca3af",
    fontSize: 12,
  },
  time: {
    fontSize: 12,
    color: "#9ca3af",
  },
  stats: {
    flexDirection: "row",
    justifyContent: "flex-start",
    gap: 16,
  },
  stat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  /* ===== Loading / Empty ===== */
  loadingOverlay: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  empty: {
    marginTop: 50,
    justifyContent: "center",
    alignItems: "center",
  },
});
