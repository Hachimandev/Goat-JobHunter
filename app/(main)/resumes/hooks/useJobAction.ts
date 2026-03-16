import { useLazyFetchUserByIdQuery } from '@/services/user/userApi';
import { useCallback } from 'react';

export const useJobAction = () => {
  const [fetchUserById, { isFetching: isFetchingUserById, isError: isFetchingUserByIdError }] =
    useLazyFetchUserByIdQuery();

  const getUserById = useCallback(
    async (userId: number) => {
      const response = await fetchUserById(String(userId));
      const userDetail = response.data?.data;
      return userDetail;
    },
    [fetchUserById],
  );

  return {
    getUserById,
    isFetchingUserById,
    isFetchingUserByIdError,
  };
};
