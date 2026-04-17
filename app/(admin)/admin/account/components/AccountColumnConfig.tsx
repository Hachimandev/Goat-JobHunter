import { Badge } from '@/components/ui/badge';
import type { Account } from '@/types/model';
import type { ColumnDef } from '@tanstack/react-table';
import { AccountActionsCell } from './AccountActionsCell';
import { formatDate } from '@/utils/formatDate';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTableColumnHeader } from '@/components/dataTable/DataTableColumnHeader';
import { ROLE_LIST } from '@/constants/constant';

export const accountColumns: ColumnDef<Account & { fullName: string }>[] = [
  {
    id: 'select',
    enableSorting: false,
    enableHiding: false,
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
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
  },
  {
    accessorKey: 'fullName',
    enableSorting: false,
    header: ({ column }) => <DataTableColumnHeader column={column} title="Họ và tên" />,
    cell: ({ row }) => (
      <div>
        <div className="font-medium">{row.getValue('fullName') || 'Chưa cung cấp'}</div>
        <div className="text-xs text-muted-foreground">AccountID: {row.original.accountId}</div>
      </div>
    ),
  },
  {
    accessorKey: 'username',
    enableSorting: false,
    header: ({ column }) => <DataTableColumnHeader column={column} title="Tên đăng nhập" />,
    cell: ({ row }) => <div>{row.getValue('username') || 'Chưa cung cấp'}</div>,
  },
  {
    accessorKey: 'email',
    enableSorting: false,
    header: ({ column }) => <DataTableColumnHeader column={column} title="Email" />,
    cell: ({ row }) => <div>{row.original.email}</div>,
  },
  {
    accessorKey: 'createdAt',
    enableSorting: true,
    header: ({ column }) => <DataTableColumnHeader column={column} title="Ngày tạo" />,
    cell: ({ row }) => <div className="text-sm">{formatDate(row.getValue('createdAt'))}</div>,
  },
  {
    accessorKey: 'role',
    enableSorting: false,
    header: ({ column }) => <DataTableColumnHeader column={column} title="Vai trò" />,
    cell: ({ row }) => {
      const role = row.original.role;
      const roleVariant: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
        COMPANY: 'outline',
        HR: 'secondary',
        APPLICANT: 'default',
      };

      return (
        <Badge variant={roleVariant[role.name]}>{ROLE_LIST.find((r) => r.value == role.name)?.label || '-'}</Badge>
      );
    },
  },
  {
    accessorKey: 'enabled',
    enableSorting: false,
    header: ({ column }) => <DataTableColumnHeader column={column} title="Trạng thái" />,
    cell: ({ row }) => {
      const enabled = row.getValue('enabled') as boolean;
      return (
        <Badge variant={enabled ? 'default' : 'destructive'}>{enabled ? 'Đã kích hoạt' : 'Đang vô hiệu hóa'}</Badge>
      );
    },
  },
  {
    accessorKey: 'locked',
    enableSorting: false,
    header: ({ column }) => <DataTableColumnHeader column={column} title="Trạng thái" />,
    cell: ({ row }) => {
      const locked = row.getValue('locked') as boolean;
      return <Badge variant={locked ? 'destructive' : 'default'}>{locked ? 'Đã khóa' : 'Chưa khóa'}</Badge>;
    },
  },
  {
    id: 'actions',
    enableSorting: false,
    header: ({ column }) => <DataTableColumnHeader column={column} title="Thao tác" />,
    cell: ({ row }) => <AccountActionsCell account={row.original} />,
  },
];
