import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import StarRating from './StarRating';

interface CategoryRatingItemProps {
  label: string;
  average: string;
  active: boolean;
  onPress: () => void;
}

export default function CategoryRatingItem({
  label,
  average,
  active,
  onPress,
}: CategoryRatingItemProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.container, active && styles.containerActive]}
    >
      {active && <View style={styles.activeIndicator} />}
      <Text style={[styles.label, active && styles.labelActive]}>{label}</Text>
      <View style={styles.ratingContainer}>
        <StarRating rating={Math.round(Number(average))} size={16} />
        <Text style={styles.average}>{average}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    position: 'relative',
  },
  containerActive: {
    backgroundColor: '#fff',
  },
  activeIndicator: {
    position: 'absolute',
    left: 0,
    top: 8,
    bottom: 8,
    width: 3,
    backgroundColor: '#1976d2',
    borderTopRightRadius: 2,
    borderBottomRightRadius: 2,
  },
  label: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    paddingLeft: 8,
  },
  labelActive: {
    fontWeight: '700',
    color: '#111827',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  average: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    minWidth: 24,
    textAlign: 'right',
  },
});

