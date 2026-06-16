"use client";

import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Trash2 } from "lucide-react";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import { useBlogConfirmDialog } from "@/hooks/useBlogConfirmDialog";
import useBlogActions from "@/hooks/useBlogActions";
import { useUser } from "@/hooks/useUser";
import DisableBlogsDialog from "@/components/management/blogs/DisableBlogsDialog";
import { HasAdmin, HasRecruiter } from "@/components/common/HasRole";

interface BlogActionsProps {
  selectedCount: number;
  selectedIds: number[];
}

export default function BlogActions({
  selectedCount,
  selectedIds
}: Readonly<BlogActionsProps>) {
  const {
    handleDeleteBlogs,
    handleDisableBlogs,
    handleEnableBlogs,
    isDeleting,
    isEnabling,
    isDisabling
  } = useBlogActions();
  const { user } = useUser();

  const { actionType, dialogConfig, openDialog, closeDialog, handleConfirm, isLoading } =
    useBlogConfirmDialog({
      onConfirm: async (type, ids, reason) => {
        if (type === "delete") {
          await handleDeleteBlogs(ids);
        } else if (type === "enable") {
          await handleEnableBlogs(ids);
        } else if (type === "disable") {
          await handleDisableBlogs(ids, reason);
        }
      },
      isDeleting,
      isEnabling,
      isDisabling
    });

  if (selectedCount === 0) return null;

  return (
    <>
      <div className="flex items-center gap-3 px-4 py-2 border border-border rounded-xl mb-4">
        <span className="text-sm font-medium">
          Đã chọn {selectedCount} bài viết
        </span>
        <div className="flex gap-4 ml-auto">
          <HasAdmin user={user}>
            <Button
              variant="outline"
              size="sm"
              onClick={() => openDialog("enable", selectedIds)}
              className="text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200 rounded-xl"
            >
              <Eye className="h-4 w-4" />
              Hiển thị
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => openDialog("disable", selectedIds)}
              className="text-orange-500 hover:text-orange-600 hover:bg-orange-50 border-orange-200 rounded-xl"
            >
              <EyeOff className="h-4 w-4" />
              Ẩn
            </Button>
          </HasAdmin>
          <HasRecruiter user={user}>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => openDialog("delete", selectedIds)}
              className="gap-2 rounded-xl"
            >
              <Trash2 className="h-4 w-4" />
              Xóa
            </Button>
          </HasRecruiter>
        </div>
      </div>

      <ConfirmDialog
        open={actionType === "delete" || actionType === "enable"}
        onOpenChange={(open) => !open && closeDialog()}
        title={dialogConfig.title}
        description={dialogConfig.description}
        confirmText={dialogConfig.confirmText}
        confirmBtnClass={dialogConfig.confirmBtnClass}
        onConfirm={handleConfirm}
        isLoading={isLoading}
        disableCancel={isLoading}
      />

      <DisableBlogsDialog
        open={actionType === "disable"}
        onOpenChange={(open) => !open && closeDialog()}
        onConfirm={(reason) => handleConfirm(reason)}
      />
    </>
  );
}