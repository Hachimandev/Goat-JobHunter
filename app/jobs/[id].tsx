import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useFetchJobByIdQuery } from '../../services/job/jobApi';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import { stripHtmlTags } from '../../utils/stripHtmlTags';
import { Skill } from '../../types/model';

export default function JobDetailPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data, isLoading, error } = useFetchJobByIdQuery(id);

  const job = data?.data;

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1976d2" />
        <Text style={styles.loadingText}>Đang tải thông tin...</Text>
      </View>
    );
  }

  if (error || !job) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorTitle}>Có lỗi xảy ra</Text>
          <Text style={styles.errorText}>
            Có lỗi xảy ra khi tải thông tin công việc. Vui lòng thử lại sau hoặc quay lại trang việc làm.
          </Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>← Quay lại trang việc làm</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Back Button */}
        <TouchableOpacity 
          style={styles.backButtonTop} 
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonTopText}>← Quay lại trang việc làm</Text>
        </TouchableOpacity>

        {/* Job Header Card */}
        <View style={styles.card}>
          {/* Badges */}
          <View style={styles.badgesRow}>
            <View style={styles.levelBadge}>
              <Text style={styles.badgeText}>{job.level}</Text>
            </View>
            <View style={[styles.statusBadge, job.active ? styles.activeBadge : styles.inactiveBadge]}>
              <Text style={[styles.badgeText, job.active && styles.activeBadgeText]}>
                {job.active ? 'Đang tuyển' : 'Đã đóng'}
              </Text>
            </View>
            <View style={styles.workingTypeBadge}>
              <Text style={styles.badgeText}>{job.workingType}</Text>
            </View>
          </View>

          {/* Job Title */}
          <Text style={styles.jobTitle}>{job.title}</Text>

          {/* Company Name */}
          <Text style={styles.companyName}>{job.company.name}</Text>
        </View>

        {/* Job Info Grid Card */}
        <View style={styles.card}>
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.infoIcon}>💰</Text>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Lương</Text>
                <Text style={styles.infoValue}>{formatCurrency(job.salary)}</Text>
              </View>
            </View>

            <View style={styles.infoItem}>
              <Text style={styles.infoIcon}>📅</Text>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Ngày bắt đầu</Text>
                <Text style={styles.infoValue}>{formatDate(job.startDate)}</Text>
              </View>
            </View>

            <View style={styles.infoItem}>
              <Text style={styles.infoIcon}>⏰</Text>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Hạn nộp</Text>
                <Text style={styles.infoValue}>{formatDate(job.endDate)}</Text>
              </View>
            </View>

            <View style={styles.infoItem}>
              <Text style={styles.infoIcon}>👥</Text>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Số lượng</Text>
                <Text style={styles.infoValue}>{job.quantity} vị trí</Text>
              </View>
            </View>

            <View style={styles.infoItem}>
              <Text style={styles.infoIcon}>💼</Text>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Ngành nghề</Text>
                <Text style={styles.infoValue}>{job.career.name}</Text>
              </View>
            </View>

            <View style={styles.infoItem}>
              <Text style={styles.infoIcon}>📍</Text>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Địa điểm</Text>
                <Text style={styles.infoValue}>{job.address.fullAddress || job.address.province}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Description Card */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Mô Tả Công Việc</Text>
          <Text style={styles.description}>{stripHtmlTags(job.description)}</Text>
        </View>

        {/* Skills Card */}
        {job.skills && job.skills.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Kỹ Năng Yêu Cầu</Text>
            <View style={styles.skillsContainer}>
              {job.skills.map((skill: Skill) => (
                <View key={skill.skillId} style={styles.skillBadge}>
                  <Text style={styles.skillText}>{skill.name}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Apply Button */}
        <View style={styles.applyContainer}>
          <TouchableOpacity 
            style={[styles.applyButton, !job.active && styles.applyButtonDisabled]}
            disabled={!job.active}
          >
            <Text style={styles.applyButtonText}>
              {job.active ? '📨 Ứng Tuyển Ngay' : '❌ Đã Đóng'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpace} />
      </ScrollView>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  backButtonText: {
    fontSize: 14,
    color: '#1976d2',
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  backButtonTop: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButtonTopText: {
    fontSize: 14,
    color: '#1976d2',
    fontWeight: '500',
  },
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  levelBadge: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  activeBadge: {
    backgroundColor: '#1976d2',
    borderColor: '#1976d2',
  },
  inactiveBadge: {
    backgroundColor: '#fff',
  },
  workingTypeBadge: {
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  badgeText: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '500',
  },
  activeBadgeText: {
    color: '#fff',
  },
  jobTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
    lineHeight: 36,
  },
  companyName: {
    fontSize: 16,
    color: '#6b7280',
  },
  infoGrid: {
    gap: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoIcon: {
    fontSize: 20,
    marginRight: 12,
    marginTop: 2,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    color: '#111827',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 24,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillBadge: {
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  skillText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  applyContainer: {
    paddingHorizontal: 16,
    marginTop: 12,
  },
  applyButton: {
    backgroundColor: '#1976d2',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  applyButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  bottomSpace: {
    height: 24,
  },
});
