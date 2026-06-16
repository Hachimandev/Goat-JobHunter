import { useMemo, useState } from "react";

export type PermissionActionType = "delete" | null;

interface UsePermissionConfirmDialogProps {
  onConfirm: (type: PermissionActionType, ids: number[]) => Promise<void>;
  isDeleting?: boolean;
}

export const usePermissionConfirmDialog = ({ onConfirm, isDeleting = false }: UsePermissionConfirmDialogProps) => {
  const [actionType, setActionType] = useState<PermissionActionType>(null);
  const [targetIds, setTargetIds] = useState<number[]>([]);
  const [targetName, setTargetName] = useState<string>("");

  const openDialog = (type: PermissionActionType, ids: number[], name?: string) => {
    setActionType(type);
    setTargetIds(ids);
    setTargetName(name || "");
  };

  const closeDialog = () => {
    setActionType(null);
    setTargetIds([]);
    setTargetName("");
  };

  const handleConfirm = async () => {
    try {
      await onConfirm(actionType, targetIds);
      closeDialog();
    } catch (error) {
      console.error("Permission action failed", error);
    }
  };

  const dialogConfig = useMemo(() => {
    const count = targetIds.length;
    return {
      title: "Xóa quyền?",
      description: targetName ? (
        <>
          Hành động này không thể hoàn tác. Quyền{" "}
          <span className="font-bold text-foreground">&quot;{targetName}&quot;</span> sẽ bị xóa.
        </>
      ) : (
        <>{count} quyền sẽ bị xóa. Hành động không thể hoàn tác.</>
      ),
      confirmText: "Xóa quyền",
      confirmBtnClass: "bg-destructive text-white"
    };
  }, [targetIds.length, targetName]);

  return {
    actionType,
    dialogConfig,
    openDialog,
    closeDialog,
    handleConfirm,
    isLoading: isDeleting
  };
};