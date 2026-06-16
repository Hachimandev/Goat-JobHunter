"use client";
import type { Role } from "@/types/model";
import { DataTable } from "@/components/dataTable/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/utils/formatDate";
import RoleActionsCell from "./RoleActionsCell";
import { DataTableColumnHeader } from "@/components/dataTable/DataTableColumnHeader";

export function RoleTable({ roles }: { readonly roles: Role[] }) {
  const columns = [
    {
      accessorKey: "name",
      enableSorting: false,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Tên vai trò" />
      ),
      cell: ({ row }) => <div>{row.getValue("name")}</div>
    },
    {
      accessorKey: "description",
      enableSorting: false,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Mô tả" />
      ),
      cell: ({ row }) => <div>{row.getValue("description") || "Không có mô tả"}</div>
    },
    {
      accessorKey: "active",
      enableSorting: false,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Trạng thái" />
      ),
      cell: ({ row }) => (
        <Badge
          variant={row.getValue("active") ? "default" : "destructive"}>
          {row.getValue("active") ? "Đang hoạt động" : "Đang vô hiệu hóa"}
        </Badge>
      )
    },
    {
      accessorKey: "createdAt",
      enableSorting: false,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Ngày tạo" />
      ),
      cell: ({ row }) => <div>{formatDate(row.original.createdAt)}</div>
    },
    {
      accessorKey: "updatedAt",
      enableSorting: false,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Lần cập nhật cuối" />
      ),
      cell: ({ row }) =>
        <div>{formatDate(row.original.updatedAt ? row.original.updatedAt : row.original.createdAt)}</div>
    },
    {
      id: "actions",
      header: "Thao tác",
      cell: ({ row }) => <RoleActionsCell role={row.original} />
    }
  ] as ColumnDef<Role>[];

  return <DataTable columns={columns} data={roles} onSelectionChange={() => {}} />;
}