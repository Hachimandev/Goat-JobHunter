"use client";

import { ProfileHeader } from "@/app/(social-hub)/hub/profile/components/ProfileHeader";
import { ProfileInfo } from "@/app/(social-hub)/hub/profile/components/ProfileInfo";
import { useGetMyAccountQuery } from "@/services/auth/authApi";
import ErrorMessage from "@/components/common/ErrorMessage";
import LoaderSpin from "@/components/common/LoaderSpin";
import { SocialBlogCard } from "@/app/(social-hub)/hub/fyp/component/SocialBlogCard";
import { useInfiniteScrollMyBlogs } from "@/app/(social-hub)/hub/profile/hooks/useInfiniteScrollMyBlogs";

export default function ProfilePage() {
  useGetMyAccountQuery();

  const {
    blogs,
    isLoading,
    isError,
    isFetching,
    isSuccess,
    hasMore,
    savedBlogIds,
    reactedBlogIds,
    targetRef
  } = useInfiniteScrollMyBlogs();


  return (
    <div className="mx-auto max-w-4xl">
      <div className="bg-card rounded-xl border shadow-sm overflow-hidden p-4 mb-4">
        <ProfileHeader />
        <ProfileInfo />
      </div>

      {isError && <ErrorMessage message={"Có lỗi xảy ra khi tải bài viết. Vui lòng thử lại sau."} />}

      {isLoading && <LoaderSpin />}

      {isSuccess && (
        <>
          <div className="space-y-4">
            {blogs.map((blog) => (
              <SocialBlogCard
                key={blog.blogId} blog={blog}
                isSaved={savedBlogIds.find(b => b.blogId === blog.blogId)?.result || false}
                initialReaction={reactedBlogIds.find(b => b.blogId === blog.blogId)?.reactionType || null}
                owned={true}
              />
            ))}
          </div>

          {hasMore && (
            <div ref={targetRef} className="py-8 flex justify-center">
              {isFetching && <LoaderSpin />}
            </div>
          )}

          {!hasMore && blogs.length > 0 && (
            <p className="text-center text-muted-foreground py-8">
              Bạn đã xem hết tất cả bài viết
            </p>
          )}
        </>
      )}
    </div>
  );
}
