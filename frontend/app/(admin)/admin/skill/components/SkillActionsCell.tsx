"use client";
import { Button } from "@/components/ui/button";
import { Edit3, Trash2 } from "lucide-react";
import { useState } from "react";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import type { Skill } from "@/types/model";
import EditSkillDialog from "./EditSkillDialog";
import useSkillAndCareerActions from "@/hooks/useSkillAndCareerActions";

interface SkillActionsCellProps {
  readonly skill: Skill;
}

export default function SkillActionsCell({ skill }: SkillActionsCellProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const { handleDeleteSkills, isDeletingSkill } = useSkillAndCareerActions();

  const handleConfirmDelete = async () => {
    try {
      await handleDeleteSkills([skill.skillId]);
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
          title="Xóa kỹ năng"
          onClick={() => setIsDeleteOpen(true)}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <EditSkillDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        skill={skill}
      />

      <ConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title="Xóa kỹ năng?"
        description="Hành động này không thể hoàn tác."
        confirmText="Xóa"
        confirmBtnClass="bg-destructive text-white"
        onConfirm={handleConfirmDelete}
        isLoading={isDeletingSkill}
        disableCancel={isDeletingSkill}
      />
    </>
  );
}