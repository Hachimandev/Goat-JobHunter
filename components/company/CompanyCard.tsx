import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Company } from '@/types/model';
import { useFetchGroupedAddressesByCompanyQuery } from '@/services/company/companyApi';

interface CompanyCardProps {
  company: Company;
  totalJobs?: number;
  totalReviews?: number;
  averageRating?: number;
}

export default function CompanyCard({ company, totalJobs, totalReviews, averageRating }: CompanyCardProps) {
  const [imageError, setImageError] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const hasValidLogo = company.logo && company.logo.trim() !== '';
  const hasValidCoverPhoto = company.coverPhoto && company.coverPhoto.trim() !== '';

  const { data: groupedAddresses } = useFetchGroupedAddressesByCompanyQuery(company.accountId);

  const citiesArray = groupedAddresses?.data ? Object.keys(groupedAddresses.data) : [];
  const firstCity = citiesArray[0] || '';
  const remainingCitiesCount = citiesArray.length - 1;

  const handlePress = () => {
    // Navigate to company detail page
    // router.push(`/companies/${company.accountId}`);
  };

  return (
    <TouchableOpacity onPress={handlePress} style={styles.card} activeOpacity={0.7}>
      {/* Cover Photo */}
      <View style={styles.coverContainer}>
        {hasValidCoverPhoto && !imageError ? (
          <Image
            source={{ uri: company.coverPhoto! }}
            style={styles.coverImage}
            onError={() => setImageError(true)}
          />
        ) : (
          <View style={styles.coverPlaceholder} />
        )}

        {/* Logo and Company Name */}
        <View style={styles.logoRow}>
          <View style={styles.logoContainer}>
            {hasValidLogo && !logoError ? (
              <Image
                source={{ uri: company.logo! }}
                style={styles.logo}
                onError={() => setLogoError(true)}
              />
            ) : (
              <View style={styles.logoPlaceholder}>
                <Text style={styles.logoText}>{company.name?.charAt(0).toUpperCase() || '?'}</Text>
              </View>
            )}
          </View>

          <Text style={styles.companyName} numberOfLines={2}>
            {company.name}
          </Text>

          <View style={styles.ratingContainer}>
            <Text style={styles.starIcon}>⭐</Text>
            <Text style={styles.ratingText}>{averageRating?.toFixed(1) || '0.0'}</Text>
          </View>
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {company.description && (
          <Text style={styles.description} numberOfLines={2}>
            {company.description}
          </Text>
        )}

        <View style={styles.infoRow}>
          {firstCity && (
            <View style={styles.infoItem}>
              <Text style={styles.infoIcon}>📍</Text>
              <Text style={styles.infoText} numberOfLines={1}>
                {firstCity}
                {remainingCitiesCount > 0 && ` +${remainingCitiesCount}`}
              </Text>
            </View>
          )}
          <View style={styles.infoItem}>
            <Text style={styles.infoIcon}>💼</Text>
            <Text style={styles.infoText}>{totalJobs || 0} việc làm</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoIcon}>💬</Text>
            <Text style={styles.infoText}>{totalReviews || 0} đánh giá</Text>
          </View>
        </View>

        {company.awards && company.awards.length > 0 && (
          <Text style={styles.award}>
            Tốt nhất về {company.awards[0].type} {company.awards[0].year}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  coverContainer: {
    height: 120,
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  coverPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#3b82f6',
  },
  logoRow: {
    position: 'absolute',
    bottom: -40,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
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
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#9ca3af',
  },
  companyName: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingBottom: 4,
  },
  starIcon: {
    fontSize: 16,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  content: {
    padding: 16,
    paddingTop: 48,
  },
  description: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
    lineHeight: 20,
  },
  infoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 8,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  infoIcon: {
    fontSize: 14,
  },
  infoText: {
    fontSize: 13,
    color: '#6b7280',
  },
  award: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '600',
    marginTop: 8,
  },
});

