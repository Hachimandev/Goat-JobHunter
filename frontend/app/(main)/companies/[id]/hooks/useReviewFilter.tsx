import { useGetAllReviewsByCompanyQuery } from '@/services/review/reviewApi';
import { useMemo, useState } from 'react';

export interface ReviewsFilters {
    companyName?: string;
}

export interface UseReviewFilterOptions {
    initialPage?: number;
    itemsPerPage?: number;
    initialFilters?: ReviewsFilters;
}

export const useReviewFilter = (options?: UseReviewFilterOptions) => {
    const { initialPage = 1, itemsPerPage = 10, initialFilters = {} } = options || {};

    const [currentPage, setCurrentPage] = useState(initialPage);
    const [filters] = useState<ReviewsFilters>(initialFilters);

    const queryParams = useMemo(() => {
        const params: Record<string, string | number> = {
            page: currentPage,
            size: itemsPerPage,
        };

        if (filters.companyName) {
            params.companyName = filters.companyName;
        }

        return params;
    }, [currentPage, itemsPerPage, filters.companyName]);

    const {
        data: reviewsResponse,
        isLoading,
        isFetching,
        isError,
        error,
    } = useGetAllReviewsByCompanyQuery(queryParams);

    const reviews = reviewsResponse?.data?.result || [];
    const meta = reviewsResponse?.data?.meta || {
        current: 1,
        pageSize: itemsPerPage,
        pages: 0,
        total: 0,
    };
    const totalPages = meta.pages;
    const totalItems = meta.total;

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

    return {
        // Data
        reviews,
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

        // Pagination
        goToPage,
        nextPage,
        previousPage,
        hasNextPage,
        hasPreviousPage,
    };
};
