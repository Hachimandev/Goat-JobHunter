"use client";
import type { Career } from "@/types/model";
import { DataTable } from "@/components/dataTable/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { formatDate } from "@/utils/formatDate";
import CareerActionsCell from "./CareerActionsCell";
import { DataTableColumnHeader } from "@/components/dataTable/DataTableColumnHeader";
import { Checkbox } from "@/components/ui/checkbox";

interface CareerTableProps {
  readonly careers: Career[];
  readonly onSelectionChange: (selected: Career[]) => void;
}

export function CareerTable({ careers, onSelectionChange }: CareerTableProps) {
  const columns = [
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
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Tên ngành nghề" />
      ),
      cell: ({ row }) => <div>{row.getValue("name")}</div>
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Ngày tạo" />
      ),
      cell: ({ row }) => <div>{formatDate(row.original.createdAt)}</div>
    },
    {
      accessorKey: "updatedAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Lần cập nhật cuối" />
      ),
      cell: ({ row }) =>
        <div>{formatDate(row.original.updatedAt || row.original.createdAt)}</div>
    },
    {
      id: "actions",
      header: "Thao tác",
      cell: ({ row }) => <CareerActionsCell career={row.original} />
    }
  ] as ColumnDef<Career>[];

  return (
    <DataTable
      columns={columns}
      data={careers}
      onSelectionChange={onSelectionChange}
    />
  );
}