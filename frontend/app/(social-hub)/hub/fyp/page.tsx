'use client';

import { SocialBlogCard } from '@/app/(social-hub)/hub/fyp/component/SocialBlogCard';
import { CreateBlogTrigger } from '@/app/(social-hub)/hub/fyp/component/CreateBlogTrigger';
import { Separator } from '@/components/ui/separator';
import ErrorMessage from '@/components/common/ErrorMessage';
import LoaderSpin from '@/components/common/LoaderSpin';
import { useInfiniteScrollBlogs } from '@/app/(social-hub)/hub/fyp/hooks/useInfiniteScrollBlogs';
import { BlogDetailDialog } from '@/app/(social-hub)/hub/fyp/component/BlogDetailDialog';

export default function FypPage() {
  const { blogs, isLoading, isError, isFetching, isSuccess, hasMore, savedBlogIds, reactedBlogIds, targetRef } =
    useInfiniteScrollBlogs();

  return (
    <>
      <div className="mx-auto max-w-4xl">
        <div className="mb-6">
          <h1 className="mb-6 text-4xl font-bold text-balance">
            Welcome to <span className="bg-linear-to-r bg-primary uppercase bg-clip-text text-transparent">Goat!</span>
          </h1>
        </div>

        <CreateBlogTrigger />

        <Separator className="my-4" />

        {isError && <ErrorMessage message={'Có lỗi xảy ra khi tải bài viết. Vui lòng thử lại sau.'} />}

        {isLoading && <LoaderSpin />}

        {isSuccess && (
          <>
            <div className="space-y-4">
              {blogs.map((blog) => (
                <SocialBlogCard
                  key={blog.blogId}
                  blog={blog}
                  isSaved={savedBlogIds.find((b) => b.blogId === blog.blogId)?.result || false}
                  initialReaction={reactedBlogIds.find((b) => b.blogId === blog.blogId)?.reactionType || null}
                />
              ))}
            </div>

            {hasMore && (
              <div ref={targetRef} className="py-8 flex justify-center">
                {isFetching && <LoaderSpin />}
              </div>
            )}

            {!hasMore && blogs.length > 0 && (
              <p className="text-center text-muted-foreground py-8">Bạn đã xem hết tất cả bài viết</p>
            )}
          </>
        )}
      </div>
      <BlogDetailDialog />
    </>
  );
}
