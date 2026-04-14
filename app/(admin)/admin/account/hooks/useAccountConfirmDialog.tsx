import { useMemo, useState } from 'react';

export type AccountActionType = 'activate' | 'deactivate' | 'lock' | 'unlock' | null;

interface UseAccountConfirmDialogProps {
  onConfirm: (actionType: AccountActionType, ids: number[]) => Promise<void>;
  isActivating?: boolean;
  isDeactivating?: boolean;
  isLocking?: boolean;
  isUnlocking?: boolean;
}

export const useAccountConfirmDialog = ({
  onConfirm,
  isActivating = false,
  isDeactivating = false,
  isLocking = false,
  isUnlocking = false,
}: UseAccountConfirmDialogProps) => {
  const [actionType, setActionType] = useState<AccountActionType>(null);
  const [targetIds, setTargetIds] = useState<number[]>([]);
  const [targetTitle, setTargetTitle] = useState<string>('');

  const openDialog = (type: AccountActionType, ids: number[], title?: string) => {
    setActionType(type);
    setTargetIds(ids);
    setTargetTitle(title || '');
  };

  const closeDialog = () => {
    setActionType(null);
    setTargetIds([]);
    setTargetTitle('');
  };

  const handleConfirm = async () => {
    try {
      await onConfirm(actionType, targetIds);
      closeDialog();
    } catch (error) {
      console.error('Account action failed', error);
    }
  };

  const dialogConfig = useMemo(() => {
    const count = targetIds.length;

    if (actionType === 'activate') {
      return {
        title: 'Kích hoạt tài khoản?',
        description: targetTitle ? (
          <>
            Tài khoản <span className="font-bold text-foreground">&quot;{targetTitle}&quot;</span> sẽ được kích hoạt.
          </>
        ) : (
          <>{count} tài khoản sẽ được kích hoạt.</>
        ),
        confirmText: 'Kích hoạt',
        confirmBtnClass: 'bg-green-600 text-white hover:bg-green-700',
      };
    }

    if (actionType === 'deactivate') {
      return {
        title: 'Vô hiệu hóa tài khoản?',
        description: targetTitle ? (
          <>
            Tài khoản <span className="font-bold text-foreground">&quot;{targetTitle}&quot;</span> sẽ bị vô hiệu hóa.
          </>
        ) : (
          <>{count} tài khoản sẽ bị vô hiệu hóa.</>
        ),
        confirmText: 'Vô hiệu hóa',
        confirmBtnClass: 'bg-destructive text-destructive-foreground hover:bg-destructive/90 text-white',
      };
    }

    if (actionType === 'lock') {
      return {
        title: 'Khóa tài khoản?',
        description: targetTitle ? (
          <>
            Tài khoản <span className="font-bold text-foreground">&quot;{targetTitle}&quot;</span> sẽ bị khóa.
          </>
        ) : (
          <>{count} tài khoản sẽ bị khóa.</>
        ),
        confirmText: 'Khóa',
        confirmBtnClass: 'bg-destructive text-destructive-foreground hover:bg-destructive/90 text-white',
      };
    }

    if (actionType === 'unlock') {
      return {
        title: 'Mở khóa tài khoản?',
        description: targetTitle ? (
          <>
            Tài khoản <span className="font-bold text-foreground">&quot;{targetTitle}&quot;</span> sẽ được mở khóa.
          </>
        ) : (
          <>{count} tài khoản sẽ được mở khóa.</>
        ),
        confirmText: 'Mở khóa',
        confirmBtnClass: 'bg-green-600 text-white hover:bg-green-700',
      };
    }

    return { title: '', description: null, confirmText: 'Xác nhận', confirmBtnClass: '' };
  }, [actionType, targetIds.length, targetTitle]);

  return {
    actionType,
    dialogConfig,
    openDialog,
    closeDialog,
    handleConfirm,
    isLoading: isActivating || isDeactivating || isLocking || isUnlocking,
  };
};
