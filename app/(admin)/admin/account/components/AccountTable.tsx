'use client';

import type { Account } from '@/types/model';
import { DataTable } from '@/components/dataTable/DataTable';
import { accountColumns } from '@/app/(admin)/admin/account/components/AccountColumnConfig';

interface AccountTableProps {
  readonly accounts: (Account & { fullName: string })[];
  readonly onSelectionChange: (selectedItems: (Account & { fullName: string })[]) => void;
}

export function AccountTable({ accounts, onSelectionChange }: AccountTableProps) {
  return (
    <div className="space-y-4">
      <DataTable columns={accountColumns} data={accounts} onSelectionChange={onSelectionChange} />
    </div>
  );
}
