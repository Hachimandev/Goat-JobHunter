import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { reviewSchema, ReviewFormData } from '@/schemas/reviewSchema';
import InteractiveStarRating from './InteractiveStarRating';
import { Company } from '@/types/model';

interface ReviewFormModalProps {
  visible: boolean;
  onClose: () => void;
  company: Company;
  onSubmit: (data: ReviewFormData) => Promise<void>;
  isLoading?: boolean;
}

const RATING_TYPES = [
  { key: 'salaryBenefits', label: 'Lương thưởng & Phúc lợi' },
  { key: 'trainingLearning', label: 'Đào tạo & Học hỏi' },
  { key: 'managementCaresAboutMe', label: 'Quản lý quan tâm nhân viên' },
  { key: 'cultureFun', label: 'Văn hóa & Vui vẻ' },
  { key: 'officeWorkspace', label: 'Văn phòng & Cơ sở vật chất' },
];

export default function ReviewFormModal({
  visible,
  onClose,
  company,
  onSubmit,
  isLoading = false,
}: ReviewFormModalProps) {
  const [showSuccess, setShowSuccess] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      overall: 0,
      salaryBenefits: 0,
      trainingLearning: 0,
      managementCaresAboutMe: 0,
      cultureFun: 0,
      officeWorkspace: 0,
      summary: '',
      experience: '',
      suggestion: '',
      recommended: undefined,
      companyId: company.accountId,
    },
  });

  const handleFormSubmit = async (data: ReviewFormData) => {
    try {
      await onSubmit(data);
      setShowSuccess(true);
      reset();
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể gửi đánh giá. Vui lòng thử lại.');
    }
  };

  const handleClose = () => {
    if (!showSuccess) {
      Alert.alert(
        'Xác nhận',
        'Bạn có chắc muốn đóng? Dữ liệu chưa lưu sẽ bị mất.',
        [
          { text: 'Hủy', style: 'cancel' },
          {
            text: 'Đóng',
            style: 'destructive',
            onPress: () => {
              reset();
              onClose();
            },
          },
        ]
      );
    } else {
      setShowSuccess(false);
      onClose();
    }
  };

  const handleBackToCompany = () => {
    setShowSuccess(false);
    onClose();
  };

  if (showSuccess) {
    return (
      <Modal visible={visible} animationType="fade" transparent>
        <View style={styles.successOverlay}>
          <View style={styles.successContainer}>
            <View style={styles.successIcon}>
              <Ionicons name="checkmark-circle" size={64} color="#10b981" />
            </View>
            <Text style={styles.successTitle}>Đánh giá thành công!</Text>
            <Text style={styles.successText}>
              Cảm ơn bạn đã đánh giá công ty {company.name}. Đánh giá của bạn sẽ giúp ích cho cộng đồng.
            </Text>
            <TouchableOpacity style={styles.successButton} onPress={handleBackToCompany}>
              <Text style={styles.successButtonText}>Quay lại trang công ty</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.header}>
            <View style={styles.headerContent}>
              <Text style={styles.title}>Đánh giá {company.name}</Text>
              <Text style={styles.subtitle}>
                Bạn chỉ mất 1 phút để hoàn thành bảng đánh giá này. Ý kiến của bạn sẽ giúp ích rất nhiều cho cộng đồng người đang tìm việc.
              </Text>
            </View>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Overall Rating */}
            <View style={styles.section}>
              <View style={styles.fieldHeader}>
                <Text style={styles.fieldLabel}>
                  Đánh giá chung <Text style={styles.required}>*</Text>
                </Text>
              </View>
              <Controller
                control={control}
                name="overall"
                render={({ field: { onChange, value } }) => (
                  <InteractiveStarRating value={value} onChange={onChange} size={40} />
                )}
              />
              {errors.overall && <Text style={styles.errorText}>{errors.overall.message}</Text>}
            </View>

            {/* Detailed Ratings */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Đánh giá chi tiết <Text style={styles.required}>*</Text>
              </Text>
              {RATING_TYPES.map((ratingType) => (
                <View key={ratingType.key} style={styles.ratingItem}>
                  <Text style={styles.ratingLabel}>{ratingType.label}</Text>
                  <Controller
                    control={control}
                    name={ratingType.key as keyof ReviewFormData}
                    render={({ field: { onChange, value } }) => (
                      <InteractiveStarRating value={value as number} onChange={onChange} size={28} />
                    )}
                  />
                  {errors[ratingType.key as keyof typeof errors] && (
                    <Text style={styles.errorText}>
                      {errors[ratingType.key as keyof typeof errors]?.message}
                    </Text>
                  )}
                </View>
              ))}
            </View>

            {/* Summary */}
            <View style={styles.section}>
              <Text style={styles.fieldLabel}>
                Tóm tắt <Text style={styles.required}>*</Text>
              </Text>
              <Text style={styles.fieldHint}>Tối thiểu 10 ký tự</Text>
              <Controller
                control={control}
                name="summary"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={styles.textInput}
                    value={value}
                    onChangeText={onChange}
                    placeholder="Nhập tóm tắt đánh giá..."
                    multiline
                    numberOfLines={2}
                  />
                )}
              />
              {errors.summary && <Text style={styles.errorText}>{errors.summary.message}</Text>}
            </View>

            {/* Experience */}
            <View style={styles.section}>
              <Text style={styles.fieldLabel}>
                Kinh nghiệm làm việc <Text style={styles.required}>*</Text>
              </Text>
              <Text style={styles.fieldHint}>Tối thiểu 50 ký tự</Text>
              <Controller
                control={control}
                name="experience"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={[styles.textInput, styles.textArea]}
                    value={value}
                    onChangeText={onChange}
                    placeholder="Mô tả kinh nghiệm làm việc của bạn tại công ty..."
                    multiline
                    numberOfLines={4}
                  />
                )}
              />
              {errors.experience && <Text style={styles.errorText}>{errors.experience.message}</Text>}
            </View>

            {/* Suggestion */}
            <View style={styles.section}>
              <Text style={styles.fieldLabel}>
                Đề xuất cải thiện <Text style={styles.required}>*</Text>
              </Text>
              <Text style={styles.fieldHint}>Tối thiểu 50 ký tự</Text>
              <Controller
                control={control}
                name="suggestion"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={[styles.textInput, styles.textArea]}
                    value={value}
                    onChangeText={onChange}
                    placeholder="Đề xuất của bạn để công ty cải thiện..."
                    multiline
                    numberOfLines={4}
                  />
                )}
              />
              {errors.suggestion && <Text style={styles.errorText}>{errors.suggestion.message}</Text>}
            </View>

            {/* Recommended */}
            <View style={styles.section}>
              <Text style={styles.fieldLabel}>
                Bạn có khuyến nghị bạn bè làm việc tại đây không? <Text style={styles.required}>*</Text>
              </Text>
              <Controller
                control={control}
                name="recommended"
                render={({ field: { onChange, value } }) => (
                  <View style={styles.radioGroup}>
                    <TouchableOpacity
                      style={[styles.radioButton, value === true && styles.radioButtonActive]}
                      onPress={() => onChange(true)}
                    >
                      <View style={[styles.radio, value === true && styles.radioActive]}>
                        {value === true && <View style={styles.radioInner} />}
                      </View>
                      <Text style={[styles.radioText, value === true && styles.radioTextActive]}>
                        Có
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.radioButton, value === false && styles.radioButtonActive]}
                      onPress={() => onChange(false)}
                    >
                      <View style={[styles.radio, value === false && styles.radioActive]}>
                        {value === false && <View style={styles.radioInner} />}
                      </View>
                      <Text style={[styles.radioText, value === false && styles.radioTextActive]}>
                        Không
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              />
              {errors.recommended && <Text style={styles.errorText}>{errors.recommended.message}</Text>}
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.resetButton}
                onPress={() => reset()}
                disabled={isLoading}
              >
                <Text style={styles.resetButtonText}>Xóa tất cả</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
                onPress={handleSubmit(handleFormSubmit)}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.submitButtonText}>Gửi đánh giá</Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerContent: {
    flex: 1,
    marginRight: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  fieldHeader: {
    marginBottom: 12,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  fieldHint: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 8,
  },
  required: {
    color: '#ef4444',
  },
  ratingItem: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  ratingLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: '#111827',
    backgroundColor: '#fff',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  errorText: {
    fontSize: 13,
    color: '#ef4444',
    marginTop: 4,
  },
  radioGroup: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
  },
  radioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    flex: 1,
  },
  radioButtonActive: {
    borderColor: '#1976d2',
    backgroundColor: '#eff6ff',
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#d1d5db',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioActive: {
    borderColor: '#1976d2',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#1976d2',
  },
  radioText: {
    fontSize: 15,
    color: '#6b7280',
    fontWeight: '500',
  },
  radioTextActive: {
    color: '#1976d2',
    fontWeight: '600',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  resetButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#d1d5db',
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  submitButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: '#1976d2',
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  successOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  successContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 32,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  successIcon: {
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  successText: {
    fontSize: 15,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  successButton: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: '#1976d2',
  },
  successButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

