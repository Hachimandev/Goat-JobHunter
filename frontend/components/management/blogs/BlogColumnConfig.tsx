'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Blog } from '@/types/model';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/dataTable/DataTableColumnHeader';
import { formatDate } from '@/utils/formatDate';
import BlogActionsCell from '@/components/management/blogs/BlogActionsCell';
import { extractPlainTextFromHtml } from '@/utils/extractPlainTextFromHtml';

const baseColumnConfig: ColumnDef<Blog>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
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
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: 'contentPreview',
    enableSorting: false,
    header: ({ column }) => <DataTableColumnHeader column={column} title="Nội dung" />,
    cell: ({ row }) => {
      const plainContent = extractPlainTextFromHtml(row.original.content).trim();
      const preview = plainContent.length > 100 ? `${plainContent.slice(0, 100)}...` : plainContent;
      return <p className="line-clamp-2 max-w-[360px] text-sm">{preview || 'Không có nội dung'}</p>;
    },
  },
  {
    accessorKey: 'category',
    enableSorting: false,
    header: ({ column }) => <DataTableColumnHeader column={column} title="Các danh mục" />,
    cell: ({ row }) => {
      const tags = row.original.tags;
      return (
        <div className="flex flex-wrap gap-2 max-w-[300px]">
          {tags.map((tag, idx) => (
            <Badge key={tag + idx} variant="outline" className="capitalize">
              {tag}
            </Badge>
          ))}
        </div>
      );
    },
  },
  {
    accessorKey: 'enabled',
    enableSorting: false,
    header: ({ column }) => <DataTableColumnHeader column={column} title="Ẩn / Hiện" />,
    cell: ({ row }) => {
      const enabled = row.original.enabled;
      return <Badge variant={enabled ? 'default' : 'destructive'}>{enabled ? 'Đang hiển thị' : 'Đang ẩn'}</Badge>;
    },
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Ngày tạo" />,
    cell: ({ row }) => {
      const startDate = row.getValue('createdAt') as string;
      return <div>{formatDate(startDate)}</div>;
    },
  },
  {
    id: 'actions',
    enableSorting: false,
    header: ({ column }) => <DataTableColumnHeader column={column} title="Hành động" />,
    cell: ({ row }) => <BlogActionsCell blog={row.original} />,
  },
];

export const recruiterBlogColumns: ColumnDef<Blog>[] = baseColumnConfig;

export const adminBlogColumns: ColumnDef<Blog>[] = [
  ...baseColumnConfig.slice(0, 1),
  {
    accessorKey: 'authorName',
    enableSorting: false,
    header: ({ column }) => <DataTableColumnHeader column={column} title="Tác giả" />,
    cell: ({ row }) => {
      return (
        <div>
          <div className="font-medium">{row.original.author.fullName || 'Chưa cung cấp'}</div>
          <div className="text-xs text-muted-foreground">AccountID: {row.original.author.accountId}</div>
        </div>
      );
    },
  },
  ...baseColumnConfig.slice(1),
];
