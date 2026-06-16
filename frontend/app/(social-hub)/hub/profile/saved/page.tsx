"use client";

import React, { useState } from "react";
import { useGetSavedBlogsQuery } from "@/services/user/savedBlogsApi";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Loader2 } from "lucide-react";
import SavedBlogCard from "@/app/(social-hub)/hub/profile/saved/components/SavedBlogCard";

type SortType = "newest" | "oldest";

const SavedBlogsPage = () => {
  const [sortType, setSortType] = useState<SortType>("newest");
  const { data, isLoading } = useGetSavedBlogsQuery();

  console.log(data);

  const sortedBlogs = React.useMemo(() => {
    if (!data?.data?.result) return [];

    const blogs = [...data.data.result];
    return blogs.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortType === "newest" ? dateB - dateA : dateA - dateB;
    });
  }, [data, sortType]);

  const toggleSort = () => {
    setSortType((prev) => (prev === "newest" ? "oldest" : "newest"));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Bài viết đã lưu</h1>
        <Button
          variant="outline"
          size="sm"
          onClick={toggleSort}
          className="flex items-center gap-2 rounded-xl"
        >
          <ArrowUpDown className="h-4 w-4" />
          {sortType === "newest" ? "Mới nhất" : "Cũ nhất"}
        </Button>
      </div>

      {sortedBlogs.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          Chưa có bài viết nào được lưu
        </div>
      ) : (
        <div className="grid gap-4">
          {sortedBlogs.map((blog) => (
            <SavedBlogCard key={blog.blogId} blog={blog} />
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedBlogsPage;