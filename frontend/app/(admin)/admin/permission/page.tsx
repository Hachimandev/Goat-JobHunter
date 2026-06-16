"use client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { useState } from "react";
import PermissionsTable from "./components/PermissionsTable";
import PermissionFilter from "./components/PermissionFilter";
import { usePermissionManagement } from "./hooks/usePermissionManagement";
import PermissionActions from "./components/PermissionActions";
import EditPermissionDialog from "./components/EditPermissionDialog";
import LoaderSpin from "@/components/common/LoaderSpin";
import ErrorMessage from "@/components/common/ErrorMessage";
import { DataTablePagination } from "@/components/dataTable/DataTablePagination";
import { Permission } from "@/types/model";
import { Button } from "@/components/ui/button";

const AdminPermissionPage = () => {
  const {
    permissions,
    meta,
    isLoading,
    isError,
    page,
    size,
    filters,
    handlePageChange,
    handleSizeChange,
    handleFilterChange,
    resetFilters,
  } = usePermissionManagement();

  const [selectedItems, setSelectedItems] = useState<Permission[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">Quản lý quyền</h1>
            <p className="text-sm text-muted-foreground">Quản lý các permission trong hệ thống</p>
          </div>

          <div className="flex items-center gap-2">
            <Button className="rounded-xl" onClick={() => setIsCreateOpen(true)}>
              <Plus className="w-4 h-4" />
              Thêm permission
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <PermissionFilter filters={filters} onFilterChange={handleFilterChange} onResetFilters={resetFilters} />

          {isError && <ErrorMessage message="Có lỗi khi tải permissions" />}

          {isLoading ? (
            <div className="flex justify-center py-8"><LoaderSpin /></div>
          ) : !isError && (
            <>
              <PermissionActions selectedItems={selectedItems} />

              <PermissionsTable permissions={permissions} onSelectionChange={setSelectedItems} />

              <DataTablePagination
                currentPage={page}
                totalPages={meta.pages}
                pageSize={size}
                totalItems={meta.total}
                currentItemsCount={permissions.length}
                onPageChange={handlePageChange}
                onSizeChange={handleSizeChange}
              />
            </>
          )}
        </CardContent>
      </Card>

      <EditPermissionDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />
    </div>
  );
};

export default AdminPermissionPage;