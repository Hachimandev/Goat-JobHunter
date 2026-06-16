"use client";
import { Button } from "@/components/ui/button";
import { Edit3, Trash2 } from "lucide-react";
import { useState } from "react";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import type { Career } from "@/types/model";
import EditCareerDialog from "./EditCareerDialog";
import useCareerActions from "@/hooks/useSkillAndCareerActions";

interface CareerActionsCellProps {
  readonly career: Career;
}

export default function CareerActionsCell({ career }: CareerActionsCellProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const { handleDeleteCareers, isDeletingCareer } = useCareerActions();

  const handleConfirmDelete = async () => {
    try {
      await handleDeleteCareers([career.careerId]);
      setIsDeleteOpen(false);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <Button
          size="icon"
          variant="outline"
          className="rounded-xl"
          title="Chỉnh sửa"
          onClick={() => setIsEditOpen(true)}>
          <Edit3 className="h-4 w-4" />
        </Button>

        <Button
          size="icon"
          variant="destructive"
          className="rounded-xl"
          title="Xóa ngành nghề"
          onClick={() => setIsDeleteOpen(true)}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <EditCareerDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        career={career}
      />

      <ConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title="Xóa ngành nghề?"
        description="Hành động này không thể hoàn tác."
        confirmText="Xóa"
        confirmBtnClass="bg-destructive text-white"
        onConfirm={handleConfirmDelete}
        isLoading={isDeletingCareer}
        disableCancel={isDeletingCareer}
      />
    </>
  );
}