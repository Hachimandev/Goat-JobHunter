import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface InteractiveStarRatingProps {
  value: number;
  onChange: (value: number) => void;
  size?: number;
}

export default function InteractiveStarRating({
  value,
  onChange,
  size = 32,
}: InteractiveStarRatingProps) {
  const handlePress = (rating: number) => {
    onChange(rating);
  };

  return (
    <View style={styles.container}>
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity key={star} onPress={() => handlePress(star)} style={styles.star}>
          <Ionicons
            name={star <= value ? 'star' : 'star-outline'}
            size={size}
            color={star <= value ? '#fbbf24' : '#d1d5db'}
          />
        </TouchableOpacity>
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
    padding: 2,
  },
});

