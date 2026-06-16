"use client";

import { DataTable } from "@/components/dataTable/DataTable";
import { Blog } from "@/types/model";
import { ColumnDef } from "@tanstack/react-table";

interface BlogsTableProps {
  blogs: Blog[];
  onSelectionChange: (selectedItems: Blog[]) => void;
  columns: ColumnDef<Blog>[];
}

export default function BlogsTable({ blogs, onSelectionChange, columns}: Readonly<BlogsTableProps>) {
  return <DataTable columns={columns} data={blogs} onSelectionChange={onSelectionChange} />;
}