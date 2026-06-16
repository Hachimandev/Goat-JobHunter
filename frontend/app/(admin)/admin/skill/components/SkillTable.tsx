"use client";
import type { Skill } from "@/types/model";
import { DataTable } from "@/components/dataTable/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { formatDate } from "@/utils/formatDate";
import SkillActionsCell from "./SkillActionsCell";
import { DataTableColumnHeader } from "@/components/dataTable/DataTableColumnHeader";
import { Checkbox } from "@/components/ui/checkbox";

interface SkillTableProps {
  readonly skills: Skill[];
  readonly onSelectionChange: (selected: Skill[]) => void;
}

export function SkillTable({ skills, onSelectionChange }: SkillTableProps) {
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
        <DataTableColumnHeader column={column} title="Tên kỹ năng" />
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
      cell: ({ row }) => <SkillActionsCell skill={row.original} />
    }
  ] as ColumnDef<Skill>[];

  return (
    <DataTable
      columns={columns}
      data={skills}
      onSelectionChange={onSelectionChange}
    />
  );
}