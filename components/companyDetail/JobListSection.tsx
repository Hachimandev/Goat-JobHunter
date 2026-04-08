import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { Job } from '@/types/model';
import { Link } from 'expo-router';
import { DollarSign, MapPin, TrendingUp, ChevronRight } from 'lucide-react-native';

interface JobListSectionProps {
  jobs: Job[];
  isLoading: boolean;
  isError: boolean;
  savedJobs: {
    jobId: number;
    result: boolean;
  }[];
}

export default function JobListSection({ jobs, isLoading, isError, savedJobs }: JobListSectionProps) {
  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Việc làm đang tuyển dụng</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1976d2" />
        </View>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Việc làm đang tuyển dụng</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>Có lỗi xảy ra</Text>
          <Text style={styles.emptyDescription}>Không thể tải danh sách việc làm</Text>
        </View>
      </View>
    );
  }

  if (jobs.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Việc làm đang tuyển dụng</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>Chưa có việc làm</Text>
          <Text style={styles.emptyDescription}>
            Công ty chưa có việc làm đang tuyển dụng nào vào lúc này
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{jobs.length} việc làm đang tuyển dụng</Text>
      </View>
      <ScrollView style={styles.jobList} showsVerticalScrollIndicator={false}>
        {jobs.map((job) => (
          <Link key={job.jobId} href={`/jobs/${job.jobId}`} asChild>
            <TouchableOpacity style={styles.jobCard}>
              <Text style={styles.jobTitle} numberOfLines={2}>
                {job.title}
              </Text>
              <View style={styles.jobInfo}>
                {job.salary && (
                  <View style={styles.infoRow}>
                    <DollarSign size={14} color="#6b7280" />
                    <Text style={styles.infoText}>
                      {job.salary.toLocaleString()} VND
                    </Text>
                  </View>
                )}
                {job.address && (
                  <View style={styles.infoRow}>
                    <MapPin size={14} color="#6b7280" />
                    <Text style={styles.infoText} numberOfLines={1}>
                      {job.address.fullAddress}
                    </Text>
                  </View>
                )}
                {job.level && (
                  <View style={styles.infoRow}>
                    <TrendingUp size={14} color="#6b7280" />
                    <Text style={styles.infoText}>{job.level}</Text>
                  </View>
                )}
              </View>
              <View style={styles.footer}>
                <ChevronRight size={16} color="#1976d2" />
              </View>
            </TouchableOpacity>
          </Link>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
    marginBottom: 16,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  jobList: {
    maxHeight: 600,
  },
  jobCard: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    lineHeight: 22,
  },
  jobInfo: {
    gap: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoText: {
    fontSize: 14,
    color: '#6b7280',
    flex: 1,
  },
  footer: {
    alignItems: 'flex-end',
    marginTop: 8,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
});

