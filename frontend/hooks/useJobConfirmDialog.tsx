import { useMemo, useState } from "react";

export type JobActionType =
  | "activate"
  | "deactivate"
  | "delete"
  | "enable"
  | "disable"
  | null;

interface UseJobConfirmDialogProps {
  onConfirm: (actionType: JobActionType, ids: number[], reason?: string) => Promise<void>;
  isActivating?: boolean;
  isDeactivating?: boolean;
  isDeleting?: boolean;
  isEnabling?: boolean;
  isDisabling?: boolean;
}

type DialogMeta = {
  title: string;
  singleMessage: string;
  multipleMessage: string;
  confirmText: string;
  confirmBtnClass: string;
};

const ACTION_CONFIG: Record<Exclude<JobActionType, null>, DialogMeta> = {
  delete: {
    title: "Xóa công việc?",
    singleMessage: 'Hành động này không thể hoàn tác. Công việc sẽ bị xóa vĩnh viễn.',
    multipleMessage: "Hành động này không thể hoàn tác. {count} công việc sẽ bị xóa vĩnh viễn.",
    confirmText: "Xóa công việc",
    confirmBtnClass:
      "bg-destructive text-destructive-foreground hover:bg-destructive/90 text-white",
  },
  activate: {
    title: "Đăng tuyển lại?",
    singleMessage: "Công việc sẽ hiển thị công khai trở lại.",
    multipleMessage: "{count} công việc sẽ hiển thị công khai trở lại.",
    confirmText: "Đăng tuyển",
    confirmBtnClass: "bg-green-600 text-white hover:bg-green-700",
  },
  enable: {
    title: "Hiển thị công việc?",
    singleMessage: "Công việc sẽ hiển thị công khai trở lại.",
    multipleMessage: "{count} công việc sẽ hiển thị công khai trở lại.",
    confirmText: "Hiển thị",
    confirmBtnClass: "bg-green-600 text-white hover:bg-green-700",
  },
  deactivate: {
    title: "Ngừng tuyển dụng?",
    singleMessage: "Công việc sẽ bị ẩn khỏi trang tìm kiếm.",
    multipleMessage: "{count} công việc sẽ bị ẩn khỏi trang tìm kiếm.",
    confirmText: "Ngừng tuyển",
    confirmBtnClass: "bg-orange-600 text-white hover:bg-orange-700",
  },
  disable: {
    title: "Ẩn công việc?",
    singleMessage: "Công việc sẽ bị ẩn.",
    multipleMessage: "{count} công việc sẽ bị ẩn.",
    confirmText: "Ẩn",
    confirmBtnClass: "bg-gray-600 text-white hover:bg-gray-700",
  },
};

export const useJobConfirmDialog = ({
                                      onConfirm,
                                      isActivating = false,
                                      isDeactivating = false,
                                      isDeleting = false,
                                      isEnabling = false,
                                      isDisabling = false,
                                    }: UseJobConfirmDialogProps) => {
  const [actionType, setActionType] = useState<JobActionType>(null);
  const [targetIds, setTargetIds] = useState<number[]>([]);
  const [targetTitle, setTargetTitle] = useState<string>("");

  const openDialog = (type: JobActionType, ids: number[], title?: string) => {
    setActionType(type);
    setTargetIds(ids);
    setTargetTitle(title || "");
  };

  const closeDialog = () => {
    setActionType(null);
    setTargetIds([]);
    setTargetTitle("");
  };

  const handleConfirm = async (reason?: string) => {
    try {
      await onConfirm(actionType, targetIds, reason);
      closeDialog();
    } catch (error) {
      console.error("Action failed", error);
    }
  };

  const renderDescription = (
    config: DialogMeta,
    count: number,
    title?: string
  ) => {
    if (title) {
      return (
        <>
          Công việc{" "}
          <span className="font-bold text-foreground">
            &quot;{title}&quot;
          </span>{" "}
          {config.singleMessage}
        </>
      );
    }

    return <>{config.multipleMessage.replace("{count}", String(count))}</>;
  };

  const dialogConfig = useMemo(() => {
    if (!actionType) return { title: "", description: null };

    const config = ACTION_CONFIG[actionType];
    const count = targetIds.length;

    return {
      title: config.title,
      description: renderDescription(config, count, targetTitle),
      confirmText: config.confirmText,
      confirmBtnClass: config.confirmBtnClass,
    };
  }, [actionType, targetIds.length, targetTitle]);

  return {
    actionType,
    dialogConfig,
    openDialog,
    closeDialog,
    handleConfirm,
    isLoading:
      isActivating ||
      isDeactivating ||
      isDeleting ||
      isEnabling ||
      isDisabling,
  };
};
