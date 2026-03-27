import { useState, useCallback, useEffect, useMemo } from 'react';
import { useFetchAvailableBlogsQuery } from '@/services/blog/blogApi';
import { Blog } from '@/types/model';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { useCheckSavedBlogsQuery } from '@/services/user/savedBlogsApi';
import { useCheckReactBlogQuery } from '@/services/reaction/reactionApi';
import { useUser } from '@/hooks/useUser';

const PAGE_SIZE = 15;

export function useInfiniteScrollBlogs() {
  const { isSignedIn } = useUser();
  const [page, setPage] = useState(1);
  const [allBlogs, setAllBlogs] = useState<Blog[]>([]);
  const [hasMore, setHasMore] = useState(true);

  const { data, isLoading, isError, isFetching, isSuccess } = useFetchAvailableBlogsQuery({
    page,
    size: PAGE_SIZE,
  });

  // Update blogs when new data arrives
  useEffect(() => {
    if (isSuccess && data?.data?.result) {
      const newBlogs = data.data.result;

      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAllBlogs((prev) => {
        // Avoid duplicates
        const existingIds = new Set(prev.map((blog) => blog.blogId));
        const uniqueNewBlogs = newBlogs.filter((blog) => !existingIds.has(blog.blogId));
        return page === 1 ? newBlogs : [...prev, ...uniqueNewBlogs];
      });

      // Check if there are more blogs to load
      const totalPages = data.data.meta.pages || 1;
      setHasMore(page < totalPages);
    }
  }, [data, isSuccess, page]);

  const loadMore = useCallback(() => {
    if (!isFetching && hasMore) {
      setPage((prev) => prev + 1);
    }
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

  const blogIds = useMemo(() => allBlogs.map((blog) => blog.blogId), [allBlogs]);
  const shouldCheckBlogStates = isSignedIn && blogIds.length > 0;

  const { data: savedBlogData } = useCheckSavedBlogsQuery(
    {
      blogIds,
    },
    {
      skip: !shouldCheckBlogStates,
    },
  );

  const savedBlogIds = useMemo(() => savedBlogData?.data || [], [savedBlogData]);

  const { data: reactedBlogData } = useCheckReactBlogQuery(
    {
      blogIds,
    },
    {
      skip: !shouldCheckBlogStates,
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
