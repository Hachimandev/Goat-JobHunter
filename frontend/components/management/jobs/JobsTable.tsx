"use client";

import { DataTable } from "@/components/dataTable/DataTable";
import { Job } from "@/types/model";
import { ColumnDef } from "@tanstack/react-table";

interface JobsTableProps {
  jobs: Job[];
  onSelectionChange: (selectedItems: Job[]) => void;
  columns: ColumnDef<Job>[];
}

export default function JobsTable({ jobs, onSelectionChange, columns }: Readonly<JobsTableProps>) {
  return <DataTable columns={columns} data={jobs} onSelectionChange={onSelectionChange} />;
}
