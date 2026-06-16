"use client";
import { Button } from "@/components/ui/button";
import { Edit3, Shield, CheckCircle, XCircle } from "lucide-react";
import { useState } from "react";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import ManagePermissionsDialog from "./ManagePermissionsDialog";
import type { Role } from "@/types/model";
import useRoleAndPermissionActions from "@/hooks/useRoleAndPermissionActions";
import RoleDialog from "./RoleDialog";

interface RoleActionsCellProps {
  readonly role: Role;
}

export default function RoleActionsCell({ role }: RoleActionsCellProps) {
  const [isPermOpen, setIsPermOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [actionType, setActionType] = useState<"activate" | "deactivate" | null>(null);
  const {
    handleActivateRole,
    handleDeactivateRole,
    isActivating,
    isDeactivating
  } = useRoleAndPermissionActions();

  const openConfirm = (type: "activate" | "deactivate") => setActionType(type);

  const handleConfirm = async () => {
    if (!actionType) return;
    try {
      if (actionType === "activate") {
        await handleActivateRole(role.roleId);
      } else if (actionType === "deactivate") {
        await handleDeactivateRole(role.roleId);
      }
    } catch (e) {
      console.error(e);
    }
    setActionType(null);
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <Button
          size="icon"
          variant="outline"
          className={"rounded-xl"}
          title="Chỉnh sửa vai trò"
          onClick={() => setIsEditOpen(true)}>
          <Edit3 className="h-4 w-4" />
        </Button>

        <Button
          size="icon"
          variant="outline"
          className={"rounded-xl"}
          title="Quản lý quyền"
          onClick={() => setIsPermOpen(true)}>
          <Shield className="h-4 w-4" />
        </Button>

        {role.active ? (
          <Button
            size="icon"
            variant="outline"
            className="rounded-xl text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20"
            title="Vô hiệu hóa"
            onClick={() => openConfirm("deactivate")}>
            <XCircle className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            size="icon"
            variant="outline"
            className="rounded-xl text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
            title="Kích hoạt"
            onClick={() => openConfirm("activate")}>
            <CheckCircle className="h-4 w-4" />
          </Button>
        )}
      </div>

      <ConfirmDialog
        open={!!actionType}
        onOpenChange={(open) => !open && setActionType(null)}
        title={actionType === "activate" ? "Kích hoạt vai trò?" : "Vô hiệu hóa vai trò?"}
        description={actionType === "activate" ? "Xác nhận kích hoạt vai trò này ?" : "Xác nhận vô hiệu hóa vai trò này ?"}
        confirmText={actionType === "activate" ? "Kích hoạt" : "Vô hiệu hóa"}
        confirmBtnClass={actionType === "deactivate" ? "bg-destructive text-white" : "bg-primary text-white"}
        onConfirm={handleConfirm}
        isLoading={isActivating || isDeactivating}
        disableCancel={isActivating || isDeactivating}
      />

      <RoleDialog role={role} open={isEditOpen} onOpenChange={setIsEditOpen} />
      <ManagePermissionsDialog role={role} open={isPermOpen} onOpenChange={setIsPermOpen} />
    </>
  );
}