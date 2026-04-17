'use client';

import { Button } from '@/components/ui/button';
import { CheckCircle, Lock, Unlock, XCircle } from 'lucide-react';
import useAccountActions from '@/hooks/useAccountActions';
import { useAccountConfirmDialog } from '@/app/(admin)/admin/account/hooks/useAccountConfirmDialog';
import ConfirmDialog from '@/components/common/ConfirmDialog';

interface UserActionsProps {
  readonly selectedCount: number;
  readonly selectedIds: number[];
}

export default function AccountActions({ selectedCount, selectedIds }: UserActionsProps) {
  const {
    lockedAccounts,
    unlockedAccounts,
    activateAccounts,
    deactivateAccounts,
    isLocking,
    isUnlocking,
    isActivating,
    isDeactivating,
  } = useAccountActions();

  const { actionType, dialogConfig, openDialog, closeDialog, handleConfirm, isLoading } = useAccountConfirmDialog({
    onConfirm: async (type, ids) => {
      if (!type) return;
      if (type === 'activate') {
        await activateAccounts(ids);
      } else if (type === 'deactivate') {
        await deactivateAccounts(ids);
      } else if (type === 'lock') {
        await lockedAccounts(ids);
      } else if (type === 'unlock') {
        await unlockedAccounts(ids);
      }
    },
    isActivating,
    isDeactivating,
    isLocking,
    isUnlocking,
  });

  if (selectedCount === 0) return null;

  return (
    <>
      <div className="flex items-center gap-3 px-4 py-2 border border-border rounded-xl mb-4">
        <span className="text-sm font-medium">Đã chọn {selectedCount} tài khoản</span>
        <div className="flex gap-4 ml-auto">
          <Button
            variant="default"
            size="sm"
            onClick={() => openDialog('activate', selectedIds)}
            className="gap-2 rounded-xl"
          >
            <CheckCircle className="h-4 w-4" />
            Kích hoạt
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => openDialog('deactivate', selectedIds)}
            className="gap-2 rounded-xl"
          >
            <XCircle className="h-4 w-4" />
            Vô hiệu hóa
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={() => openDialog('unlock', selectedIds)}
            className="gap-2 rounded-xl"
          >
            <Unlock className="h-4 w-4" />
            Mở khóa
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => openDialog('lock', selectedIds)}
            className="gap-2 rounded-xl"
          >
            <Lock className="h-4 w-4" />
            Khóa
          </Button>
        </div>
      </div>

      <ConfirmDialog
        open={!!actionType}
        onOpenChange={(open) => !open && closeDialog()}
        title={dialogConfig.title}
        description={dialogConfig.description}
        confirmText={dialogConfig.confirmText}
        confirmBtnClass={dialogConfig.confirmBtnClass}
        onConfirm={handleConfirm}
        isLoading={isLoading}
        disableCancel={isLoading}
      />
    </>
  );
}
