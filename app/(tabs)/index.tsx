import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useFetchJobsAvailableQuery } from '../../services/job/jobApi';
import { JobCard } from '../../components/job/JobCard';
import { Job } from '../../types/model';

export default function Index() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [searchText, setSearchText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const { data, isLoading, isFetching, error, refetch } = useFetchJobsAvailableQuery({
    page,
    size: 10,
    title: searchQuery || undefined,
  });

  const jobs = data?.data?.result || [];
  const meta = data?.data?.meta;

  const handleSearch = () => {
    setSearchQuery(searchText);
    setPage(1);
  };

  const handleLoadMore = () => {
    if (meta && page < meta.pages && !isFetching) {
      setPage(page + 1);
    }
  };

  const handleJobPress = (jobId: number) => {
    router.push(`/jobs/${jobId}`);
  };

  const renderJobItem = ({ item }: { item: Job }) => (
    <JobCard job={item} onPress={() => handleJobPress(item.jobId)} />
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.title}>Công Việc Nổi Bật</Text>
      <Text style={styles.subtitle}>
        Những cơ hội việc làm mới nhất từ các công ty hàng đầu
      </Text>
      
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm việc làm..."
          placeholderTextColor="#9ca3af"
          value={searchText}
          onChangeText={setSearchText}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.searchButtonText}>🔍</Text>
        </TouchableOpacity>
      </View>

      {meta && (
        <Text style={styles.resultCount}>
          {meta.total} việc làm • Trang {meta.page}/{meta.pages}
        </Text>
      )}
    </View>
  );

  const renderFooter = () => {
    if (!isFetching || page === 1) return null;
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
        <Text style={styles.emptyIcon}>📭</Text>
        <Text style={styles.emptyTitle}>Không Có Việc Làm Nổi Bật</Text>
        <Text style={styles.emptyText}>
          {error ? 'Có lỗi xảy ra. Vui lòng thử lại sau.' : 'Không có việc làm nổi bật nào vào lúc này.'}
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
          <Text style={styles.retryButtonText}>🔄 Tải lại</Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (isLoading && page === 1) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1976d2" />
        <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={jobs}
        renderItem={renderJobItem}
        keyExtractor={(item) => item.jobId.toString()}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl
            refreshing={isFetching && page === 1}
            onRefresh={() => {
              setPage(1);
              refetch();
            }}
            colors={['#1976d2']}
            tintColor="#1976d2"
          />
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
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
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    height: 48,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    color: '#111827',
  },
  searchButton: {
    width: 48,
    height: 48,
    backgroundColor: '#1976d2',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  searchButtonText: {
    fontSize: 20,
  },
  resultCount: {
    fontSize: 14,
    color: '#6b7280',
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
