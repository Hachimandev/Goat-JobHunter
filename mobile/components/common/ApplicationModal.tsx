import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  FlatList,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { useApplicationActions } from '@/hooks/useApplicationActions';
import { useUser } from '@/hooks/useUser';
import type { CreateApplicationRequest } from '@/services/application/applicationType';
import type { Resume } from '@/services/resume/resumeType';
import { X, FolderOpen, FileText } from 'lucide-react-native';

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

type ApplicationFormData = {
  email: string;
  coverLetter: string;
  resumeSelectionType: 'library' | 'upload';
  resumeId?: number;
};

interface ApplicationModalProps {
  visible: boolean;
  onClose: () => void;
  jobId: number;
  jobTitle: string;
}

export default function ApplicationModal({
  visible,
  onClose,
  jobId,
  jobTitle,
}: ApplicationModalProps) {
  const { user } = useUser();
  const { resumes, isSubmitting, handleCreateApplication, handleUploadResume } = useApplicationActions(jobId);

  const [formData, setFormData] = useState<ApplicationFormData>({
    email: user?.email || '',
    coverLetter: '',
    resumeSelectionType: 'library',
  });

  const [uploadedFile, setUploadedFile] = useState<any>(null);
  const [selectedResumeId, setSelectedResumeId] = useState<number | undefined>(undefined);
  const [isValidating, setIsValidating] = useState(false);

  // Filter public resumes
  const publicResumes = useMemo(() => {
    return resumes.filter((r: Resume) => r.public);
  }, [resumes]);

  // Validate email
  const isValidEmail = useCallback((email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }, []);

  // Validate cover letter length
  const isValidCoverLetter = useCallback((text: string) => {
    return text.trim().length >= 50;
  }, []);

  const handleFilePickerPress = useCallback(async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const fileName = asset.name || asset.uri.split('/').pop();

        // Check file name exists
        if (!fileName) {
          Alert.alert('Lỗi', 'Không thể lấy tên file');
          return;
        }

        // Check file size
        if (asset.size && asset.size > MAX_FILE_SIZE) {
          Alert.alert('Lỗi', 'Kích thước file không được vượt quá 2MB');
          return;
        }

        // Check file type
        const validTypes = ['pdf', 'doc', 'docx'];
        const fileExtension = fileName.split('.').pop()?.toLowerCase() || '';
        if (!validTypes.includes(fileExtension)) {
          Alert.alert('Lỗi', 'Chỉ chấp nhận file PDF, DOC, DOCX');
          return;
        }

        setUploadedFile({
          uri: asset.uri,
          name: fileName,
          size: asset.size || 0,
          type: asset.mimeType || 'application/octet-stream',
        });
      }
    } catch (error: any) {
      console.error('Error picking file:', error);
      Alert.alert('Lỗi', 'Không thể chọn file. Vui lòng thử lại.');
    }
  }, []);

  const handleResumeSelect = (resumeId: number) => {
    setSelectedResumeId(resumeId);
  };

  const removeFile = () => {
    setUploadedFile(null);
  };

  const handleSubmit = async () => {
    // Validate email
    if (!isValidEmail(formData.email)) {
      Alert.alert('Lỗi', 'Email không hợp lệ');
      return;
    }

    // Validate cover letter
    if (!isValidCoverLetter(formData.coverLetter)) {
      Alert.alert('Lỗi', 'Thư giới thiệu phải có ít nhất 50 ký tự');
      return;
    }

    // Validate resume selection
    let finalResumeId: number | undefined;

    if (formData.resumeSelectionType === 'upload') {
      if (!uploadedFile) {
        Alert.alert('Lỗi', 'Vui lòng tải lên CV của bạn');
        return;
      }

      // Upload the resume first
      setIsValidating(true);
      try {
        const uploadFormData = new FormData();
        uploadFormData.append('fileUrl', {
          uri: uploadedFile.uri,
          type: uploadedFile.type || 'application/octet-stream',
          name: uploadedFile.name,
        } as any);

        const uploadedResume = await handleUploadResume(uploadFormData);
        finalResumeId = uploadedResume?.resumeId;

        if (!finalResumeId) {
          Alert.alert('Lỗi', 'Không thể tải lên CV. Vui lòng thử lại');
          return;
        }
      } catch (error) {
        return; // Error is already handled in handleUploadResume
      } finally {
        setIsValidating(false);
      }
    } else {
      finalResumeId = selectedResumeId;
    }

    if (!finalResumeId) {
      Alert.alert('Lỗi', 'Vui lòng chọn hoặc tải lên CV');
      return;
    }

    // Submit the application
    try {
      const applicationData: CreateApplicationRequest = {
        email: formData.email,
        coverLetter: formData.coverLetter,
        jobId,
        resumeId: finalResumeId,
      };

      await handleCreateApplication(applicationData);

      // Reset form
      setFormData({
        email: user?.email || '',
        coverLetter: '',
        resumeSelectionType: 'library',
      });
      setUploadedFile(null);
      setSelectedResumeId(undefined);

      onClose();
    } catch (error) {
      // Error is already handled in handleCreateApplication
    }
  };

  const handleClose = () => {
    // Reset form
    setFormData({
      email: user?.email || '',
      coverLetter: '',
      resumeSelectionType: 'library',
    });
    setUploadedFile(null);
    setSelectedResumeId(undefined);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={handleClose}
      transparent={false}
    >
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <X size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.title} numberOfLines={2}>
            Ứng tuyển {jobTitle}
          </Text>
          <View style={styles.placeholder} />
        </View>

        {/* Form Content */}
        <ScrollView 
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Email Field */}
          <View style={styles.section}>
            <Text style={styles.label}>📧 Email liên hệ</Text>
            <TextInput
              style={styles.input}
              placeholder="your@email.com"
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              editable={!isSubmitting}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {formData.email && !isValidEmail(formData.email) && (
              <Text style={styles.errorText}>Email không hợp lệ</Text>
            )}
          </View>

          {/* Resume Selection */}
          <View style={styles.section}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <FileText size={18} color="#111827" />
              <Text style={styles.label}>Chọn CV để Ứng tuyển</Text>
            </View>

            {/* Radio: Use from library */}
            <TouchableOpacity
              style={styles.radioContainer}
              onPress={() => setFormData({ ...formData, resumeSelectionType: 'library' })}
            >
              <View style={[
                styles.radioButton,
                formData.resumeSelectionType === 'library' && styles.radioButtonSelected,
              ]}>
                {formData.resumeSelectionType === 'library' && <View style={styles.radioButtonDot} />}
              </View>
              <Text style={styles.radioLabel}>Chọn CV khác trong thư viện CV của tôi</Text>
            </TouchableOpacity>

            {formData.resumeSelectionType === 'library' && (
              <View style={styles.resumeListContainer}>
                {publicResumes.length > 0 ? (
                  <FlatList
                    scrollEnabled={false}
                    data={publicResumes}
                    keyExtractor={(item) => item.resumeId.toString()}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={[
                          styles.resumeItem,
                          selectedResumeId === item.resumeId && styles.resumeItemSelected,
                        ]}
                        onPress={() => handleResumeSelect(item.resumeId)}
                      >
                        <View style={[
                          styles.resumeCheckbox,
                          selectedResumeId === item.resumeId && styles.resumeCheckboxSelected,
                        ]}>
                          {selectedResumeId === item.resumeId && <Text style={styles.checkmark}>✓</Text>}
                        </View>
                        <Text style={styles.resumeName}>{item.title}</Text>
                      </TouchableOpacity>
                    )}
                  />
                ) : (
                  <Text style={styles.noResumesText}>Bạn chưa có CV nào trong thư viện</Text>
                )}
              </View>
            )}

            {/* Radio: Upload new */}
            <TouchableOpacity
              style={styles.radioContainer}
              onPress={() => setFormData({ ...formData, resumeSelectionType: 'upload' })}
            >
              <View style={[
                styles.radioButton,
                formData.resumeSelectionType === 'upload' && styles.radioButtonSelected,
              ]}>
                {formData.resumeSelectionType === 'upload' && <View style={styles.radioButtonDot} />}
              </View>
              <Text style={styles.radioLabel}>Tải lên CV từ thiết bị</Text>
            </TouchableOpacity>

            {formData.resumeSelectionType === 'upload' && (
              <View style={styles.uploadContainer}>
                {!uploadedFile ? (
                  <TouchableOpacity
                    style={styles.uploadButton}
                    onPress={handleFilePickerPress}
                    disabled={isSubmitting || isValidating}
                  >
                    <FolderOpen size={24} color="#1976d2" style={styles.uploadButtonIcon} />
                    <Text style={styles.uploadButtonText}>Chọn CV</Text>
                    <Text style={styles.uploadHintText}>PDF, DOC, DOCX - Tối đa 2MB</Text>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.uploadedFileContainer}>
                    <FileText size={18} color="#6b7280" style={styles.uploadedFileIcon} />
                    <View style={styles.uploadedFileInfo}>
                      <Text style={styles.uploadedFileName} numberOfLines={1}>
                        {uploadedFile.name || 'File'}
                      </Text>
                      <Text style={styles.uploadedFileSize}>
                        {uploadedFile.size ? `${(uploadedFile.size / 1024).toFixed(2)} KB` : 'N/A'}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={removeFile}
                      disabled={isSubmitting || isValidating}
                      style={styles.removeFileButton}
                    >
                      <X size={18} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}
          </View>

          {/* Cover Letter */}
          <View style={styles.section}>
            <Text style={styles.label}>
              🍃 Thư giới thiệu
              <Text style={styles.charCount}>
                ({formData.coverLetter.length}/50 tối thiểu)
              </Text>
            </Text>
            <TextInput
              style={[
                styles.textarea,
                !isValidCoverLetter(formData.coverLetter) && formData.coverLetter.length > 0 && styles.textareaError,
              ]}
              placeholder="Một thư giới thiệu ngắn gọn, chỉn chu sẽ giúp bạn trở nên chuyên nghiệp..."
              value={formData.coverLetter}
              onChangeText={(text) => setFormData({ ...formData, coverLetter: text })}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              editable={!isSubmitting}
            />
            {formData.coverLetter.length > 0 && !isValidCoverLetter(formData.coverLetter) && (
              <Text style={styles.errorText}>
                Thư giới thiệu phải có ít nhất 50 ký tự (còn thiếu {50 - formData.coverLetter.length} ký tự)
              </Text>
            )}
          </View>
        </ScrollView>

        {/* Footer Buttons */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={handleClose}
            disabled={isSubmitting || isValidating}
          >
            <Text style={styles.cancelButtonText}>Hủy</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.button,
              styles.submitButton,
              (isSubmitting || isValidating) && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={isSubmitting || isValidating}
          >
            {isSubmitting || isValidating ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>📨 Nộp Đơn</Text>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 24,
    color: '#6b7280',
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginHorizontal: 12,
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  charCount: {
    fontSize: 12,
    fontWeight: '400',
    color: '#9ca3af',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#111827',
    backgroundColor: '#fff',
  },
  textarea: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#111827',
    backgroundColor: '#fff',
    minHeight: 120,
  },
  textareaError: {
    borderColor: '#ef4444',
  },
  errorText: {
    fontSize: 12,
    color: '#ef4444',
    marginTop: 4,
  },
  radioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#d1d5db',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  radioButtonSelected: {
    borderColor: '#10b981',
  },
  radioButtonDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10b981',
  },
  radioLabel: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
  },
  resumeListContainer: {
    backgroundColor: '#f0fdf4',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#10b981',
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 12,
  },
  resumeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
    marginBottom: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#fff',
  },
  resumeItemSelected: {
    borderColor: '#10b981',
    backgroundColor: '#f0fdf4',
  },
  resumeCheckbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#d1d5db',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  resumeCheckboxSelected: {
    borderColor: '#10b981',
    backgroundColor: '#10b981',
  },
  checkmark: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  resumeName: {
    flex: 1,
    fontSize: 13,
    color: '#111827',
  },
  noResumesText: {
    fontSize: 13,
    color: '#9ca3af',
    textAlign: 'center',
    paddingVertical: 12,
  },
  uploadContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 12,
    marginTop: 8,
  },
  uploadButton: {
    borderStyle: 'dashed',
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadButtonIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  uploadButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10b981',
    marginBottom: 4,
  },
  uploadHintText: {
    fontSize: 12,
    color: '#9ca3af',
  },
  uploadedFileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
  },
  uploadedFileIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  uploadedFileInfo: {
    flex: 1,
  },
  uploadedFileName: {
    fontSize: 13,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 2,
  },
  uploadedFileSize: {
    fontSize: 11,
    color: '#9ca3af',
  },
  removeFileButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#fee2e2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeFileIcon: {
    fontSize: 16,
    color: '#dc2626',
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  submitButton: {
    backgroundColor: '#10b981',
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
});
