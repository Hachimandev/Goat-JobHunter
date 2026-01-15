import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface AwardBadgeProps {
  year?: number;
  type?: string;
}

export default function AwardBadge({ year, type }: AwardBadgeProps) {
  if (!year || !type) return null;

  return (
    <View style={styles.container}>
      <View style={styles.ribbon}>
        <View style={styles.ribbonLeft} />
        <View style={styles.ribbonMain}>
          <Text style={styles.ribbonText}>GIẢI THƯỞNG {year}!</Text>
        </View>
        <View style={styles.ribbonRight} />
      </View>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>
          Công Ty Tốt Nhất Việt Nam™{'\n'}
          {type}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 16,
  },
  ribbon: {
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 20,
  },
  ribbonLeft: {
    width: 0,
    height: 0,
    borderTopWidth: 20,
    borderTopColor: 'transparent',
    borderRightWidth: 12,
    borderRightColor: '#1976d2',
    borderBottomWidth: 20,
    borderBottomColor: 'transparent',
  },
  ribbonMain: {
    backgroundColor: '#1976d2',
    paddingHorizontal: 40,
    paddingVertical: 8,
  },
  ribbonText: {
    color: '#fff',
    fontSize: 19,
    fontWeight: '700',
  },
  ribbonRight: {
    width: 0,
    height: 0,
    borderTopWidth: 20,
    borderTopColor: 'transparent',
    borderLeftWidth: 12,
    borderLeftColor: '#1976d2',
    borderBottomWidth: 20,
    borderBottomColor: 'transparent',
  },
  badge: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#1976d2',
    borderRadius: 12,
    paddingHorizontal: 40,
    paddingTop: 24,
    paddingBottom: 10,
    marginTop: -16,
    minWidth: 310,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  badgeText: {
    color: '#1976d2',
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    textAlign: 'center',
    lineHeight: 20,
  },
});

