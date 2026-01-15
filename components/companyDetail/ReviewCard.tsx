import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Review } from '@/types/model';
import { formatDate } from '@/utils/formatDate';
import StarRating from './StarRating';
import { Ionicons } from '@expo/vector-icons';
import { RATING_TYPES } from '@/constants/constant';

interface ReviewCardProps {
  review: Review;
}

export default function ReviewCard({ review }: ReviewCardProps) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.date}>{formatDate(review.createdAt || '')}</Text>
      <Text style={styles.summary}>{review.summary}</Text>

      <View style={styles.ratingRow}>
        <TouchableOpacity
          onPress={() => setShowDetails(!showDetails)}
          style={styles.ratingButton}
        >
          <StarRating rating={review.rating.overall} size={16} />
          <Ionicons
            name={showDetails ? 'chevron-up' : 'chevron-down'}
            size={20}
            color="#111827"
          />
        </TouchableOpacity>

        {review.recommended && (
          <View style={styles.recommendedBadge}>
            <Ionicons name="thumbs-up" size={16} color="#16a34a" />
            <Text style={styles.recommendedText}>Khuyến khích</Text>
          </View>
        )}
      </View>

      {showDetails && (
        <View style={styles.detailsContainer}>
          {RATING_TYPES.map(({ value, label }) => (
            <View key={value} style={styles.detailRow}>
              <Text style={styles.detailLabel}>{label}</Text>
              <View style={styles.detailRating}>
                <StarRating rating={review.rating[value as keyof typeof review.rating]} size={14} />
                <Text style={styles.detailScore}>
                  {review.rating[value as keyof typeof review.rating]}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {review.experience && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Kinh nghiệm làm việc</Text>
          <Text style={styles.sectionContent}>
            {review.experience.split('\\n').join('\n')}
          </Text>
        </View>
      )}

      {review.suggestion && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Đề xuất cải thiện</Text>
          <Text style={styles.sectionContent}>
            {review.suggestion.split('\\n').join('\n')}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    borderStyle: 'dashed',
  },
  date: {
    fontSize: 16,
    fontWeight: '700',
    color: '#6b7280',
    marginBottom: 4,
  },
  summary: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  ratingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  recommendedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  recommendedText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#16a34a',
  },
  detailsContainer: {
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    borderStyle: 'dashed',
  },
  detailLabel: {
    fontSize: 16,
    color: '#111827',
  },
  detailRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailScore: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    minWidth: 24,
    textAlign: 'right',
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  sectionContent: {
    fontSize: 15,
    fontWeight: '500',
    color: '#111827',
    lineHeight: 24,
  },
});

