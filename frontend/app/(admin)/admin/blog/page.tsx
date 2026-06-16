"use client"
import { useState } from "react";
import { Blog } from "@/types/model";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import ErrorMessage from "@/components/common/ErrorMessage";
import LoaderSpin from "@/components/common/LoaderSpin";
import BlogActions from "@/components/management/blogs/BlogActions";
import BlogsTable from "@/components/management/blogs/BlogsTable";
import { DataTablePagination } from "@/components/dataTable/DataTablePagination";
import { useBlogAdminManagement } from "@/app/(admin)/admin/blog/hooks/useBlogAdminManagement";
import AdminBlogFilter from "@/components/management/blogs/admin/AdminBlogFilter";
import { adminBlogColumns } from "@/components/management/blogs/BlogColumnConfig";

const AdminBlogPage = () => {
  const {
    blogs,
    meta,
    isLoading,
    isError,
    page,
    size,
    filters,
    setPage,
    handleSizeChange,
    handleFilterChange,
    resetFilters,
  } = useBlogAdminManagement({});
  const [selectedItems, setSelectedItems] = useState<Blog[]>([]);

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
          <AdminBlogFilter
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
              <BlogActions
                selectedCount={selectedItems.length}
                selectedIds={selectedItems.map(b => b.blogId)}
              />

              <BlogsTable blogs={blogs} onSelectionChange={setSelectedItems} columns={adminBlogColumns} />

              <DataTablePagination
                currentPage={page}
                totalPages={meta.pages}
                pageSize={size}
                totalItems={meta.total}
                currentItemsCount={blogs.length}
                onPageChange={setPage}
                onSizeChange={handleSizeChange}
              />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
};

export default AdminBlogPage;
