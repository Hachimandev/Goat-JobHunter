import { useEffect, useMemo, useState } from "react";
import { useFetchPermissionsQuery } from "@/services/permission/permissionApi";
import { METHOD_OPTIONS } from "@/constants/constant";

export interface PermissionFilters {
  module?: string;
  method?: typeof METHOD_OPTIONS[number];
  name?: string;
}

export const usePermissionManagement = ({ initialPage = 1, initialSize = 10 } = {}) => {
  const [page, setPage] = useState(initialPage);
  const [size, setSize] = useState(initialSize);
  const [filters, setFilters] = useState<PermissionFilters>({ module: "", method: "", name: "" });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPage(initialPage);
    setSize(initialSize);
  }, [initialPage, initialSize]);

  const queryParams = useMemo(() => {
    const params: Record<string, string | number | boolean | undefined> = { page, size };
    if (filters.module) params.module = filters.module;
    if (filters.method) params.method = filters.method;
    if (filters.name) params.name = filters.name;
    return params;
  }, [page, size, filters]);

  const { data, isLoading, isFetching, isError, error } = useFetchPermissionsQuery(queryParams);

  const permissions = useMemo(() => data?.data?.result || [], [data]);
  const meta = useMemo(() => data?.data?.meta || { current: 1, pageSize: 10, pages: 0, total: 0 }, [data]);

  const handlePageChange = (newPage: number) => setPage(newPage);

  const handleSizeChange = (newSize: number) => {
    setSize(newSize);
    setPage(1);
  };

  const handleFilterChange = (newFilters: Partial<PermissionFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPage(1);
  };

  const resetFilters = () => {
    setFilters({ module: "", method: "", name: "" });
    setPage(1);
  };

  return {
    permissions,
    meta,
    isLoading: isLoading || isFetching,
    isError,
    error,
    page,
    size,
    filters,
    handlePageChange,
    handleSizeChange,
    handleFilterChange,
    resetFilters
  };
};