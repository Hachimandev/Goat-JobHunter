"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import MultipleSelector from "@/components/ui/MultipleSelector";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LEVEL_OPTIONS, WORKING_TYPE_OPTIONS } from "@/constants/constant";
import { capitalize, debounce } from "lodash";
import { Search, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AdminJobFilters } from "@/app/(admin)/admin/job/hooks/useJobAdminManagement";

interface AdminJobFilterProps {
  filters: AdminJobFilters;
  onFilterChange: (filters: Partial<AdminJobFilters>) => void;
  onResetFilters: () => void;
}

export default function AdminJobFilter({
  filters,
  onFilterChange,
  onResetFilters,
}: Readonly<AdminJobFilterProps>) {
  const [searchTerm, setSearchTerm] = useState(filters.title || "");

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = useCallback(
    debounce((value: string) => {
      onFilterChange({ title: value });
    }, 700),
    [],
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    debouncedSearch(value);
  };

  useEffect(() => {
    if (filters.title !== searchTerm) {
      setSearchTerm(filters.title || "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.title]);

  const selectedLevel = useMemo(
    () => filters.level?.map((l) => ({ label: capitalize(l), value: l })) || [],
    [filters.level],
  );

  const selectedWorkingType = useMemo(
    () =>
      filters.workingType?.map((w) => ({ label: capitalize(w), value: w })) ||
      [],
    [filters.workingType],
  );

  return (
    <div className="space-y-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-10 gap-4">
        <div className="relative col-span-4">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm theo tiêu đề..."
            className="pl-9 rounded-xl"
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>

        <div className="col-span-3">
          <MultipleSelector
            value={selectedLevel}
            onChange={(options) =>
              onFilterChange({ level: options.map((o) => o.value) })
            }
            defaultOptions={LEVEL_OPTIONS}
            placeholder="Chọn cấp độ..."
            className="rounded-xl"
            badgeClassName="bg-primary/10 text-primary"
          />
        </div>

        <div className="col-span-3">
          <MultipleSelector
            value={selectedWorkingType}
            onChange={(options) =>
              onFilterChange({ workingType: options.map((o) => o.value) })
            }
            defaultOptions={WORKING_TYPE_OPTIONS}
            placeholder="Hình thức làm việc..."
            className="rounded-xl"
            badgeClassName="bg-primary/10 text-primary"
          />
        </div>

        <div className="col-span-5">
          <Select
            value={
              filters.active === null
                ? "all"
                : filters.active
                  ? "active"
                  : "inactive"
            }
            onValueChange={(value) => {
              const activeState =
                value === "all" ? null : value === "active";
              onFilterChange({ active: activeState });
            }}
          >
            <SelectTrigger className="rounded-xl w-full">
              <SelectValue placeholder="Trạng thái tuyển dụng" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="active">Đang tuyển</SelectItem>
              <SelectItem value="inactive">Đã đóng</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="col-span-5">
          <Select
            value={
              filters.enabled === null
                ? "all"
                : filters.enabled
                  ? "enabled"
                  : "disabled"
            }
            onValueChange={(value) => {
              const enabled =
                value === "enabled" ? true : value === "disabled" ? false : null;
              onFilterChange({ enabled });
            }}
          >
            <SelectTrigger className="rounded-xl w-full">
              <SelectValue placeholder="Trạng thái hiển thị" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="enabled">Đang hiển thị</SelectItem>
              <SelectItem value="disabled">Đang ẩn</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          variant={"destructive"}
          className="rounded-xl"
          onClick={() => {
            setSearchTerm("");
            onResetFilters();
          }}
        >
          <X className="h-4 w-4 mr-2" />
          Xóa bộ lọc
        </Button>
      </div>
    </div>
  );
}