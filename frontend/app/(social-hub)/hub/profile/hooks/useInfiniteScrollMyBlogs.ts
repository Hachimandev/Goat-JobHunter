import { useState, useCallback, useEffect, useMemo } from 'react';
import { useFetchBlogsByCurrentUserQuery } from '@/services/blog/blogApi';
import { Blog } from '@/types/model';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { useCheckSavedBlogsQuery } from '@/services/user/savedBlogsApi';
import { useCheckReactBlogQuery } from '@/services/reaction/reactionApi';
import { useUser } from '@/hooks/useUser';
import { DEFAULT_BLOG_PAGE_SIZE } from '@/constants/constant';

export function useInfiniteScrollMyBlogs() {
  const { isSignedIn } = useUser();
  const [page, setPage] = useState(1);
  const [allBlogs, setAllBlogs] = useState<Blog[]>([]);
  const [hasMore, setHasMore] = useState(true);

  const { data, isLoading, isError, isFetching, isSuccess } = useFetchBlogsByCurrentUserQuery({
    page,
    size: DEFAULT_BLOG_PAGE_SIZE,
  });

  useEffect(() => {
    if (isSuccess && data?.data?.result) {
      const newBlogs = data.data.result;

      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAllBlogs((prev) => {
        const existingIds = new Set(prev.map((b) => b.blogId));
        const uniqueNew = newBlogs.filter((b) => !existingIds.has(b.blogId));
        return page === 1 ? uniqueNew : [...prev, ...uniqueNew];
      });

      const totalPages = data.data.meta.pages || 1;
      setHasMore(page < totalPages);
    }
  }, [data, isSuccess, page]);

  const loadMore = useCallback(() => {
    if (!isFetching && hasMore) setPage((prev) => prev + 1);
  }, [isFetching, hasMore]);

  const { targetRef } = useInfiniteScroll({
    onLoadMore: loadMore,
    hasMore,
    isLoading: isFetching,
    rootMargin: '200px',
  });

  const reset = useCallback(() => {
    setPage(1);
    setAllBlogs([]);
    setHasMore(true);
  }, []);

  const { data: savedBlogData } = useCheckSavedBlogsQuery(
    {
      blogIds: allBlogs.map((blog) => blog.blogId),
    },
    {
      skip: !isSignedIn || allBlogs.length === 0,
    },
  );

  const savedBlogIds = useMemo(() => savedBlogData?.data || [], [savedBlogData]);

  const { data: reactedBlogData } = useCheckReactBlogQuery(
    {
      blogIds: allBlogs.map((blog) => blog.blogId),
    },
    {
      skip: !isSignedIn || allBlogs.length === 0,
    },
  );

  const reactedBlogIds = useMemo(() => reactedBlogData?.data || [], [reactedBlogData]);

  return {
    blogs: allBlogs,
    isLoading: isLoading && page === 1,
    isError,
    isFetching,
    isSuccess,
    hasMore,
    savedBlogIds,
    reactedBlogIds,
    targetRef,
    reset,
  };
}
