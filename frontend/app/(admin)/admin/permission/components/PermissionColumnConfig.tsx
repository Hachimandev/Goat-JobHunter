"use client";
import PermissionActionsCell from "./PermissionActionsCell";
import { DataTableColumnHeader } from "@/components/dataTable/DataTableColumnHeader";
import { Checkbox } from "@/components/ui/checkbox";
import { ColumnDef } from "@tanstack/react-table";
import { Permission } from "@/types/model";
import { formatDate } from "@/utils/formatDate";
import { Badge } from "@/components/ui/badge";

export const permissionColumns: ColumnDef<Permission>[] = [
  {
    id: "select",
    enableSorting: false,
    enableHiding: false,
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    )
  },
  {
    accessorKey: "name",
    enableSorting: false,
    header: ({ column }) => <DataTableColumnHeader column={column} title="Tên" />,
    cell: ({ row }) => <div className="font-medium max-w-xs line-clamp-2">{row.getValue("name")}</div>
  },
  {
    accessorKey: "module",
    enableSorting: false,
    header: ({ column }) => <DataTableColumnHeader column={column} title="Module" />,
    cell: ({ row }) => <div className="text-sm text-muted-foreground capitalize">{row.getValue("module") || "-"}</div>
  },
  {
    accessorKey: "method",
    enableSorting: false,
    header: ({ column }) => <DataTableColumnHeader column={column} title="Method" />,
    cell: ({ row }) => {
      const method = row.getValue("method") as string;
      const methodVariants: Record<string, "default" | "destructive" | "outline" | "secondary"> = {
        GET: "default",
        POST: "secondary",
        PUT: "secondary",
        DELETE: "destructive",
        PATCH: "outline"
      }

      return (
        <Badge variant={methodVariants[method]} className="text-sm">{method}</Badge>
      );
    }
  },
  {
    accessorKey: "apiPath",
    enableSorting: false,
    header: ({ column }) => <DataTableColumnHeader column={column} title="API Path" />,
    cell: ({ row }) => <div
      className="text-sm text-muted-foreground line-clamp-1">{row.getValue("apiPath") || "-"}</div>
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Ngày tạo" />,
    cell: ({ row }) => <div
      className="text-sm text-muted-foreground line-clamp-1">{row.getValue("createdAt") ? formatDate(row.getValue("createdAt")) : "-"}</div>
  },
  {
    accessorKey: "updatedAt",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Ngày cập nhật" />,
    cell: ({ row }) => <div
      className="text-sm text-muted-foreground line-clamp-1">{row.getValue("updatedAt") ? formatDate(row.getValue("updatedAt")) : "-"}</div>
  },
  {
    id: "actions",
    enableSorting: false,
    enableHiding: false,
    header: ({ column }) => <DataTableColumnHeader column={column} title="Actions" />,
    cell: ({ row }) => <PermissionActionsCell permission={row.original} />
  }
];