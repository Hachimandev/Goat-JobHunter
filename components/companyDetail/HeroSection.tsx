import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Company } from '@/types/model';
import { Ionicons } from '@expo/vector-icons';
import AwardBadge from './AwardBadge';
import { useUser } from '@/hooks/useUser';
import ReviewFormModal from '@/components/review/ReviewFormModal';
import useReviewActions from '@/hooks/useReviewActions';
import useCompanyActions from '@/hooks/useCompanyActions';

interface HeroSectionProps {
  company: Company;
  totalJobs: number;
  citiesArray: string[];
  isFollowed: boolean;
  isReviewed: boolean;
}

export default function HeroSection({ company, totalJobs, citiesArray, isFollowed, isReviewed }: HeroSectionProps) {
  const [logoError, setLogoError] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [localIsFollowed, setLocalIsFollowed] = useState(isFollowed);
  const { user } = useUser();
  const { handleCreateReview, isCreating } = useReviewActions();
  const { handleToggleFollowCompany, isLoading: isFollowLoading } = useCompanyActions();
  const hasValidLogo = company.logo && company.logo.trim() !== '';

  // Sync local state with prop
  useEffect(() => {
    setLocalIsFollowed(isFollowed);
  }, [isFollowed]);

  const handleFollowClick = async () => {
    if (!user) {
      Alert.alert('Thông báo', 'Bạn phải đăng nhập để thực hiện chức năng này.');
      return;
    }
    
    await handleToggleFollowCompany(company, localIsFollowed);
    setLocalIsFollowed(!localIsFollowed);
  };

  const handleReviewClick = () => {
    if (!user) {
      Alert.alert('Thông báo', 'Bạn phải đăng nhập để thực hiện chức năng này.');
      return;
    }
    
    if (isReviewed) {
      Alert.alert('Thông báo', 'Bạn đã đánh giá công ty này rồi.');
      return;
    }
    
    setShowReviewModal(true);
  };

  const handleSubmitReview = async (data: any) => {
    await handleCreateReview(data);
    setShowReviewModal(false);
  };

  return (
    <>
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
                <TouchableOpacity 
                  style={[styles.reviewButton, isReviewed && styles.reviewButtonDisabled]} 
                  onPress={handleReviewClick}
                  disabled={isReviewed}
                >
                  <Text style={styles.reviewButtonText}>
                    {isReviewed ? 'Đã đánh giá' : 'Viết đánh giá'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[
                    styles.followButton, 
                    localIsFollowed && styles.followButtonActive
                  ]} 
                  onPress={handleFollowClick}
                  disabled={isFollowLoading}
                >
                  <Ionicons 
                    name={localIsFollowed ? "checkmark-outline" : "person-add-outline"} 
                    size={18} 
                    color={localIsFollowed ? "#fff" : "#1976d2"} 
                  />
                  <Text style={[
                    styles.followButtonText,
                    localIsFollowed && styles.followButtonTextActive
                  ]}>
                    {localIsFollowed ? 'Đang theo dõi' : 'Theo dõi'}
                  </Text>
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

      <ReviewFormModal
        visible={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        company={company}
        onSubmit={handleSubmitReview}
        isLoading={isCreating}
      />
    </>
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
  reviewButtonDisabled: {
    backgroundColor: '#9ca3af',
    opacity: 0.6,
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
  followButtonActive: {
    backgroundColor: '#1976d2',
    borderColor: '#1976d2',
  },
  followButtonText: {
    color: '#1976d2',
    fontSize: 14,
    fontWeight: '700',
  },
  followButtonTextActive: {
    color: '#fff',
  },
});

