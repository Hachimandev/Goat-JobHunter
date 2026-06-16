import { useState, useMemo, useCallback } from 'react';
import { useFetchApplicationsByCurrentApplicantQuery } from '@/services/application/applicationApi';
import { useGetSavedJobsQuery } from '@/services/user/savedJobsApi';
import { useDownloadResumeMutation } from '@/services/resume/resumeApi';
import { toast } from 'sonner';

export interface UseMyJobFilterOptions {
  initialPage?: number;
  itemsPerPage?: number;
}

export const useMyJob = (options?: UseMyJobFilterOptions) => {
  const { initialPage = 1, itemsPerPage = 6 } = options || {};
  const [page, setPage] = useState(initialPage);
  const [mainTab, setMainTab] = useState<'saved' | 'applied'>('applied');

  const [downloadResume, { isLoading: isDownloading }] = useDownloadResumeMutation();

  const {
    data: appliedJobsResponse,
    isLoading: isLoadingAppliedJobs,
    isError: isErrorAppliedJobs,
  } = useFetchApplicationsByCurrentApplicantQuery(
    {
      page: page,
      size: itemsPerPage,
    },
    { skip: mainTab !== 'applied' },
  );

  const {
    data: savedJobsResponse,
    isLoading: isLoadingSavedJobs,
    isError: isErrorSavedJobs,
  } = useGetSavedJobsQuery(undefined, { skip: mainTab !== 'saved' });

  const myJobsResponse = mainTab === 'applied' ? appliedJobsResponse : savedJobsResponse;
  const isLoadingMyJobs = mainTab === 'applied' ? isLoadingAppliedJobs : isLoadingSavedJobs;
  const isErrorMyJobs = mainTab === 'applied' ? isErrorAppliedJobs : isErrorSavedJobs;

  const myJobs = useMemo(() => myJobsResponse?.data?.result || [], [myJobsResponse?.data?.result]);
  const meta = myJobsResponse?.data?.meta || {
    current: 1,
    pageSize: itemsPerPage,
    pages: 0,
    total: 0,
  };
  const totalPages = meta.pages;
  const totalItems = meta.total;

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setPage(page);
    }
  };
  const nextPage = () => {
    if (page < totalPages) {
      setPage((prev) => prev + 1);
    }
  };
  const previousPage = () => {
    if (page > 1) {
      setPage((prev) => prev - 1);
    }
  };
  const hasNextPage = page < totalPages;
  const hasPreviousPage = page > 1;

  const handleMainTabChange = (tab: string) => {
    setMainTab(tab as 'saved' | 'applied');
    setPage(1);
  };

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

  return {
    // State
    mainTab,
    meta,
    totalPages,
    totalItems,
    page,
    itemsPerPage,

    // Data
    myJobs,

    // Loading states
    isLoadingMyJobs,
    isErrorMyJobs,
    isDownloading,

    // Handlers
    handleMainTabChange,
    handleDownloadResume,
    goToPage,
    nextPage,
    previousPage,
    hasNextPage,
    hasPreviousPage,
  };
};
