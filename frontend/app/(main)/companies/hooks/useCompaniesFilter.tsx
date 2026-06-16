import { useFetchAvailableCompaniesQuery } from '@/services/company/companyApi';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

export interface CompanyFilters {
  name?: string;
  addresses?: string[];
  verified?: boolean;
}

export interface UseCompanyFilterOptions {
  initialPage?: number;
  itemsPerPage?: number;
  initialFilters?: CompanyFilters;
}

export const useCompanyFilter = (options?: UseCompanyFilterOptions) => {
  const { initialPage = 1, itemsPerPage = 9, initialFilters = {} } = options || {};

  const router = useRouter();

  const [currentPage, setCurrentPage] = useState(initialPage);
  const [filters, setFilters] = useState<CompanyFilters>(initialFilters);
  const [nameInputValue, setNameInputValue] = useState<string>('');

  const handleNameInputChange = (value: string) => {
    setNameInputValue(value);
  };

  const { data: companiesData, isFetching: isFetchingCompanies } = useFetchAvailableCompaniesQuery({
    page: 1,
    size: 50,
    name: nameInputValue,
  });

  const queryParams = useMemo(() => {
    const params: Record<string, string | number | boolean | string[]> = {
      page: currentPage,
      size: itemsPerPage,
    };

    // Add filters
    if (filters.name) {
      params.name = filters.name;
    }

    if (filters.addresses && filters.addresses.length > 0) {
      params.addresses = filters.addresses;
    }

    if (filters.verified !== undefined) {
      params.verified = filters.verified;
    }

    return params;
  }, [currentPage, itemsPerPage, filters]);

  const { data: companyResponse, isLoading, isFetching, isError, error } = useFetchAvailableCompaniesQuery(queryParams);

  const companies = companyResponse?.data?.result || [];
  const meta = companyResponse?.data?.meta || {
    current: 1,
    pageSize: itemsPerPage,
    pages: 0,
    total: 0,
  };

  const totalPages = meta.pages;
  const totalItems = meta.total;

  const handleFilterChange = (newFilters: Partial<CompanyFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setFilters(initialFilters);
    setNameInputValue('');
    setCurrentPage(1);

    router.push('/companies');
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const previousPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const hasNextPage = currentPage < totalPages;
  const hasPreviousPage = currentPage > 1;

  const activeFiltersCount = Object.entries(filters).filter(([_, value]) => {
    return value !== undefined && value !== null && value !== '' && (!Array.isArray(value) || value.length > 0);
  }).length;

  return {
    // Data
    companies,
    meta,
    totalPages,
    totalItems,
    currentPage,
    itemsPerPage,

    // Loading states
    isLoading,
    isFetching,
    isError,
    error,

    // Filters
    filters,
    handleFilterChange,
    resetFilters,
    activeFiltersCount,

    // Search inputs
    companiesData: companiesData?.data?.result || [],
    isFetchingCompanies,
    nameInputValue,
    handleNameInputChange,

    // Pagination
    goToPage,
    nextPage,
    previousPage,
    hasNextPage,
    hasPreviousPage,
  };
};
