"use client";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import type { Permission } from "@/types/model";
import { usePermissionConfirmDialog } from "@/app/(admin)/admin/permission/hooks/usePermissionConfirmDialog";
import useRoleAndPermissionActions from "@/hooks/useRoleAndPermissionActions";

interface Props {
  readonly selectedItems: Permission[];
}

export default function PermissionActions({ selectedItems }: Props) {
  const ids = selectedItems.map((p) => p.permissionId);
  const { handleDeletePermission, isDeletingPermission } = useRoleAndPermissionActions();

  const { actionType, dialogConfig, openDialog, closeDialog, handleConfirm, isLoading } =
    usePermissionConfirmDialog({
      onConfirm: async (type, ids) => {
        if (type === "delete") {
          await Promise.all(ids.map((id) => handleDeletePermission(id)));
        }
      },
      isDeleting: isDeletingPermission
    });

  if (!selectedItems || selectedItems.length === 0) return null;

  return (
    <>
      <div className="flex items-center gap-3 px-4 py-2 border border-border rounded-xl mb-4">
        <span className="text-sm font-medium">Đã chọn {selectedItems.length} quyền</span>
        <div className="flex gap-4 ml-auto">
          <Button variant="destructive" size="sm" onClick={() => openDialog("delete", ids)} className="rounded-xl">
            <Trash2 className="h-4 w-4 mr-2" />
            Xóa
          </Button>
        </div>
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
    </>
  );
}