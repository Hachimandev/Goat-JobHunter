import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useJobsFilter } from '../../hooks/useJobsFilter';
import { JobCard } from '../../components/job/JobCard';
import { JobFilter } from '../../components/job/JobFilter';
import { Job } from '../../types/model';
import { useUser } from '../../hooks/useUser';
import { ChevronDown, MailOpen, RotateCw, X } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Index() {
  const router = useRouter();
  const { isSignedIn } = useUser();
  const [showFilter, setShowFilter] = useState(false);

  const {
    jobs,
    isLoading,
    isFetching,
    error,
    filters,
    handleFilterChange,
    resetFilters,
    activeFiltersCount,
    meta,
    nextPage,
    previousPage,
    hasNextPage,
    skillsData,
    isFetchingSkills,
    skillInputValue,
    handleSkillInputChange,
  } = useJobsFilter({
    itemsPerPage: 10,
  });

  const handleJobPress = (jobId: number) => {
    router.push(`/jobs/${jobId}`);
  };

  const handleLevelToggle = (level: string) => {
    const newLevels = filters.level?.includes(level)
      ? filters.level.filter((l) => l !== level)
      : [...(filters.level || []), level];
    handleFilterChange({ level: newLevels });
  };

  const handleWorkingTypeToggle = (type: string) => {
    const newTypes = filters.workingType?.includes(type)
      ? filters.workingType.filter((t) => t !== type)
      : [...(filters.workingType || []), type];
    handleFilterChange({ workingType: newTypes });
  };

  const handleProvinceToggle = (province: string) => {
    const newProvinces = filters.provinces?.includes(province)
      ? filters.provinces.filter((p) => p !== province)
      : [...(filters.provinces || []), province];
    handleFilterChange({ provinces: newProvinces });
  };

  const handleSkillToggle = (skill: string) => {
    const newSkills = filters.skills?.includes(skill)
      ? filters.skills.filter((s) => s !== skill)
      : [...(filters.skills || []), skill];
    handleFilterChange({ skills: newSkills });
  };

  const handleTabChange = (tab: 'all' | 'subscribers' | 'recommended') => {
    handleFilterChange({ activeTab: tab });
  };

  const renderJobItem = ({ item }: { item: Job }) => (
    <JobCard job={item} onPress={() => handleJobPress(item.jobId)} />
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.title}>Công Việc</Text>
      <Text style={styles.subtitle}>
        {filters.activeTab === 'all' && 'Tất cả cơ hội việc làm'}
        {filters.activeTab === 'subscribers' && 'Công việc theo dõi'}
        {filters.activeTab === 'recommended' && 'Công việc được đề xuất'}
      </Text>

      {/* Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabContainer}
        contentContainerStyle={styles.tabContent}
      >
        <TouchableOpacity
          style={[
            styles.tab,
            filters.activeTab === 'all' && styles.tabActive,
          ]}
          onPress={() => handleTabChange('all')}
        >
          <Text
            style={[
              styles.tabText,
              filters.activeTab === 'all' && styles.tabTextActive,
            ]}
          >
            Tất cả
          </Text>
        </TouchableOpacity>

        {isSignedIn && (
          <>
            <TouchableOpacity
              style={[
                styles.tab,
                filters.activeTab === 'subscribers' && styles.tabActive,
              ]}
              onPress={() => handleTabChange('subscribers')}
            >
              <Text
                style={[
                  styles.tabText,
                  filters.activeTab === 'subscribers' &&
                    styles.tabTextActive,
                ]}
              >
                Đang theo dõi
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tab,
                filters.activeTab === 'recommended' && styles.tabActive,
              ]}
              onPress={() => handleTabChange('recommended')}
            >
              <Text
                style={[
                  styles.tabText,
                  filters.activeTab === 'recommended' &&
                    styles.tabTextActive,
                ]}
              >
                Được đề xuất
              </Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>

      {/* Filter Button */}
      <View style={styles.filterButtonContainer}>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilter(!showFilter)}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <ChevronDown size={18} color="#374151" />
            <Text style={styles.filterButtonText}>
              Lọc ({activeFiltersCount})
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Filter Component */}
      {showFilter && (
        <JobFilter
          selectedLevels={filters.level || []}
          selectedWorkingTypes={filters.workingType || []}
          selectedProvinces={filters.provinces || []}
          selectedSkills={filters.skills || []}
          onLevelChange={handleLevelToggle}
          onWorkingTypeChange={handleWorkingTypeToggle}
          onProvinceChange={handleProvinceToggle}
          onSkillChange={handleSkillToggle}
          onReset={resetFilters}
          skills={skillsData}
          isFetchingSkills={isFetchingSkills}
          skillInputValue={skillInputValue}
          onSkillInputChange={handleSkillInputChange}
        />
      )}

      {meta && (
        <Text style={styles.resultCount}>
          {meta.total} việc làm • Trang {(meta as any).current ?? (meta as any).page ?? 1}/{meta.pages}
        </Text>
      )}
    </View>
  );

  const renderFooter = () => {
    const currentPage = (meta as any)?.current ?? (meta as any)?.page ?? 1;
    if (!isFetching || currentPage === 1) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color="#1976d2" />
        <Text style={styles.footerText}>Đang tải thêm...</Text>
      </View>
    );
  };

  const renderEmpty = () => {
    if (isLoading) return null;
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconContainer}>
          <MailOpen size={64} color="#d1d5db" />
        </View>
        <Text style={styles.emptyTitle}>Không Có Việc Làm</Text>
        <Text style={styles.emptyText}>
          {error
            ? 'Có lỗi xảy ra. Vui lòng thử lại sau.'
            : 'Không có việc làm nào phù hợp với bộ lọc của bạn.'}
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={resetFilters}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            {error ? (
              <RotateCw size={16} color="#374151" />
            ) : (
              <X size={16} color="#374151" />
            )}
            <Text style={styles.retryButtonText}>
              {error ? 'Tải lại' : 'Xóa lọc'}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1976d2" />
        <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
        <FlatList
          data={jobs}
          renderItem={renderJobItem}
          keyExtractor={(item) => item.jobId.toString()}
          ListHeaderComponent={renderHeader}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={renderEmpty}
          onEndReached={hasNextPage ? () => nextPage() : undefined}
          onEndReachedThreshold={0.5}
          refreshControl={
            <RefreshControl
              refreshing={isFetching && ((meta as any)?.current ?? (meta as any)?.page ?? 0) === 0}
              onRefresh={() => resetFilters()}
              colors={['#1976d2']}
              tintColor="#1976d2"
            />
          }
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280',
  },
  listContent: {
    padding: 16,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
  },
  tabContainer: {
    marginBottom: 12,
  },
  tabContent: {
    gap: 8,
    paddingEnd: 16,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#e5e7eb',
  },
  tabActive: {
    backgroundColor: '#1976d2',
  },
  tabText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#fff',
  },
  filterButtonContainer: {
    marginBottom: 12,
  },
  filterButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  resultCount: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 8,
  },
  footer: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  footerText: {
    marginTop: 8,
    fontSize: 14,
    color: '#6b7280',
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyIconContainer: {
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 32,
  },
  retryButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  retryButtonText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
});
