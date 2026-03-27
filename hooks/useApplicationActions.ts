import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { useCreateApplicationMutation, useCountApplicationsByJobAndApplicantQuery } from '@/services/application/applicationApi';
import { useCreateResumeMutation, useFetchResumesByCurrentUserQuery } from '@/services/resume/resumeApi';
import type { CreateApplicationRequest } from '@/services/application/applicationType';
import type { FileUpload } from '@/services/upload/uploadType';

export const useApplicationActions = (jobId?: number) => {
  const [createApplication, { isLoading: isCreatingApplication }] = useCreateApplicationMutation();
  const [createResume, { isLoading: isCreatingResume }] = useCreateResumeMutation();
  
  const { data: resumesData, refetch: refetchResumes } = useFetchResumesByCurrentUserQuery(
    { page: 1, size: 100 },
    { skip: false }
  );

  const { data: countData, refetch: refetchCount } = useCountApplicationsByJobAndApplicantQuery(
    { jobId: jobId || 0 },
    { skip: !jobId }
  );

  const resumes = resumesData?.data?.result || [];
  const applicationCount = countData?.data?.submittedApplications || 0;

  const handleCreateApplication = useCallback(
    async (data: CreateApplicationRequest) => {
      try {
        const response = await createApplication(data).unwrap();
        
        // Refresh the application count
        if (jobId) {
          refetchCount();
        }
        
        Alert.alert(
          'Thành công',
          'Ứng tuyển thành công! Nhà tuyển dụng sẽ xem xét hồ sơ của bạn.'
        );
        
        return response;
      } catch (error: any) {
        const errorMessage = error?.data?.message || 'Không thể gửi đơn ứng tuyển. Vui lòng thử lại sau.';
        Alert.alert('Lỗi', errorMessage);
        throw error;
      }
    },
    [createApplication, jobId, refetchCount]
  );

  const handleUploadResume = useCallback(
    async (formData: FormData) => {
      try {
        const response = await createResume(formData).unwrap();
        
        // Refresh the resumes list
        refetchResumes();
        
        return response.data;
      } catch (error: any) {
        const errorMessage = error?.data?.message || 'Không thể tải lên CV. Vui lòng thử lại sau.';
        Alert.alert('Lỗi', errorMessage);
        throw error;
      }
    },
    [createResume, refetchResumes]
  );

  const isSubmitting = isCreatingApplication || isCreatingResume;

  return {
    resumes,
    applicationCount,
    handleCreateApplication,
    handleUploadResume,
    isSubmitting,
    isCreatingApplication,
    isCreatingResume,
  };
};
