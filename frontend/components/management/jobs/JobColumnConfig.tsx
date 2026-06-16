import { DataTableColumnHeader } from "@/components/dataTable/DataTableColumnHeader";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Job } from "@/types/model";
import { formatDate } from "@/utils/formatDate";
import { ColumnDef } from "@tanstack/react-table";
import { capitalize } from "lodash";
import Link from "next/link";
import JobActionsCell from "@/components/management/jobs/JobActionsCell";

export const jobColumns: ColumnDef<Job>[] = [
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
    accessorKey: "title",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tiêu đề" />
    ),
    cell: ({ row }) => (
      <div className="font-medium max-w-xs">
        <Link
          href={`/jobs/${row.original.jobId}`}
          className="hover:text-primary hover:underline line-clamp-2"
        >
          {row.getValue("title")}
        </Link>
      </div>
    ),
    enableSorting: false
  },
  {
    accessorKey: "level",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Cấp độ" />
    ),
    cell: ({ row }) => (
      <Badge variant="outline" className="capitalize">
        {capitalize(row.getValue("level"))}
      </Badge>
    ),
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
    enableSorting: false
  },
  {
    accessorKey: "workingType",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Hình thức" />
    ),
    cell: ({ row }) => (
      <Badge variant="secondary" className="capitalize">
        {capitalize(row.getValue("workingType"))}
      </Badge>
    ),
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
    enableSorting: false
  },
  {
    accessorKey: "active",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Trạng thái" />
    ),
    cell: ({ row }) => {
      const isActive = row.getValue("active") as boolean;
      return (
        <Badge
          variant={isActive ? "default" : "destructive"}
        >
          {isActive ? "Đang tuyển" : "Đã đóng"}
        </Badge>
      );
    },
    enableSorting: false,
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    }
  },
  {
    accessorKey: "startDate",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Ngày bắt đầu" />
    ),
    cell: ({ row }) => {
      const startDate = row.getValue("startDate") as string;
      return <div>{formatDate(startDate)}</div>;
    }
  },
  {
    accessorKey: "endDate",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Ngày kết thúc" />
    ),
    cell: ({ row }) => {
      const endDate = row.getValue("endDate") as string;
      return <div>{formatDate(endDate)}</div>;
    }
  },
  {
    id: "actions",
    enableSorting: false,
    enableHiding: false,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Thao tác" />
    ),
    cell: ({ row }) => <JobActionsCell job={row.original} />
  }
];

export const recruiterJobColumns: ColumnDef<Job>[] = [
  ...jobColumns.slice(0, 5),
  {
    accessorKey: "enabled",
    enableSorting: false,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Ẩn / Hiện" />
    ),
    cell: ({ row }) => {
      const enabled = row.original.enabled;
      return (
        <Badge variant={enabled ? "default" : "destructive"}>
          {enabled ? "Đang hiển thị" : "Đang ẩn"}
        </Badge>
      );
    }
  },
  ...jobColumns.slice(5)
];

export const adminJobColumns: ColumnDef<Job>[] = [
  ...jobColumns.slice(0, 1),
  {
    accessorKey: "authorName",
    enableSorting: false,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nhà tuyển dụng" />
    ),
    cell: ({ row }) => {
      return <div>
        <div className="font-medium">{row.original.company.name || "Chưa cung cấp"}</div>
        <div className="text-xs text-muted-foreground">AccountID: {row.original.company.accountId}</div>
      </div>;
    }
  },
  ...jobColumns.slice(1, 5),
  {
    accessorKey: "enabled",
    enableSorting: false,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Ẩn / Hiện" />
    ),
    cell: ({ row }) => {
      const enabled = row.original.enabled;
      return (
        <Badge variant={enabled ? "default" : "destructive"}>
          {enabled ? "Đang hiển thị" : "Đang ẩn"}
        </Badge>
      );
    }
  },
  ...jobColumns.slice(5)
];
