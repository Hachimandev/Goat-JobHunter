import { useCallback } from 'react';
import { Alert } from 'react-native';
import { useCreateReviewMutation } from '@/services/review/reviewApi';
import { useAppSelector } from '@/lib/hooks';
import { ReviewFormData } from '@/schemas/reviewSchema';

export default function useReviewActions() {
  const user = useAppSelector((state) => state.auth.user);
  const [createReview, { isLoading: isCreating }] = useCreateReviewMutation();

  const handleCreateReview = useCallback(
    async (reviewData: ReviewFormData) => {
      try {
        if (!user?.accountId) {
          Alert.alert('Thông báo', 'Bạn phải đăng nhập để thực hiện chức năng này.');
          return;
        }

        const response = await createReview({
          rating: {
            overall: reviewData.overall,
            salaryBenefits: reviewData.salaryBenefits,
            trainingLearning: reviewData.trainingLearning,
            managementCaresAboutMe: reviewData.managementCaresAboutMe,
            cultureFun: reviewData.cultureFun,
            officeWorkspace: reviewData.officeWorkspace,
          },
          summary: reviewData.summary,
          experience: reviewData.experience,
          suggestion: reviewData.suggestion,
          recommended: reviewData.recommended,
          companyId: reviewData.companyId,
        }).unwrap();

        if (response.data) {
          return response.data;
        }
      } catch (error: any) {
        const errorMessage = error?.data?.message || 'Không thể gửi đánh giá. Vui lòng thử lại.';
        Alert.alert('Lỗi', errorMessage);
        throw error;
      }
    },
    [user, createReview]
  );

  return {
    handleCreateReview,
    isCreating,
  };
}

