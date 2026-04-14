import { useGetAllAccountsQuery } from '@/services/admin/adminApi';
import { useMemo, useState } from 'react';

export type AccountFilterType = {
  email?: string;
  role?: string;
  enabled?: boolean;
  locked?: boolean;
};

export default function useAccountManagement() {
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [filters, setFilters] = useState<AccountFilterType>({
    email: '',
    role: '',
    enabled: undefined,
    locked: undefined,
  });

  // Build query params
  const queryParams = useMemo(() => {
    const params: Record<string, string | number | boolean> = {
      page,
      size,
    };

    if (filters.email) params.email = filters.email;
    if (filters.role) params.role = filters.role;
    if (filters.enabled != undefined) params.enabled = filters.enabled;
    if (filters.locked != undefined) params.locked = filters.locked;

    return params;
  }, [page, size, filters]);

  const { data, isLoading, isFetching, isError } = useGetAllAccountsQuery(queryParams);

  const accounts = data?.data?.result || [];
  const meta = data?.data?.meta || {
    current: 1,
    pageSize: 10,
    pages: 0,
    total: 0,
  };

  // Handlers
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleSizeChange = (newSize: number) => {
    setSize(newSize);
    setPage(1);
  };

  const handleFilterChange = (newFilters: AccountFilterType) => {
    setFilters(newFilters);
    setPage(1);
  };

  const resetFilters = () => {
    setFilters({
      email: '',
      role: '',
      enabled: undefined,
      locked: undefined,
    });
    setPage(1);
  };

  return {
    accounts,
    meta,
    isLoading: isLoading || isFetching,
    isError,
    page,
    size,
    filters,
    handlePageChange,
    handleSizeChange,
    handleFilterChange,
    resetFilters,
  };
}
