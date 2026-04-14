'use client';

import { Loader2, Plus } from 'lucide-react';
import { AccountTable } from './components/AccountTable';
import useAccountManagement from './hooks/useAccountManagement';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import AccountActions from './components/AccountActions';
import { useState } from 'react';
import { Account } from '@/types/model';
import ErrorMessage from '@/components/common/ErrorMessage';
import { DataTablePagination } from '@/components/dataTable/DataTablePagination';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { AccountFilter } from './components/AccountFilter';

const AdminUserPage = () => {
  const {
    accounts,
    meta,
    page,
    size,
    filters,
    isLoading,
    isError,
    handlePageChange,
    handleSizeChange,
    handleFilterChange,
    resetFilters,
  } = useAccountManagement();
  const [selectedItems, setSelectedItems] = useState<(Account & { fullName: string })[]>([]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold">Quản lý tài khoản</h1>
            <p className="text-sm text-muted-foreground">Quản lý tất cả tài khoản trong hệ thống</p>
          </div>
          <div className="flex items-center gap-2">
            <Link href={'/admin/user/form'}>
              <Button className="rounded-xl">
                <Plus className="w-4 h-4" />
                Thêm tài khoản
              </Button>
            </Link>
          </div>
        </CardHeader>

        <CardContent>
          <AccountFilter filters={filters} onFilterChange={handleFilterChange} onResetFilters={resetFilters} />

          {isLoading && <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />}

          {isError && <ErrorMessage message="Có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại sau." />}

          {!isError && (
            <>
              <AccountActions
                selectedCount={selectedItems.length}
                selectedIds={selectedItems.map((item) => item.accountId)}
              />

              <AccountTable accounts={accounts} onSelectionChange={setSelectedItems} />

              <DataTablePagination
                currentPage={page}
                totalPages={meta.pages}
                pageSize={size}
                totalItems={meta.total}
                currentItemsCount={accounts.length}
                onPageChange={handlePageChange}
                onSizeChange={handleSizeChange}
              />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminUserPage;
