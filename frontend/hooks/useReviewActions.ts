import { useCreateReviewMutation } from '@/services/review/reviewApi';
import { useUser } from './useUser';
import { useCallback } from 'react';
import { ReviewFormData } from '@/app/(main)/companies/[id]/components/schema';
import { toast } from 'sonner';

export default function useReviewActions() {
    const { user } = useUser();

    const [createReview, { isLoading: isCreating, isError: isErrorCreating }] = useCreateReviewMutation();

    const handleCreateReview = useCallback(
        async (reviewData: ReviewFormData) => {
            try {
                if (!user?.accountId) {
                    toast.error('Bạn phải đăng nhập để thực hiện chức năng này.');
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
                    toast.success('Gửi đánh giá thành công!', {
                        description: `Đã gửi đánh giá cho công ty: ${reviewData.summary}`,
                    });
                    return response.data;
                }
            } catch (error) {
                toast.error(error instanceof Error ? error.message : 'Đã có lỗi xảy ra khi gửi đánh giá.');
                throw error;
            }
        },
        [user, createReview],
    );

    return {
        user,

        handleCreateReview,

        isCreating,
        isErrorCreating,
    };
}
