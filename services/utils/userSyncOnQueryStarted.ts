import { setUserIfNewer } from '@/lib/features/authSlice';
import { AuthUser } from '@/lib/features/authSyncTypes';
import { AppDispatch } from '@/lib/store';

type UserSyncOnQueryStartedOptions = {
  operation: string;
  force?: boolean;
};

type OnQueryStartedContext = {
  dispatch: AppDispatch;
  queryFulfilled: Promise<{
    data?: {
      data?: unknown;
    };
  }>;
};

export const createUserSyncOnQueryStarted =
  ({ operation, force = false }: UserSyncOnQueryStartedOptions) =>
  async (_: unknown, { dispatch, queryFulfilled }: OnQueryStartedContext) => {
    try {
      const { data } = await queryFulfilled;
      if (data?.data) {
        dispatch(setUserIfNewer({ user: data.data as AuthUser, force }));
      }
    } catch (error) {
      console.error(`Failed to ${operation}:`, error);
    }
  };
