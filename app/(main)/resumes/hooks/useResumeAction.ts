import { useUser } from '@/hooks/useUser';
import { useToggleAvailableStatusMutation } from '@/services/applicant/applicantApi';
import { useEvaluateResumeMutation, useFetchEvaluationResumesQuery } from '@/services/evaluation/evaluationApi';
import { useFetchJobsAvailableQuery, useFetchSuitableResumesForJobQuery } from '@/services/job/jobApi';
import {
  useCreateResumeMutation,
  useDefaultResumeMutation,
  useDeleteResumeMutation,
  useDownloadResumeMutation,
  usePrivateResumeMutation,
  usePublicResumeMutation,
  useUnDefaultResumeMutation,
  useUpdateTitleMutation,
} from '@/services/resume/resumeApi';
import { useFetchResumesByCurrentUserQuery } from '@/services/user/userApi';
import { Resume } from '@/types/model';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';

export interface UseResumeFilterOptions {
  initialPage?: number;
  itemsPerPage?: number;
  companyId?: number;
  jobId?: string | number;
}

export const useResumeAction = ({
  initialPage = 1,
  itemsPerPage = 6,
  companyId,
  jobId = '-1',
}: UseResumeFilterOptions = {}) => {
  const { user, isSignedIn } = useUser();
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null);
  const [evaluationPage, setEvaluationPage] = useState(1);
  const [evaluationPageSize, setEvaluationPageSize] = useState(6);

  const [toggleAvailableStatus, { isLoading: isTogglingAvailableStatus }] = useToggleAvailableStatusMutation();

  const [createResume, { isLoading: isCreating }] = useCreateResumeMutation();
  const [evaluateResume, { isLoading: isEvaluating }] = useEvaluateResumeMutation();
  const [deleteResume, { isLoading: isDeleting }] = useDeleteResumeMutation();
  const [updateTitle, { isLoading: isUpdatingTitle }] = useUpdateTitleMutation();
  const [defaultResume, { isLoading: isSettingDefault }] = useDefaultResumeMutation();
  const [unDefaultResume, { isLoading: isUnsettingDefault }] = useUnDefaultResumeMutation();
  const [publicResume, { isLoading: isSettingPublic }] = usePublicResumeMutation();
  const [privateResume, { isLoading: isSettingPrivate }] = usePrivateResumeMutation();
  const [downloadResume, { isLoading: isDownloading }] = useDownloadResumeMutation();

  const hasSelectedJob = !!jobId && String(jobId) !== '-1';
  const normalizedJobId = hasSelectedJob ? String(jobId) : undefined;

  const currentUserResumesQuery = useFetchResumesByCurrentUserQuery(
    {
      page: currentPage,
      size: itemsPerPage,
    },
    {
      skip: !isSignedIn || hasSelectedJob || !user,
    },
  );

  const suitableResumesQuery = useFetchSuitableResumesForJobQuery(
    {
      jobId: normalizedJobId,
      page: currentPage,
      size: itemsPerPage,
    },
    {
      skip: !normalizedJobId,
    },
  );

  const resumesData = hasSelectedJob ? suitableResumesQuery.data : currentUserResumesQuery.data;
  const isFetchingResumes = hasSelectedJob ? suitableResumesQuery.isLoading : currentUserResumesQuery.isLoading;
  const refetchResumes = hasSelectedJob ? suitableResumesQuery.refetch : currentUserResumesQuery.refetch;

  const {
    data: evaluationsData,
    isLoading: isFetchingEvaluations,
    refetch: refetchEvaluations,
  } = useFetchEvaluationResumesQuery(
    {
      resumeId: selectedResumeId!,
      page: evaluationPage,
      size: evaluationPageSize,
    },
    {
      skip: !selectedResumeId,
    },
  );

  const resumes = resumesData?.data?.result || [];
  const meta = resumesData?.data?.meta || {
    current: 1,
    pageSize: itemsPerPage,
    pages: 0,
    total: 0,
  };

  const evaluations = evaluationsData?.data?.result || [];
  const evaluationsMeta = evaluationsData?.data?.meta || {
    current: 1,
    pageSize: evaluationPageSize,
    pages: 0,
    total: 0,
  };

  const totalPages = meta.pages;
  const totalItems = meta.total;

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const previousPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const hasNextPage = currentPage < totalPages;
  const hasPreviousPage = currentPage > 1;

  const handleCreateResume = useCallback(
    async (formData: FormData) => {
      try {
        if (!isSignedIn || !user) {
          toast.error('Bạn phải đăng nhập để thực hiện chức năng này.');
          return;
        }

        const response = await createResume(formData).unwrap();

        if (response.data) {
          toast.success('Tải lên CV thành công!');
          await refetchResumes();
          return response.data;
        }
      } catch (error) {
        console.error('Failed to create resume:', error);
        toast.error('Không thể tải lên CV. Vui lòng thử lại sau.');
        throw error;
      }
    },
    [createResume, user, isSignedIn, refetchResumes],
  );

  const handleDeleteResume = useCallback(
    async (resumeId: string) => {
      try {
        if (!isSignedIn || !user) {
          toast.error('Bạn phải đăng nhập để thực hiện chức năng này.');
          return;
        }

        await deleteResume({ resumeId }).unwrap();
        toast.success('Xóa CV thành công!');
        await refetchResumes();
        return true;
      } catch (error) {
        console.error('Failed to delete resume:', error);
        toast.error('Không thể xóa CV. Vui lòng thử lại sau.');
        throw error;
      }
    },
    [deleteResume, user, isSignedIn, refetchResumes],
  );

  const handleUpdateTitle = useCallback(
    async (resumeId: number, title: string) => {
      try {
        if (!isSignedIn || !user) {
          toast.error('Bạn phải đăng nhập để thực hiện chức năng này.');
          return;
        }

        const response = await updateTitle({ resumeId, title }).unwrap();

        if (response.data) {
          toast.success('Cập nhật tiêu đề CV thành công!');
          await refetchResumes();
          return response.data;
        }
      } catch (error) {
        console.error('Failed to update resume title:', error);
        toast.error('Không thể cập nhật tiêu đề CV. Vui lòng thử lại sau.');
        throw error;
      }
    },
    [updateTitle, user, isSignedIn, refetchResumes],
  );

  const handleSetDefaultResume = useCallback(
    async (resumeId: string) => {
      try {
        if (!isSignedIn || !user) {
          toast.error('Bạn phải đăng nhập để thực hiện chức năng này.');
          return;
        }

        const response = await defaultResume({ resumeId }).unwrap();

        if (response.data) {
          toast.success('Đã đặt CV làm mặc định!');
          await refetchResumes();
          return response.data;
        }
      } catch (error) {
        console.error('Failed to set default resume:', error);
        toast.error('Không thể đặt CV làm mặc định. Vui lòng thử lại sau.');
        throw error;
      }
    },
    [defaultResume, user, isSignedIn, refetchResumes],
  );

  const handleUnsetDefaultResume = useCallback(
    async (resumeId: string) => {
      try {
        if (!isSignedIn || !user) {
          toast.error('Bạn phải đăng nhập để thực hiện chức năng này.');
          return;
        }

        const response = await unDefaultResume({ resumeId }).unwrap();

        if (response.data) {
          toast.success('Đã bỏ đặt CV mặc định!');
          await refetchResumes();
          return response.data;
        }
      } catch (error) {
        console.error('Failed to unset default resume:', error);
        toast.error('Không thể bỏ đặt CV mặc định. Vui lòng thử lại sau.');
        throw error;
      }
    },
    [unDefaultResume, user, isSignedIn, refetchResumes],
  );

  const handleToggleDefaultResume = useCallback(
    async (resumeId: string, isDefault: boolean) => {
      if (isDefault) {
        return handleUnsetDefaultResume(resumeId);
      } else {
        return handleSetDefaultResume(resumeId);
      }
    },
    [handleSetDefaultResume, handleUnsetDefaultResume],
  );

  const handleSetPublicResume = useCallback(
    async (resumeId: string) => {
      try {
        if (!isSignedIn || !user) {
          toast.error('Bạn phải đăng nhập để thực hiện chức năng này.');
          return;
        }

        const response = await publicResume({ resumeId }).unwrap();

        if (response.data) {
          toast.success('Đã công khai CV!');
          await refetchResumes();
          return response.data;
        }
      } catch (error) {
        console.error('Failed to set public resume:', error);
        toast.error('Không thể công khai CV. Vui lòng thử lại sau.');
        throw error;
      }
    },
    [publicResume, user, isSignedIn, refetchResumes],
  );

  const handleSetPrivateResume = useCallback(
    async (resumeId: string) => {
      try {
        if (!isSignedIn || !user) {
          toast.error('Bạn phải đăng nhập để thực hiện chức năng này.');
          return;
        }

        const response = await privateResume({ resumeId }).unwrap();

        if (response.data) {
          toast.success('Đã ẩn CV!');
          await refetchResumes();
          return response.data;
        }
      } catch (error) {
        console.error('Failed to set private resume:', error);
        toast.error('Không thể ẩn CV. Vui lòng thử lại sau.');
        throw error;
      }
    },
    [privateResume, user, isSignedIn, refetchResumes],
  );

  const handleTogglePublicResume = useCallback(
    async (resumeId: string, isPublic: boolean) => {
      if (isPublic) {
        return handleSetPrivateResume(resumeId);
      } else {
        return handleSetPublicResume(resumeId);
      }
    },
    [handleSetPublicResume, handleSetPrivateResume],
  );

  const handleDownloadResume = useCallback(
    async (resumeId: string, fileName: string) => {
      try {
        const response = await downloadResume(resumeId).unwrap();

        let fileExtension = fileName.split('.').pop()?.toLowerCase();

        if (!fileExtension || fileExtension === fileName || fileExtension.length > 5) {
          fileExtension = 'pdf';
        }

        const mimeTypes: Record<string, string> = {
          pdf: 'application/pdf',
          doc: 'application/msword',
          docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          png: 'image/png',
          jpg: 'image/jpeg',
          jpeg: 'image/jpeg',
        };

        const mimeType = mimeTypes[fileExtension] || 'application/octet-stream';
        const blob = new Blob([response], { type: mimeType });

        const finalFileName = fileName.includes('.') ? fileName : `${fileName}.${fileExtension}`;

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = finalFileName;
        document.body.appendChild(a);
        a.click();

        a.remove();
        URL.revokeObjectURL(url);

        toast.success('Tải CV thành công');
      } catch (e) {
        console.error('Download error:', e);
        toast.error('Không thể tải CV');
      }
    },
    [downloadResume],
  );

  const handleToggleAvailableStatus = useCallback(async () => {
    try {
      if (!isSignedIn || !user) {
        toast.error('Bạn phải đăng nhập để thực hiện chức năng này.');
        return;
      }

      const response = await toggleAvailableStatus().unwrap();

      if (response.data) {
        const newStatus = response.data.availableStatus;
        toast.success(newStatus ? 'Đã bật trạng thái sẵn sàng nhận việc!' : 'Đã tắt trạng thái sẵn sàng nhận việc!');
        return response.data;
      }
    } catch {
      toast.error('Không thể thay đổi trạng thái. Vui lòng thử lại sau.');
    }
  }, [toggleAvailableStatus, user, isSignedIn]);

  const getDefaultResume = useCallback((): Resume | undefined => {
    return resumesData?.data?.result?.find((resume) => resume.default);
  }, [resumesData]);

  const getPublicResumes = useCallback((): Resume[] => {
    return resumesData?.data?.result?.filter((resume) => resume.public) || [];
  }, [resumesData]);

  const handleEvaluateResume = useCallback(
    async (resumeUrl: string) => {
      try {
        if (!isSignedIn || !user) {
          toast.error('Bạn phải đăng nhập để thực hiện chức năng này.');
          return;
        }

        const response = await evaluateResume(resumeUrl).unwrap();

        if (response.data) {
          toast.success('Đánh giá CV thành công!');
          return response.data;
        }
      } catch (error) {
        console.error('Failed to evaluate resume:', error);
        toast.error('Không thể đánh giá CV. Vui lòng thử lại sau.');
        return undefined;
      }
    },
    [evaluateResume, user, isSignedIn],
  );

  const handleFetchEvaluations = useCallback((resumeId: string) => {
    setSelectedResumeId(resumeId);
    setEvaluationPage(1);
  }, []);

  const handleClearEvaluations = useCallback(() => {
    setSelectedResumeId(null);
    setEvaluationPage(1);
  }, []);

  const goToEvaluationPage = useCallback(
    (page: number) => {
      if (page >= 1 && page <= evaluationsMeta.pages) {
        setEvaluationPage(page);
      }
    },
    [evaluationsMeta.pages],
  );

  const nextEvaluationPage = useCallback(() => {
    if (evaluationPage < evaluationsMeta.pages) {
      setEvaluationPage((prev) => prev + 1);
    }
  }, [evaluationPage, evaluationsMeta.pages]);

  const previousEvaluationPage = useCallback(() => {
    if (evaluationPage > 1) {
      setEvaluationPage((prev) => prev - 1);
    }
  }, [evaluationPage]);

  const hasNextEvaluationPage = evaluationPage < evaluationsMeta.pages;
  const hasPreviousEvaluationPage = evaluationPage > 1;

  const setEvaluationsPageSize = useCallback((size: number) => {
    setEvaluationPageSize(size);
    setEvaluationPage(1);
  }, []);

  const { data, isLoading, error } = useFetchJobsAvailableQuery(
    {
      companyId,
    },
    {
      skip: companyId === -1,
    },
  );
  const jobs = data?.data?.result || [];

  return {
    // Data
    resumes,
    meta,
    totalPages,
    totalItems,
    currentPage,
    itemsPerPage,
    defaultResume: getDefaultResume(),
    publicResumes: getPublicResumes(),
    evaluations,
    evaluationsMeta,
    selectedResumeId,
    evaluationPage,
    evaluationPageSize,
    totalEvaluationPages: evaluationsMeta.pages,
    totalEvaluations: evaluationsMeta.total,
    jobs,
    isLoadingJobs: isLoading,
    errorJobs: error,

    // Loading states
    isFetchingResumes,
    isFetchingEvaluations,
    isCreating,
    isDeleting,
    isUpdatingTitle,
    isSettingDefault,
    isUnsettingDefault,
    isSettingPublic,
    isSettingPrivate,
    isDownloading,
    isTogglingAvailableStatus,
    isEvaluating,
    isProcessing:
      isCreating ||
      isDeleting ||
      isUpdatingTitle ||
      isSettingDefault ||
      isUnsettingDefault ||
      isSettingPublic ||
      isSettingPrivate ||
      isDownloading ||
      isTogglingAvailableStatus ||
      isEvaluating,

    // Actions
    handleCreateResume,
    handleDeleteResume,
    handleUpdateTitle,
    handleSetDefaultResume,
    handleUnsetDefaultResume,
    handleToggleDefaultResume,
    handleSetPublicResume,
    handleSetPrivateResume,
    handleTogglePublicResume,
    handleDownloadResume,
    handleToggleAvailableStatus,
    handleEvaluateResume,
    handleFetchEvaluations,
    handleClearEvaluations,
    setEvaluationsPageSize,
    refetchResumes,
    refetchEvaluations,

    // Pagination
    goToPage,
    nextPage,
    previousPage,
    hasNextPage,
    hasPreviousPage,
    goToEvaluationPage,
    nextEvaluationPage,
    previousEvaluationPage,
    hasNextEvaluationPage,
    hasPreviousEvaluationPage,
  };
};
