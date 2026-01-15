import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Review } from '@/types/model';

interface LatestReviewCardProps {
  review: Review;
}

export default function LatestReviewCard({ review }: LatestReviewCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 1) return 'Hôm nay';
    if (diffDays === 1) return 'Hôm qua';
    if (diffDays < 7) return `${diffDays} ngày trước`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} tuần trước`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} tháng trước`;
    return `${Math.floor(diffDays / 365)} năm trước`;
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.ratingContainer}>
          {[1, 2, 3, 4, 5].map((star) => (
            <Text key={star} style={styles.starIcon}>
              {star <= (review.rating?.overall || 0) ? '⭐' : '☆'}
            </Text>
          ))}
        </View>
        <Text style={styles.date}>{formatDate(review.createdAt)}</Text>
      </View>

      {review.summary && (
        <Text style={styles.summary} numberOfLines={3}>
          {review.summary}
        </Text>
      )}

      <View style={styles.footer}>
        <Text style={styles.companyName} numberOfLines={1}>
          {review.company?.name || 'Công ty'}
        </Text>
        {review.recommended !== undefined && (
          <View style={[styles.badge, review.recommended ? styles.badgePositive : styles.badgeNegative]}>
            <Text style={styles.badgeText}>
              {review.recommended ? '👍 Giới thiệu' : '👎 Không giới thiệu'}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    gap: 2,
  },
  starIcon: {
    fontSize: 14,
  },
  date: {
    fontSize: 12,
    color: '#9ca3af',
  },
  summary: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  companyName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgePositive: {
    backgroundColor: '#d1fae5',
  },
  badgeNegative: {
    backgroundColor: '#fee2e2',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
});

