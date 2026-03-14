import { useFetchJobsAvailableQuery } from '@/services/job/jobApi';
import { useLazyFetchUserByIdQuery } from '@/services/user/userApi';
import { useCallback } from 'react';

export interface UseJobFilterOptions {
  companyId: number;
}

export const useJobAction = (options: UseJobFilterOptions) => {
  const { companyId } = options;
  const [fetchUserById, { isFetching: isFetchingUserById, isError: isFetchingUserByIdError }] =
    useLazyFetchUserByIdQuery();

  const { data, isLoading, error } = useFetchJobsAvailableQuery(
    {
      companyId,
    },
    {
      skip: companyId === -1,
    },
  );

  const jobs = data?.data?.result || [];

  const getUserById = useCallback(
    async (userId: number) => {
      const response = await fetchUserById(String(userId));
      const userDetail = response.data?.data;
      return userDetail;
    },
    [fetchUserById],
  );

  return {
    jobs,
    isLoading,
    error,
    getUserById,
    isFetchingUserById,
    isFetchingUserByIdError,
  };
};
