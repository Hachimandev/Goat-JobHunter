import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Star } from 'lucide-react-native';

interface RatingBarProps {
  star: number;
  percentage: number;
}

export default function RatingBar({ star, percentage }: RatingBarProps) {
  return (
    <View style={styles.container}>
      <View style={styles.starContainer}>
        <Text style={styles.starText}>{star}</Text>
        <Star size={16} color="#ff9119" fill="#ff9119" />
      </View>
      <View style={styles.barBackground}>
        <View style={[styles.barFill, { width: `${percentage}%` }]} />
      </View>
      <Text style={styles.percentageText}>{percentage}%</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 4,
  },
  starContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    width: 40,
  },
  starText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  barBackground: {
    flex: 1,
    height: 6,
    backgroundColor: '#dcfce7',
    borderRadius: 10,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: '#ff9119',
    borderRadius: 10,
  },
  percentageText: {
    width: 40,
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'right',
  },
});

