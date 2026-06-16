'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty';
import CustomPagination from '@/components/common/CustomPagination';
import { TrendingUp } from 'lucide-react';
import { useCompanyFilter } from './hooks/useCompaniesFilter';
import {
  useAverageRatingsByCompanyQuery,
  useCountAllReviewsQuery,
  useCountReviewsByCompanyQuery,
  useLatestReviewsQuery,
} from '@/services/review/reviewApi';
import { useMemo } from 'react';
import { CompanyCard, CompanyFilter, LatestReviewCard } from './components';
import { formatNumberWithComma } from '@/utils/formatCurrency';
import { useCountAvailableJobsByCompanyQuery } from '@/services/job/jobApi';

export default function CompaniesPage() {
  const {
    companies,
    isLoading,
    isError,
    filters,
    handleFilterChange,
    resetFilters,
    currentPage,
    totalPages,
    goToPage,
    nextPage,
    previousPage,
    hasNextPage,
    hasPreviousPage,
    activeFiltersCount,
    companiesData,
    isFetchingCompanies,
    nameInputValue,
    handleNameInputChange,
  } = useCompanyFilter({
    initialPage: 1,
    itemsPerPage: 6,
    initialFilters: {
      name: '',
      addresses: [],
      verified: undefined,
    },
  });

  const { data: countJobs } = useCountAvailableJobsByCompanyQuery();
  const { data: countReviews } = useCountReviewsByCompanyQuery();
  const { data: averageRatings } = useAverageRatingsByCompanyQuery();
  const { data: reviewResponses } = useLatestReviewsQuery();
  const { data: countAllReviewsResponse } = useCountAllReviewsQuery();

  const latestReviews = useMemo(() => {
    return reviewResponses?.data || [];
  }, [reviewResponses]);

  const countAllReviews = useMemo(() => {
    return formatNumberWithComma(countAllReviewsResponse?.data || 0);
  }, [countAllReviewsResponse]);

  return (
    <div className="flex-1">
      <section className="border-b border-border bg-primary/5 py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            {countAllReviews} đánh giá về các công ty hàng đầu
          </h1>
          <p className="font-bold">Mọi người đang nói gì về công ty của bạn? Tìm hiểu ngay!</p>
        </div>
      </section>

      <section className="py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <CompanyFilter
                filters={filters}
                onFilterChange={handleFilterChange}
                onResetFilters={resetFilters}
                activeFiltersCount={activeFiltersCount}
                companies={companiesData}
                isFetchingCompanies={isFetchingCompanies}
                nameInputValue={nameInputValue}
                onNameInputChange={handleNameInputChange}
              />

              {isLoading && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 9 }, () => crypto.randomUUID()).map((key) => (
                    <Skeleton key={key} className="h-80 rounded-xl" />
                  ))}
                </div>
              )}

              {isError && (
                <Empty>
                  <EmptyHeader>
                    <EmptyTitle>Có lỗi xảy ra</EmptyTitle>
                    <EmptyDescription>Không thể tải danh sách công ty. Vui lòng thử lại sau.</EmptyDescription>
                  </EmptyHeader>
                </Empty>
              )}

              {!isLoading && !isError && companies.length === 0 && (
                <Empty>
                  <EmptyHeader>
                    <EmptyTitle>Không tìm thấy công ty</EmptyTitle>
                    <EmptyDescription>Không tìm thấy công ty nào khớp với yêu cầu của bạn</EmptyDescription>
                  </EmptyHeader>
                </Empty>
              )}

              {!isLoading && !isError && companies.length > 0 && (
                <div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-6">
                    {companies.map((company) => (
                      <CompanyCard
                        key={company.accountId}
                        company={company}
                        totalJobs={countJobs?.data?.[company.accountId]}
                        totalReviews={countReviews?.data?.[company.accountId]}
                        averageRating={averageRatings?.data?.[company.accountId]}
                      />
                    ))}
                  </div>

                  {!isLoading && (
                    <CustomPagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={goToPage}
                      onNextPage={nextPage}
                      onPreviousPage={previousPage}
                      hasNextPage={hasNextPage}
                      hasPreviousPage={hasPreviousPage}
                      visiblePageRange={2}
                    />
                  )}
                </div>
              )}
            </div>
            <div className="lg:col-span-1 shadow-xl">
              <Card className="gap-0 pb-0">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    <h3 className="text-2xl font-bold text-foreground">Đánh Giá Mới Nhất</h3>
                  </div>
                </CardHeader>
                <CardContent>
                  {latestReviews.length > 0 ? (
                    <div>
                      {latestReviews.map((review) => (
                        <LatestReviewCard key={review.reviewId} review={review} />
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Chưa có đánh giá mới nhất</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
