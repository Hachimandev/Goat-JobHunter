import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { RatingItem } from '@/services/review/reviewType';
import StarRating from './StarRating';
import RatingBar from './RatingBar';
import CircularProgress from './CircularProgress';
import { Ionicons } from '@expo/vector-icons';
import CategoryRatingItem from './CategoryRatingItem';
import { useReviewFilter } from '@/hooks/useReviewFilter';
import ReviewCard from './ReviewCard';

interface ReviewTabProps {
  companyName: string;
  ratingSummary: Record<string, RatingItem>;
  recommendedPercentage: number;
  totalReviews: number;
}

export default function ReviewTab({
  companyName,
  ratingSummary,
  recommendedPercentage,
  totalReviews,
}: ReviewTabProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(0);

  const {
    reviews,
    currentPage,
    totalPages,
    nextPage,
    previousPage,
    hasNextPage,
    hasPreviousPage,
    isLoading,
    isError,
  } = useReviewFilter({
    initialPage: 1,
    itemsPerPage: 10,
    initialFilters: {
      companyName: companyName,
    },
  });

  const overallStats = useMemo(() => {
    const overallRating = ratingSummary
      ? Object.entries(ratingSummary).find(([key]) => key === 'Đánh giá chung')?.[1] || {
          average: 0,
          distribution: {},
        }
      : { average: 0, distribution: {} };

    const categories = Object.entries(ratingSummary)
      .filter(([key]) => key !== 'Đánh giá chung')
      .map(([label, data]) => ({
        label,
        average: data.average.toFixed(1),
        distribution: Object.entries(data.distribution)
          .sort(([starA], [starB]) => Number(starB) - Number(starA))
          .map(([star, percentage]) => ({
            star: Number(star),
            percentage: percentage,
          })),
      }));

    return {
      recommend: Math.round(recommendedPercentage),
      average: overallRating.average.toFixed(1),
      distribution: Object.entries(overallRating.distribution)
        .sort(([starA], [starB]) => Number(starB) - Number(starA))
        .map(([star, percentage]) => ({
          star: Number(star),
          percentage: percentage,
        })),
      categories,
    };
  }, [ratingSummary, recommendedPercentage]);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Đánh giá chung */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Đánh giá chung</Text>
        </View>

        <View style={styles.overallContainer}>
          <View style={styles.overallScore}>
            <Text style={styles.overallNumber}>{overallStats.average}</Text>
            <StarRating rating={Number(overallStats.average)} />
            <Text style={styles.overallCount}>{totalReviews} đánh giá</Text>
          </View>

          <View style={styles.distributionContainer}>
            {overallStats.distribution.map((item) => (
              <RatingBar key={item.star} star={item.star} percentage={item.percentage} />
            ))}
          </View>

          <View style={styles.recommendContainer}>
            <CircularProgress percentage={overallStats.recommend} size={80} />
            <Text style={styles.recommendText}>Khuyến khích làm việc tại đây</Text>
          </View>
        </View>

        {overallStats.categories.length > 0 && (
          <>
            {showDetails && (
              <View style={styles.detailsContainer}>
                <View style={styles.categoriesContainer}>
                  {overallStats.categories.map((cat, idx) => (
                    <CategoryRatingItem
                      key={idx}
                      label={cat.label}
                      average={cat.average}
                      active={idx === activeCategoryIndex}
                      onPress={() => setActiveCategoryIndex(idx)}
                    />
                  ))}
                </View>

                <View style={styles.categoryDetailContainer}>
                  <Text style={styles.categoryDetailTitle}>Đánh giá chi tiết</Text>
                  <View style={styles.categoryDetailBars}>
                    {overallStats.categories[activeCategoryIndex].distribution.map((d) => (
                      <RatingBar key={d.star} star={d.star} percentage={d.percentage} />
                    ))}
                  </View>
                </View>
              </View>
            )}

            <TouchableOpacity
              onPress={() => setShowDetails(!showDetails)}
              style={styles.toggleButton}
            >
              <Text style={styles.toggleButtonText}>
                {showDetails ? 'Thu gọn' : 'Xem thêm'}
              </Text>
              <Ionicons
                name={showDetails ? 'chevron-up' : 'chevron-down'}
                size={16}
                color="#111827"
              />
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Danh sách đánh giá */}
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1976d2" />
        </View>
      )}

      {isError && (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>Có lỗi xảy ra</Text>
          <Text style={styles.emptyDescription}>
            Không thể tải danh sách đánh giá. Vui lòng thử lại sau.
          </Text>
        </View>
      )}

      {!isLoading && !isError && reviews.length === 0 && (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>Không tìm thấy đánh giá</Text>
          <Text style={styles.emptyDescription}>Không tìm thấy đánh giá nào khớp với công ty</Text>
        </View>
      )}

      {!isLoading && !isError && reviews.length > 0 && (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>{totalReviews} đánh giá</Text>
          </View>
          <View style={styles.reviewsContainer}>
            {reviews.map((review) => (
              <ReviewCard key={review.reviewId} review={review} />
            ))}
          </View>

          {/* Pagination */}
          {totalPages > 1 && (
            <View style={styles.pagination}>
              <TouchableOpacity
                onPress={previousPage}
                disabled={!hasPreviousPage}
                style={[styles.paginationButton, !hasPreviousPage && styles.paginationButtonDisabled]}
              >
                <Ionicons name="chevron-back" size={20} color={hasPreviousPage ? '#1976d2' : '#9ca3af'} />
              </TouchableOpacity>

              <Text style={styles.paginationText}>
                Trang {currentPage} / {totalPages}
              </Text>

              <TouchableOpacity
                onPress={nextPage}
                disabled={!hasNextPage}
                style={[styles.paginationButton, !hasNextPage && styles.paginationButtonDisabled]}
              >
                <Ionicons name="chevron-forward" size={20} color={hasNextPage ? '#1976d2' : '#9ca3af'} />
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  cardHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    borderStyle: 'dashed',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  overallContainer: {
    padding: 24,
    gap: 20,
  },
  overallScore: {
    alignItems: 'center',
    gap: 8,
  },
  overallNumber: {
    fontSize: 42,
    fontWeight: '700',
    color: '#111827',
  },
  overallCount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  distributionContainer: {
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    borderStyle: 'dashed',
  },
  recommendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    borderStyle: 'dashed',
  },
  recommendText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    lineHeight: 22,
  },
  detailsContainer: {
    marginTop: 24,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  categoriesContainer: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  categoryDetailContainer: {
    padding: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
  },
  categoryDetailTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  categoryDetailBars: {
    gap: 12,
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
  },
  toggleButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  reviewsContainer: {
    padding: 16,
  },
  loadingContainer: {
    padding: 80,
    alignItems: 'center',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  paginationButton: {
    padding: 8,
  },
  paginationButtonDisabled: {
    opacity: 0.5,
  },
  paginationText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
});

