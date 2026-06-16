import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useFetchJobByIdQuery, useFetchRelatedJobsQuery } from '../../services/job/jobApi';
import { useCheckSavedJobsQuery } from '../../services/user/savedJobsApi';
import { useJobActions } from '../../hooks/useJobActions';
import { useUser } from '../../hooks/useUser';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import { stripHtmlTags } from '../../utils/stripHtmlTags';
import ApplicationModal from '../../components/common/ApplicationModal';
import { JobCard } from '../../components/job/JobCard';
import { Skill } from '../../types/model';
import { AlertTriangle, Heart, Calendar, Clock, Users, Briefcase, MapPin, ChevronDown, ChevronUp, ArrowLeft, DollarSign } from 'lucide-react-native';

export default function JobDetailPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data, isLoading, error } = useFetchJobByIdQuery(id);
  const { handleToggleSaveJob } = useJobActions();
  const { user, isSignedIn } = useUser();
  
  // State for description expand/collapse
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [isApplicationModalOpen, setIsApplicationModalOpen] = useState(false);
  
  // Check if job is saved
  const { data: checkSavedJobData } = useCheckSavedJobsQuery(
    { jobIds: id ? [Number(id)] : [] },
    { skip: !id }
  );

  const isSaved = useMemo(() => {
    if (checkSavedJobData && id) {
      return checkSavedJobData.data?.find((savedJob) => savedJob.jobId === Number(id))?.result || false;
    }
    return false;
  }, [checkSavedJobData, id]);

  const job = data?.data;

  // Fetch related jobs based on skills
  const skillIds = useMemo(() => {
    return job?.skills?.map((skill) => skill.skillId) || [];
  }, [job?.skills]);

  const {
    data: relatedJobsData,
    isLoading: isLoadingRelated,
  } = useFetchRelatedJobsQuery(
    {
      skills: skillIds,
      page: 1,
      size: 6,
    },
    {
      skip: !job || skillIds.length === 0,
    }
  );

  const relatedJobs = useMemo(() => {
    const allRelatedJobs = relatedJobsData?.data?.result || [];
    // Filter out the current job
    return allRelatedJobs.filter((j) => j.jobId !== Number(id));
  }, [relatedJobsData, id]);

  const handleApplyPress = () => {
    if (!isSignedIn) {
      Alert.alert(
        'Chưa đăng nhập',
        'Vui lòng đăng nhập để ứng tuyển.',
        [
          {
            text: 'Hủy',
            onPress: () => {},
            style: 'cancel',
          },
          {
            text: 'Đăng nhập',
            onPress: () => router.push('/(auth)/signin'),
          },
        ]
      );
      return;
    }

    setIsApplicationModalOpen(true);
  };

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
          <AlertTriangle size={64} color="#ef4444" />
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
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <ArrowLeft size={18} color="#1976d2" />
            <Text style={styles.backButtonTopText}>Quảy lại trang việc làm</Text>
          </View>
        </TouchableOpacity>

        {/* Job Header Card */}
        <View style={styles.card}>
          {/* Save Button Row */}
          <View style={styles.saveButtonRow}>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={() => job && handleToggleSaveJob(job, isSaved)}
            >
              <Heart 
                size={18} 
                color={isSaved ? "#ef4444" : "#d1d5db"} 
                fill={isSaved ? "#ef4444" : "none"}
              />
              <Text style={styles.saveButtonText}>
                {isSaved ? 'Đã lưu' : 'Lưu việc'}
              </Text>
            </TouchableOpacity>
          </View>

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
              <DollarSign size={18} color="#6b7280" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Lương</Text>
                <Text style={styles.infoValue}>{formatCurrency(job.salary)}</Text>
              </View>
            </View>

            <View style={styles.infoItem}>
              <Calendar size={18} color="#6b7280" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Ngày bắt đầu</Text>
                <Text style={styles.infoValue}>{formatDate(job.startDate)}</Text>
              </View>
            </View>

            <View style={styles.infoItem}>
              <Clock size={18} color="#6b7280" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Hạn nộp</Text>
                <Text style={styles.infoValue}>{formatDate(job.endDate)}</Text>
              </View>
            </View>

            <View style={styles.infoItem}>
              <Users size={18} color="#6b7280" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Số lượng</Text>
                <Text style={styles.infoValue}>{job.quantity} vị trí</Text>
              </View>
            </View>

            <View style={styles.infoItem}>
              <Briefcase size={18} color="#6b7280" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Ngành nghề</Text>
                <Text style={styles.infoValue}>{job.career.name}</Text>
              </View>
            </View>

            <View style={styles.infoItem}>
              <MapPin size={18} color="#6b7280" />
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
          <Text 
            style={styles.description}
            numberOfLines={isDescriptionExpanded ? undefined : 5}
          >
            {stripHtmlTags(job.description)}
          </Text>
          {/* Show read more button if description is long (> 200 characters) */}
          {stripHtmlTags(job.description).length > 200 && (
            <TouchableOpacity 
              onPress={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
              style={styles.readMoreButton}
            >
              {isDescriptionExpanded ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <ChevronUp size={16} color="#1976d2" />
                  <Text style={styles.readMoreText}>Thu gọn</Text>
                </View>
              ) : (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <ChevronDown size={16} color="#1976d2" />
                  <Text style={styles.readMoreText}>Xem thêm</Text>
                </View>
              )}
            </TouchableOpacity>
          )}
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

        {/* Related Jobs Card */}
        {relatedJobs.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Công Việc Liên Quan</Text>
            <FlatList
              data={relatedJobs}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={styles.relatedJobCard}
                  onPress={() => {
                    router.push(`/jobs/${item.jobId}`);
                  }}
                >
                  <View style={styles.relatedJobHeader}>
                    <Text style={styles.relatedJobTitle} numberOfLines={2}>
                      {item.title}
                    </Text>
                    <Text style={styles.relatedJobLevel}>{item.level}</Text>
                  </View>
                  <Text style={styles.relatedJobCompany} numberOfLines={1}>
                    {item.company.name}
                  </Text>
                  <View style={styles.relatedJobFooter}>
                    <Text style={styles.relatedJobSalary}>
                      {formatCurrency(item.salary)}
                    </Text>
                    <Text style={styles.relatedJobType}>{item.workingType}</Text>
                  </View>
                </TouchableOpacity>
              )}
              keyExtractor={(item) => item.jobId.toString()}
              scrollEnabled={false}
            />
            {isLoadingRelated && (
              <View style={styles.relatedJobsLoading}>
                <ActivityIndicator size="small" color="#1976d2" />
              </View>
            )}
          </View>
        )}

        {/* Apply Button */}
        <View style={styles.applyContainer}>
          <TouchableOpacity 
            style={[styles.applyButton, !job.active && styles.applyButtonDisabled]}
            disabled={!job.active}
            onPress={handleApplyPress}
          >
            <Text style={styles.applyButtonText}>
              {job.active ? '📨 Ứng Tuyển Ngay' : '❌ Đã Đóng'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpace} />
      </ScrollView>

      {/* Application Modal */}
      <ApplicationModal
        visible={isApplicationModalOpen}
        onClose={() => setIsApplicationModalOpen(false)}
        jobId={job.jobId}
        jobTitle={job.title}
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
  saveButtonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 12,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  saveButtonIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
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
  readMoreButton: {
    marginTop: 12,
    paddingVertical: 8,
    alignItems: 'center',
  },
  readMoreText: {
    fontSize: 14,
    color: '#1976d2',
    fontWeight: '600',
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
  relatedJobCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  relatedJobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  relatedJobTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
    marginRight: 8,
  },
  relatedJobLevel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#fff',
    backgroundColor: '#1976d2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  relatedJobCompany: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 8,
  },
  relatedJobFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  relatedJobSalary: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1976d2',
  },
  relatedJobType: {
    fontSize: 12,
    color: '#6b7280',
  },
  relatedJobsLoading: {
    paddingVertical: 12,
    alignItems: 'center',
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
