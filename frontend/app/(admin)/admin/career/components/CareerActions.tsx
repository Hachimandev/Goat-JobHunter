"use client";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import useCareerActions from "@/hooks/useSkillAndCareerActions";
import type { Career } from "@/types/model";

interface CareerActionsProps {
  readonly selectedItems: Career[];
}

export default function CareerActions({ selectedItems }: CareerActionsProps) {
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const { handleDeleteCareers, isDeletingCareer } = useCareerActions();

  if (selectedItems.length === 0) return null;

  const handleDeleteSelected = async () => {
    try {
      await handleDeleteCareers(selectedItems.map(item => item.careerId));
      setIsDeleteOpen(false);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <div className="flex items-center gap-3 px-4 py-2 border border-border rounded-xl mb-4">
        <span className="text-sm font-medium">Đã chọn {selectedItems.length} ngành nghề</span>
        <div className={"flex gap-4 ml-auto"}>
          <Button
            variant="destructive"
            size={"sm"}
            className="rounded-xl"
            onClick={() => setIsDeleteOpen(true)}>
            <Trash2 className="w-4 h-4" />
            Xóa
          </Button>
        </div>
      </div>

      <ConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title={`Xóa ${selectedItems.length} ngành nghề?`}
        description="Hành động này không thể hoàn tác."
        confirmText="Xóa"
        confirmBtnClass="bg-destructive text-white"
        onConfirm={handleDeleteSelected}
        isLoading={isDeletingCareer}
        disableCancel={isDeletingCareer}
      />
    </>
  );
}