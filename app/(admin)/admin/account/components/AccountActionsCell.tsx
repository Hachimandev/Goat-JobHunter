'use client';

import { Button } from '@/components/ui/button';
import type { Account } from '@/types/model';
import { CheckCircle, Edit, Lock, Unlock, XCircle } from 'lucide-react';
import useAccountActions from '@/hooks/useAccountActions';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { useAccountConfirmDialog } from '@/app/(admin)/admin/account/hooks/useAccountConfirmDialog';
// no local state currently needed
import Link from 'next/link';

interface AccountActionsCellProps {
  readonly account: Account & { fullName: string };
}

export function AccountActionsCell({ account }: AccountActionsCellProps) {
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
  // Reserved for future job/application dialogs

  const { actionType, dialogConfig, openDialog, closeDialog, handleConfirm, isLoading } = useAccountConfirmDialog({
    onConfirm: async (type, ids) => {
      if (!type || ids.length === 0) return;

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

  return (
    <div className={'flex gap-2 items-center'}>
      <Link href={`/admin/user/form?userId=${account.accountId}`}>
        <Button variant="outline" size="icon" className="rounded-xl" title="Chỉnh sửa thông tin tài khoản">
          <Edit className="h-4 w-4" />
        </Button>
      </Link>
      {/* <HasApplicant user={account}>
        <Button
          variant="outline"
          size="icon"
          className="rounded-xl"
          title={'Xem các đơn ứng tuyển của người dùng này'}
          onClick={() => setIsApplicationListOpen(true)}
        >
          <FileUser className="h-4 w-4" />
        </Button>
      </HasApplicant> */}
      {/* <HasRecruiter user={user}>
        <Button
          variant="outline"
          size="icon"
          className="rounded-xl"
          title={'Xem các công việc của người dùng này'}
          onClick={() => setIsJobListOpen(true)}
        >
          <BriefcaseBusiness className="h-4 w-4" />
        </Button>
      </HasRecruiter> */}
      {account.locked ? (
        <Button
          variant="outline"
          size="icon"
          onClick={() =>
            openDialog('unlock', [account.accountId], `${account.fullName || account.username || account.email}`)
          }
          className="rounded-xl text-amber-600 hover:text-amber-700 hover:bg-amber-50 border-amber-200"
          title={'Mở khóa tài khoản'}
        >
          <Unlock className="h-4 w-4" />
        </Button>
      ) : (
        <Button
          variant="outline"
          size="icon"
          onClick={() =>
            openDialog('lock', [account.accountId], `${account.fullName || account.username || account.email}`)
          }
          className="rounded-xl text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20"
          title={'Khóa tài khoản'}
        >
          <Lock className="h-4 w-4" />
        </Button>
      )}

      {account.enabled ? (
        <Button
          variant="outline"
          size="icon"
          onClick={() =>
            openDialog('deactivate', [account.accountId], `${account.fullName || account.username || account.email}`)
          }
          className="rounded-xl text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20"
          title={'Vô hiệu hóa tài khoản'}
        >
          <XCircle className="h-4 w-4" />
        </Button>
      ) : (
        <Button
          variant="outline"
          size="icon"
          onClick={() =>
            openDialog('activate', [account.accountId], `${account.fullName || account.username || account.email}`)
          }
          className="rounded-xl text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
          title={'Kích hoạt tài khoản'}
        >
          <CheckCircle className="h-4 w-4" />
        </Button>
      )}

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

      {/* <JobListDialog user={user} open={isJobListOpen} onOpenChange={setIsJobListOpen} /> */}

      {/* <ApplicationListDialog user={user} open={isApplicationListOpen} onOpenChange={setIsApplicationListOpen} /> */}
    </div>
  );
}
