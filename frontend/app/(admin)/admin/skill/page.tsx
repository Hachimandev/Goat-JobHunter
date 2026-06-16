"use client";
import { useMemo, useState, useCallback, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Plus, Search, XIcon } from "lucide-react";
import EditSkillDialog from "./components/EditSkillDialog";
import { SkillTable } from "./components/SkillTable";
import { Button } from "@/components/ui/button";
import { useGetSkillsQuery } from "@/services/skill/skillApi";
import LoaderSpin from "@/components/common/LoaderSpin";
import { Input } from "@/components/ui/input";
import { DataTablePagination } from "@/components/dataTable/DataTablePagination";
import SkillActions from "./components/SkillActions";
import type { Skill } from "@/types/model";
import { debounce } from "lodash";
import ErrorMessage from "@/components/common/ErrorMessage";

const SkillManagement = () => {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [selectedItems, setSelectedItems] = useState<Skill[]>([]);
  const [nameInput, setNameInput] = useState("");
  const [nameFilter, setNameFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedNameFilter = useCallback(
    debounce((value: string) => {
      setNameFilter(value);
      setCurrentPage(1);
    }, 700),
    []
  );

  useEffect(() => {
    return () => {
      debouncedNameFilter.cancel();
    };
  }, [debouncedNameFilter]);

  const { data, isLoading, isError } = useGetSkillsQuery({
    name: nameFilter || undefined,
    page: currentPage,
    size: pageSize
  });

  const skills = useMemo(() => data?.data?.result || [], [data]);
  const totalPages = useMemo(() => data?.data?.meta?.pages || 1, [data]);
  const totalItems = useMemo(() => data?.data?.meta?.total || 0, [data]);

  const handleOpenCreate = () => {
    setSelectedSkill(null);
    setIsEditOpen(true);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const handleNameFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNameInput(value);
    debouncedNameFilter(value);
  };

  const handleClearFilter = () => {
    setNameInput("");
    setNameFilter("");
    setCurrentPage(1);
    debouncedNameFilter.cancel();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">Quản lý kỹ năng</h1>
            <p className="text-sm text-muted-foreground">Quản lý tất cả kỹ năng trong hệ thống</p>
          </div>

          <div className="flex items-center gap-2">
            <Button onClick={handleOpenCreate} className="rounded-xl">
              <Plus className="w-4 h-4" /> Thêm kỹ năng
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm theo tên kỹ năng..."
                value={nameInput}
                onChange={handleNameFilterChange}
                className="pl-9 rounded-xl"
              />
            </div>
            <Button
              onClick={handleClearFilter}
              variant="destructive"
              className="rounded-xl"
            >
              <XIcon className="h-4 w-4 mr-2" />
              Xóa bộ lọc
            </Button>
          </div>

          {isLoading &&
            <div className="flex justify-center py-8">
              <LoaderSpin />
            </div>
          }

          {isError &&
            <ErrorMessage message={"Có lỗi khi tải kỹ năng"} />
          }

          {!isLoading && !isError && (
            <>
              <SkillActions selectedItems={selectedItems} />
              <SkillTable
                skills={skills}
                onSelectionChange={setSelectedItems}
              />
              <DataTablePagination
                currentPage={currentPage}
                totalPages={totalPages}
                pageSize={pageSize}
                totalItems={totalItems}
                currentItemsCount={skills.length}
                onPageChange={handlePageChange}
                onSizeChange={handlePageSizeChange}
              />
            </>
          )}
        </CardContent>
      </Card>

      <EditSkillDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        skill={selectedSkill}
      />
    </div>
  );
};

export default SkillManagement;