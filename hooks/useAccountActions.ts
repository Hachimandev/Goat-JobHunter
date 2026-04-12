import {
  useActivateAccountsMutation,
  useDeactivateAccountsMutation,
  useLockedAccountsMutation,
  useUnlockedAccountsMutation,
} from '@/services/admin/adminApi';
import { useCallback } from 'react';
import { toast } from 'sonner';

export default function useAccountActions() {
  const [lockedMutate, { isLoading: isLocking }] = useLockedAccountsMutation();
  const [unlockedMutate, { isLoading: isUnlocking }] = useUnlockedAccountsMutation();
  const [activateMutate, { isLoading: isActivating }] = useActivateAccountsMutation();
  const [deactivateMutate, { isLoading: isDeactivating }] = useDeactivateAccountsMutation();

  const lockedAccounts = useCallback(
    async (accountIds: number[]) => {
      if (!accountIds.length) {
        toast.error('Vui lòng chọn ít nhất một tài khoản để khóa.');
        return;
      }
      try {
        await lockedMutate({ accountIds }).unwrap();
        toast.success('Khóa tài khoản thành công.');
      } catch (error) {
        console.error(error);
        toast.error('Có lỗi xảy ra khi khóa tài khoản. Vui lòng thử lại sau.');
      }
    },
    [lockedMutate],
  );

  const unlockedAccounts = useCallback(
    async (accountIds: number[]) => {
      if (!accountIds.length) {
        toast.error('Vui lòng chọn ít nhất một tài khoản để mở khóa.');
        return;
      }
      try {
        await unlockedMutate({ accountIds }).unwrap();
        toast.success('Mở khóa tài khoản thành công.');
      } catch (error) {
        console.error(error);
        toast.error('Có lỗi xảy ra khi mở khóa tài khoản. Vui lòng thử lại sau.');
      }
    },
    [unlockedMutate],
  );

  const activateAccounts = useCallback(
    async (accountIds: number[]) => {
      if (!accountIds.length) {
        toast.error('Vui lòng chọn ít nhất một tài khoản để kích hoạt.');
        return;
      }
      try {
        await activateMutate({ accountIds }).unwrap();
        toast.success('Kích hoạt tài khoản thành công.');
      } catch (error) {
        console.error(error);
        toast.error('Có lỗi xảy ra khi kích hoạt tài khoản. Vui lòng thử lại sau.');
      }
    },
    [activateMutate],
  );

  const deactivateAccounts = useCallback(
    async (accountIds: number[]) => {
      if (!accountIds.length) {
        toast.error('Vui lòng chọn ít nhất một tài khoản để vô hiệu hóa.');
        return;
      }
      try {
        await deactivateMutate({ accountIds }).unwrap();
        toast.success('Vô hiệu hóa tài khoản thành công.');
      } catch (error) {
        console.error(error);
        toast.error('Có lỗi xảy ra khi vô hiệu hóa tài khoản. Vui lòng thử lại sau.');
      }
    },
    [deactivateMutate],
  );

  return {
    lockedAccounts,
    unlockedAccounts,
    activateAccounts,
    deactivateAccounts,

    isLocking,
    isUnlocking,
    isActivating,
    isDeactivating,
  };
}
