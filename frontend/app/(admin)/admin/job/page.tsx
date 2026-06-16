"use client";

import React, { useState } from "react";
import { Job } from "@/types/model";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import ErrorMessage from "@/components/common/ErrorMessage";
import LoaderSpin from "@/components/common/LoaderSpin";
import { DataTablePagination } from "@/components/dataTable/DataTablePagination";
import { useJobAdminManagement } from "@/app/(admin)/admin/job/hooks/useJobAdminManagement";
import JobsTable from "@/components/management/jobs/JobsTable";
import { adminJobColumns } from "@/components/management/jobs/JobColumnConfig";
import AdminJobFilter from "@/components/management/jobs/admin/AdminJobFilter";
import JobActions from "@/components/management/jobs/JobActions";

const AdminJobPage = () => {
  const {
    jobs,
    meta,
    isLoading,
    isError,
    page,
    size,
    filters,
    setPage,
    handleSizeChange,
    handleFilterChange,
    resetFilters
  } = useJobAdminManagement({});
  const [selectedItems, setSelectedItems] = useState<Job[]>([]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold">Danh sách bài viết</h1>
            <p className="text-sm text-muted-foreground">
              Quản lý các bài viết trong hệ thống
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <AdminJobFilter
            filters={filters}
            onFilterChange={handleFilterChange}
            onResetFilters={resetFilters}
          />

          {isError && <ErrorMessage message={"Có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại sau."} />}

          {isLoading ? (
            <div className="flex justify-center py-8">
              <LoaderSpin />
            </div>
          ) : (
            <>
              <JobActions
                selectedCount={selectedItems.length}
                selectedIds={selectedItems.map(j => j.jobId)}
              />

              <JobsTable jobs={jobs} onSelectionChange={setSelectedItems} columns={adminJobColumns} />

              <DataTablePagination
                currentPage={page}
                totalPages={meta.pages}
                pageSize={size}
                totalItems={meta.total}
                currentItemsCount={jobs.length}
                onPageChange={setPage}
                onSizeChange={handleSizeChange}
              />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
export default AdminJobPage;
