import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import useDetailCompany from '@/hooks/useDetailCompany';
import {
  HeroSection,
  AboutTab,
  ReviewTab,
  JobListSection,
} from '@/components/companyDetail';

export default function CompanyDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const {
    company,
    skills,
    jobs,
    citiesArray,
    totalJobs,
    totalReviews,
    ratingSummary,
    recommendedPercentage,
    savedJobs,
    isFollowed,
    isReviewed,
    isError,
    isLoading,
    isLoadingJobs,
    isErrorJobs,
  } = useDetailCompany(id || '');

  const tabs = useMemo(
    () => [
      { id: 'about', label: 'Giới thiệu', count: null },
      { id: 'reviews', label: 'Đánh giá', count: totalReviews },
    ],
    [totalReviews]
  );

  const [activeTab, setActiveTab] = useState<string>(tabs[0].id);

  if (!company && (isLoading || isError === false)) {
    return (
      <View style={styles.loadingContainer}>
        <Stack.Screen options={{ title: 'Đang tải...' }} />
        <ActivityIndicator size="large" color="#1976d2" />
      </View>
    );
  }

  if (!company && isError) {
    return (
      <View style={styles.errorContainer}>
        <Stack.Screen options={{ title: 'Lỗi' }} />
        <Text style={styles.errorTitle}>Có lỗi xảy ra</Text>
        <Text style={styles.errorDescription}>
          Không thể tải thông tin công ty. Vui lòng thử lại sau.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: company?.name || 'Chi tiết công ty' }} />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <HeroSection 
          company={company!} 
          totalJobs={totalJobs} 
          citiesArray={citiesArray}
          isFollowed={isFollowed || false}
          isReviewed={isReviewed || false}
        />

        <View style={styles.content}>
          {/* Tabs */}
          <View style={styles.tabsContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.tabs}>
                {tabs.map((tab) => (
                  <TouchableOpacity
                    key={tab.id}
                    onPress={() => setActiveTab(tab.id)}
                    style={[styles.tab, activeTab === tab.id && styles.tabActive]}
                  >
                    <Text style={[styles.tabText, activeTab === tab.id && styles.tabTextActive]}>
                      {tab.label}
                    </Text>
                    {tab.count !== null && (
                      <View
                        style={[
                          styles.tabBadge,
                          activeTab === tab.id && styles.tabBadgeActive,
                        ]}
                      >
                        <Text
                          style={[
                            styles.tabBadgeText,
                            activeTab === tab.id && styles.tabBadgeTextActive,
                          ]}
                        >
                          {tab.count}
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Tab Content */}
          <View style={styles.tabContent}>
            {activeTab === 'about' && <AboutTab company={company!} skills={skills} />}
            {activeTab === 'reviews' && (
              <ReviewTab
                ratingSummary={ratingSummary}
                recommendedPercentage={recommendedPercentage}
                totalReviews={totalReviews}
                companyName={id || ''}
              />
            )}
          </View>

          {/* Job List */}
          <JobListSection 
            jobs={jobs} 
            isLoading={isLoadingJobs} 
            isError={isErrorJobs}
            savedJobs={savedJobs}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  tabsContainer: {
    marginBottom: 16,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
    paddingHorizontal: 8,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#1976d2',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#6b7280',
  },
  tabTextActive: {
    color: '#1976d2',
  },
  tabBadge: {
    backgroundColor: '#e5e7eb',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    minWidth: 24,
    alignItems: 'center',
  },
  tabBadgeActive: {
    backgroundColor: '#1976d2',
  },
  tabBadgeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6b7280',
  },
  tabBadgeTextActive: {
    color: '#fff',
  },
  tabContent: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    padding: 32,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  errorDescription: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
});

