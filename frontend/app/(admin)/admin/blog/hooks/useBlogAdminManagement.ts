import { useFetchBlogsQuery } from '@/services/blog/blogApi';
import { useEffect, useMemo, useState } from 'react';

export interface AdminBlogFilters {
  content?: string;
  enabled?: boolean | null; // null = all, true = enabled, false = disabled
}

interface UseBlogAdminManagementProps {
  initialPage?: number;
  initialSize?: number;
}

export const useBlogAdminManagement = ({ initialPage = 1, initialSize = 10 }: UseBlogAdminManagementProps) => {
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [filters, setFilters] = useState<AdminBlogFilters>({
    content: '',
    enabled: null,
  });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPage(initialPage);
    setSize(initialSize);
  }, [initialPage, initialSize]);

  const queryParams = useMemo(() => {
    const params: Record<string, string | number | string[] | boolean> = {
      page,
      size,
    };

    if (filters.content) params.content = filters.content;
    if (filters.enabled != undefined) params.enabled = filters.enabled;

    return params;
  }, [page, size, filters]);

  const { data, isLoading, isFetching, isError, error } = useFetchBlogsQuery(queryParams);

  const blogs = data?.data?.result || [];
  const meta = data?.data?.meta || {
    current: 1,
    pageSize: 10,
    pages: 0,
    total: 0,
  };

  const handleSizeChange = (newSize: number) => {
    setSize(newSize);
    setPage(1);
  };

  const handleFilterChange = (newFilters: Partial<AdminBlogFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setPage(1);
  };

  const resetFilters = () => {
    setFilters({
      content: '',
      enabled: null,
    });
    setPage(1);
  };

  return {
    blogs,
    meta,
    isLoading: isLoading || isFetching,
    isError,
    error,
    page,
    size,
    filters,
    setPage,
    handleSizeChange,
    handleFilterChange,
    resetFilters,
  };
};
