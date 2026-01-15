import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import { Company } from '@/types/model';
import { Ionicons } from '@expo/vector-icons';
import AwardBadge from './AwardBadge';
import { useUser } from '@/hooks/useUser';

interface HeroSectionProps {
  company: Company;
  totalJobs: number;
  citiesArray: string[];
  isFollowed: boolean;
  isReviewed: boolean;
}

export default function HeroSection({ company, totalJobs, citiesArray, isFollowed, isReviewed }: HeroSectionProps) {
  const [logoError, setLogoError] = useState(false);
  const { user } = useUser();
  const hasValidLogo = company.logo && company.logo.trim() !== '';

  const handleFollowClick = () => {
    if (!user) {
      alert('Bạn phải đăng nhập để thực hiện chức năng này.');
      return;
    }
    // TODO: Implement follow functionality
  };

  const handleReviewClick = () => {
    if (!user) {
      alert('Bạn phải đăng nhập để thực hiện chức năng này.');
      return;
    }
    // TODO: Implement review functionality
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        <View style={styles.mainInfo}>
          <View style={styles.logoContainer}>
            {hasValidLogo && !logoError ? (
              <Image
                source={{ uri: company.logo }}
                style={styles.logo}
                onError={() => setLogoError(true)}
                resizeMode="contain"
              />
            ) : (
              <View style={styles.logoPlaceholder}>
                <Text style={styles.logoPlaceholderText}>
                  {company.name?.charAt(0).toUpperCase() || '?'}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.info}>
            <Text style={styles.companyName}>{company.name}</Text>

            <View style={styles.infoRow}>
              {citiesArray.length > 0 && (
                <View style={styles.infoItem}>
                  <Ionicons name="location-outline" size={16} color="#6b7280" />
                  <Text style={styles.infoText} numberOfLines={1}>
                    {citiesArray.join(', ')}
                  </Text>
                </View>
              )}
              <View style={styles.infoItem}>
                <Ionicons name="briefcase-outline" size={16} color="#6b7280" />
                <Text style={styles.infoText}>{totalJobs} việc làm</Text>
              </View>
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.reviewButton} onPress={handleReviewClick}>
                <Text style={styles.reviewButtonText}>Viết đánh giá</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.followButton} onPress={handleFollowClick}>
                <Ionicons name="person-add-outline" size={18} color="#1976d2" />
                <Text style={styles.followButtonText}>Theo dõi</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <AwardBadge
          year={company.awards && company.awards.length > 0 ? company.awards[0].year : undefined}
          type={company.awards && company.awards.length > 0 ? company.awards[0].type : undefined}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#eff6ff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  content: {
    padding: 16,
  },
  mainInfo: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  logoContainer: {
    width: 120,
    height: 120,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  logo: {
    width: '100%',
    height: '100%',
    borderRadius: 4,
  },
  logoPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f3f4f6',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoPlaceholderText: {
    fontSize: 48,
    fontWeight: '700',
    color: '#9ca3af',
  },
  info: {
    flex: 1,
    gap: 12,
  },
  companyName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    lineHeight: 32,
  },
  infoRow: {
    gap: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoText: {
    fontSize: 14,
    color: '#6b7280',
    flex: 1,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  reviewButton: {
    flex: 1,
    backgroundColor: '#1976d2',
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  reviewButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  followButton: {
    flex: 1,
    backgroundColor: '#fff',
    paddingVertical: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#1976d2',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  followButtonText: {
    color: '#1976d2',
    fontSize: 14,
    fontWeight: '700',
  },
});

