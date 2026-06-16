"use client";

import { Blog } from "@/types/model";
import { Button } from "@/components/ui/button";
import { Edit, Eye, EyeOff, FileText, Loader2, Trash2 } from "lucide-react";
import Link from "next/link";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import { useBlogConfirmDialog } from "@/hooks/useBlogConfirmDialog";
import useBlogActions from "@/hooks/useBlogActions";
import { useUser } from "@/hooks/useUser";
import { ROLE } from "@/constants/constant";
import DisableBlogsDialog from "@/components/management/blogs/DisableBlogsDialog";
import { useMemo } from "react";
import { HasAdmin, HasRecruiter } from "@/components/common/HasRole";

interface BlogActionsCellProps {
  blog: Blog;
}

const BlogActionsCell = ({ blog }: BlogActionsCellProps) => {
  const {
    handleDeleteBlogs,
    handleEnableBlogs,
    handleDisableBlogs,
    isDeleting,
    isEnabling,
    isDisabling
  } = useBlogActions();
  const { user } = useUser();

  const { actionType, dialogConfig, openDialog, closeDialog, handleConfirm, isLoading } =
    useBlogConfirmDialog({
      onConfirm: async (type, ids, reason) => {
        if (type === "delete") {
          await handleDeleteBlogs([ids[0]]);
        } else if (type === "enable") {
          await handleEnableBlogs([ids[0]]);
        } else if (type === "disable") {
          await handleDisableBlogs([ids[0]], reason);
        }
      },
      isDeleting,
      isEnabling,
      isDisabling
    });

  const detailLink = useMemo<string>(() => {
    switch (user?.role.name) {
      case ROLE.SUPER_ADMIN:
        return `/admin/blog/${blog.blogId}`;
      case ROLE.HR:
        return `/recruiter-portal/blogs/${blog.blogId}`;
      default:
        return `/blogs/${blog.blogId}`;
    }
  }, [blog, user])

  return (
    <>
      <div className="flex items-center gap-2">
        <Link href={detailLink}>
          <Button
            size={"icon"}
            className={"rounded-xl"}
            variant={"outline"}
            title="Xem chi tiết"
          >
            <FileText className={"h-4 w-4"} />
          </Button>
        </Link>
        <HasAdmin user={user}>
          <Button
            size={"icon"}
            variant={"outline"}
            disabled={isLoading}
            className={`rounded-xl ${
              blog.enabled
                ? "text-orange-500 hover:text-orange-600 hover:bg-orange-50 border-orange-200"
                : "text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
            }`}
            title={blog.enabled ? "Ẩn bài viết" : "Hiển thị bài viết"}
            onClick={() =>
              openDialog(
                blog.enabled ? "disable" : "enable",
                [blog.blogId]
              )
            }
          >
            {blog.enabled ? (
              <EyeOff className={"h-4 w-4"} />
            ) : (
              <Eye className={"h-4 w-4"} />
            )}
          </Button>
        </HasAdmin>
        <HasRecruiter user={user}>
          <Link href={`/recruiter-portal/blogs/form?blogId=${blog.blogId}`}>
            <Button
              size={"icon"}
              className={"rounded-xl"}
              variant={"outline"}
              title="Chỉnh sửa"
            >
              <Edit className={"h-4 w-4"} />
            </Button>
          </Link>

          <Button
            size={"icon"}
            className="rounded-xl text-destructive hover:text-destructive hover:bg-destructive/10"
            variant={"outline"}
            title="Xóa"
            disabled={isLoading}
            onClick={() => openDialog("delete", [blog.blogId])}
          >
            {isLoading && actionType === "delete" ? (
              <Loader2 className={"h-4 w-4 animate-spin"} />
            ) : (
              <Trash2 className={"h-4 w-4"} />
            )}
          </Button>
        </HasRecruiter>
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
};

export default BlogActionsCell;