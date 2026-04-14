'use client';

import { useDataTable } from '@/components/dataTable/useDataTable';
import { ColumnDef } from '@tanstack/react-table';
import { DataTableContent } from './DataTableContent';
import { useEffect } from 'react';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  onSelectionChange: (selectedItems: TData[]) => void;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  onSelectionChange,
}: Readonly<DataTableProps<TData, TValue>>) {
  const table = useDataTable({
    data,
    columns: columns as ColumnDef<TData>[],
  });

  useEffect(() => {
    if (onSelectionChange) {
      const selectedRows = table.getSelectedRowModel().rows;
      const selectedIds = selectedRows.map((row) => row.original);
      onSelectionChange(selectedIds);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table.getState().rowSelection, onSelectionChange, table]);

  return (
    <div className="space-y-4">
      <DataTableContent table={table} columns={columns as unknown as ColumnDef<TData>[]} />
    </div>
  );
}
