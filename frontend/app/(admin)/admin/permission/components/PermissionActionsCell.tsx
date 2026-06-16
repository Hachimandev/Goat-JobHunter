"use client";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import { useState } from "react";
import { Permission } from "@/types/model";
import { usePermissionConfirmDialog } from "../hooks/usePermissionConfirmDialog";
import EditPermissionDialog from "./EditPermissionDialog";
import useRoleAndPermissionActions from "@/hooks/useRoleAndPermissionActions";

export default function PermissionActionsCell({ permission }: { readonly permission: Permission }) {
  const { handleDeletePermission, isDeletingPermission } = useRoleAndPermissionActions();
  const [isEditOpen, setIsEditOpen] = useState(false);

  const { actionType, dialogConfig, openDialog, closeDialog, handleConfirm, isLoading } =
    usePermissionConfirmDialog({
      onConfirm: async (type, ids) => {
        if (type === "delete") {
          await handleDeletePermission(ids[0]);
        }
      },
      isDeleting: isDeletingPermission,
    });

  return (
    <>
      <div className="flex items-center gap-2">
        <Button size="icon" variant="outline" className="rounded-xl" title="Chỉnh sửa permission" onClick={() => setIsEditOpen(true)}>
          <Edit className="w-4 h-4" />
        </Button>

        <Button size="icon" variant="destructive" className="rounded-xl" title="Xóa permission" onClick={() => openDialog("delete", [permission.permissionId], permission.name)}>
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      <ConfirmDialog
        open={!!actionType}
        onOpenChange={(open) => !open && closeDialog()}
        title={dialogConfig.title}
        description={dialogConfig.description}
        confirmText={dialogConfig.confirmText}
        confirmBtnClass={dialogConfig.confirmBtnClass}
        onConfirm={handleConfirm}
        isLoading={isLoading}
        disableCancel={isLoading}
      />

      <EditPermissionDialog open={isEditOpen} onOpenChange={setIsEditOpen} permission={permission} />
    </>
  );
}