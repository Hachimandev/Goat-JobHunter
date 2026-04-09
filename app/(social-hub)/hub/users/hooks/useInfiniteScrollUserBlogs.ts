import { useState, useCallback, useEffect, useMemo } from 'react';
import { useFetchBlogsByAuthorQuery } from '@/services/blog/blogApi';
import { Blog } from '@/types/model';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { useCheckSavedBlogsQuery } from '@/services/user/savedBlogsApi';
import { useCheckReactBlogQuery } from '@/services/reaction/reactionApi';
import { useUser } from '@/hooks/useUser';
import { DEFAULT_BLOG_PAGE_SIZE } from '@/constants/constant';

type UseInfiniteScrollUserBlogsOptions = {
  enabled?: boolean;
};

export function useInfiniteScrollUserBlogs(accountId: number, options?: UseInfiniteScrollUserBlogsOptions) {
  const { isSignedIn } = useUser();
  const [page, setPage] = useState(1);
  const [allBlogs, setAllBlogs] = useState<Blog[]>([]);
  const [hasMore, setHasMore] = useState(true);

  const isQueryEnabled = options?.enabled ?? true;
  const shouldFetchBlogs = isQueryEnabled && Number.isFinite(accountId) && accountId > 0;

  const { data, isLoading, isError, isFetching, isSuccess } = useFetchBlogsByAuthorQuery(
    {
      page,
      size: DEFAULT_BLOG_PAGE_SIZE,
      authorId: accountId,
      draft: false,
      enabled: true,
    },
    {
      skip: !shouldFetchBlogs,
    },
  );

  useEffect(() => {
    if (isSuccess && data?.data?.result) {
      const newBlogs = data.data.result;

      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAllBlogs((prev) => {
        const existingIds = new Set(prev.map((b) => b.blogId));
        const uniqueNew = newBlogs.filter((b) => !existingIds.has(b.blogId));
        return page === 1 ? newBlogs : [...prev, ...uniqueNew];
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

  const blogIds = useMemo(() => allBlogs.map((blog) => blog.blogId), [allBlogs]);
  const shouldCheckBlogStates = isQueryEnabled && isSignedIn && blogIds.length > 0;

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
