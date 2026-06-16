import { useFetchJobsQuery } from "@/services/job/jobApi";
import { useEffect, useMemo, useState } from "react";

export interface AdminJobFilters {
  title?: string;
  level?: string[];
  workingType?: string[];
  active?: boolean | null; // null = all, true = active, false = inactive
  enabled?: boolean | null; // null = all, true = enabled, false = disabled
}

interface UseJobAdminManagementProps {
  initialPage?: number;
  initialSize?: number;
}

export const useJobAdminManagement = ({
  initialPage = 1,
  initialSize = 10
}: UseJobAdminManagementProps) => {
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [filters, setFilters] = useState<AdminJobFilters>({
    title: "",
    level: [],
    workingType: [],
    active: null,
    enabled: null
  });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPage(initialPage);
    setSize(initialSize);
  }, [initialPage, initialSize]);

  const queryParams = useMemo(() => {
    const params: Record<string, string | number | string[] | boolean> = {
      page,
      size
    };

    if (filters.title) params.title = filters.title;
    if (filters.level && filters.level.length > 0) params.level = filters.level;
    if (filters.workingType && filters.workingType.length > 0)
      params.workingType = filters.workingType;
    if (filters.active != undefined) params.active = filters.active;
    if (filters.enabled != undefined) params.enabled = filters.enabled;

    return params;
  }, [page, size, filters]);

  const { data, isLoading, isFetching, isError, error } =
    useFetchJobsQuery(queryParams);

  const jobs = data?.data?.result || [];
  const meta = data?.data?.meta || {
    current: 1,
    pageSize: 10,
    pages: 0,
    total: 0
  };

  const handleSizeChange = (newSize: number) => {
    setSize(newSize);
    setPage(1);
  };

  const handleFilterChange = (newFilters: Partial<AdminJobFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setPage(1);
  };

  const resetFilters = () => {
    setFilters({
      title: "",
      level: [],
      workingType: [],
      active: null,
      enabled: null
    });
    setPage(1);
  };

  return {
    jobs,
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
    resetFilters
  };
};