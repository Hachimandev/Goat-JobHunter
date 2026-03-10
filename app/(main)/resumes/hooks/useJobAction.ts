import { useFetchJobsAvailableQuery } from '@/services/job/jobApi';

export interface UseJobFilterOptions {
  companyId: number;
}

export const useJobAction = (options: UseJobFilterOptions) => {
  const { companyId } = options;

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
    jobs,
    isLoading,
    error,
  };
};
