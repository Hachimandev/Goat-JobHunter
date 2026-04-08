import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Star } from 'lucide-react-native';

interface StarRatingProps {
  rating: number;
  size?: number;
}

export default function StarRating({ rating, size = 20 }: StarRatingProps) {
  return (
    <View style={styles.container}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={size}
          color={star <= Math.round(rating) ? '#ff9119' : '#d1d5db'}
          fill={star <= Math.round(rating) ? '#ff9119' : 'none'}
          style={styles.star}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 4,
  },
  star: {
    marginHorizontal: 1,
  },
});

