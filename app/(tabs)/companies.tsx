import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useCompanyFilter } from '@/hooks/useCompaniesFilter';
import {
  useAverageRatingsByCompanyQuery,
  useCountAllReviewsQuery,
  useCountReviewsByCompanyQuery,
  useLatestReviewsQuery,
} from '@/services/review/reviewApi';
import { useCountAvailableJobsByCompanyQuery } from '@/services/job/jobApi';
import CompanyCard from '@/components/company/CompanyCard';
import CompanyFilter from '@/components/company/CompanyFilter';
import LatestReviewCard from '@/components/company/LatestReviewCard';

export default function CompaniesScreen() {
  const {
    companies,
    isLoading,
    isFetching,
    isError,
    filters,
    handleFilterChange,
    resetFilters,
    currentPage,
    totalPages,
    nextPage,
    previousPage,
    hasNextPage,
    hasPreviousPage,
    activeFiltersCount,
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
  const { data: reviewResponses, refetch: refetchReviews } = useLatestReviewsQuery();
  const { data: countAllReviewsResponse } = useCountAllReviewsQuery();

  const latestReviews = useMemo(() => {
    return reviewResponses?.data || [];
  }, [reviewResponses]);

  const countAllReviews = useMemo(() => {
    const count = countAllReviewsResponse?.data || 0;
    return count.toLocaleString('vi-VN');
  }, [countAllReviewsResponse]);

  const onRefresh = () => {
    refetchReviews();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={isFetching} onRefresh={onRefresh} />}
      >
        {/* Header Section */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{countAllReviews} đánh giá về các công ty hàng đầu</Text>
          <Text style={styles.headerSubtitle}>Mọi người đang nói gì về công ty của bạn? Tìm hiểu ngay!</Text>
        </View>

        {/* Content Section */}
        <View style={styles.content}>
          {/* Filter */}
          <CompanyFilter
            filters={filters}
            onFilterChange={handleFilterChange}
            onResetFilters={resetFilters}
            activeFiltersCount={activeFiltersCount}
            nameInputValue={nameInputValue}
            onNameInputChange={handleNameInputChange}
          />

          {/* Loading State */}
          {isLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#1976d2" />
              <Text style={styles.loadingText}>Đang tải danh sách công ty...</Text>
            </View>
          )}

          {/* Error State */}
          {isError && !isLoading && (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>⚠️</Text>
              <Text style={styles.emptyTitle}>Có lỗi xảy ra</Text>
              <Text style={styles.emptyDescription}>Không thể tải danh sách công ty. Vui lòng thử lại sau.</Text>
            </View>
          )}

          {/* Empty State */}
          {!isLoading && !isError && companies.length === 0 && (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🔍</Text>
              <Text style={styles.emptyTitle}>Không tìm thấy công ty</Text>
              <Text style={styles.emptyDescription}>Không tìm thấy công ty nào khớp với yêu cầu của bạn</Text>
            </View>
          )}

          {/* Companies List */}
          {!isLoading && !isError && companies.length > 0 && (
            <View>
              {companies.map((company) => (
                <CompanyCard
                  key={company.accountId}
                  company={company}
                  totalJobs={countJobs?.data?.[company.accountId]}
                  totalReviews={countReviews?.data?.[company.accountId]}
                  averageRating={averageRatings?.data?.[company.accountId]}
                />
              ))}

              {/* Pagination */}
              <View style={styles.pagination}>
                <Text style={styles.paginationText}>
                  Trang {currentPage} / {totalPages}
                </Text>
                <View style={styles.paginationButtons}>
                  <Text
                    style={[styles.paginationButton, !hasPreviousPage && styles.paginationButtonDisabled]}
                    onPress={hasPreviousPage ? previousPage : undefined}
                  >
                    ← Trước
                  </Text>
                  <Text
                    style={[styles.paginationButton, !hasNextPage && styles.paginationButtonDisabled]}
                    onPress={hasNextPage ? nextPage : undefined}
                  >
                    Sau →
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Latest Reviews Section */}
          <View style={styles.reviewsSection}>
            <View style={styles.reviewsHeader}>
              <Text style={styles.reviewsIcon}>📈</Text>
              <Text style={styles.reviewsTitle}>Đánh Giá Mới Nhất</Text>
            </View>
            <View style={styles.reviewsCard}>
              {latestReviews.length > 0 ? (
                latestReviews.map((review) => <LatestReviewCard key={review.reviewId} review={review} />)
              ) : (
                <Text style={styles.noReviewsText}>Chưa có đánh giá mới nhất</Text>
              )}
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 16,
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4b5563',
  },
  content: {
    padding: 16,
  },
  loadingContainer: {
    paddingVertical: 48,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6b7280',
  },
  emptyContainer: {
    paddingVertical: 48,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  pagination: {
    marginTop: 24,
    marginBottom: 16,
    alignItems: 'center',
  },
  paginationText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
  },
  paginationButtons: {
    flexDirection: 'row',
    gap: 16,
  },
  paginationButton: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1976d2',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  paginationButtonDisabled: {
    color: '#9ca3af',
  },
  reviewsSection: {
    marginTop: 24,
  },
  reviewsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  reviewsIcon: {
    fontSize: 20,
  },
  reviewsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  reviewsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  noReviewsText: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    paddingVertical: 16,
  },
});

