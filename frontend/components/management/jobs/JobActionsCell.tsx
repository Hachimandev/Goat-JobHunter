"use client";

import ConfirmDialog from "@/components/common/ConfirmDialog";
import { Button } from "@/components/ui/button";
import useJobActions from "@/hooks/useJobActions";
import { Job } from "@/types/model";
import { Ban, CheckCircle, Edit, Eye, EyeOff, FileText, Loader2, Trash2 } from "lucide-react";
import Link from "next/link";
import { useJobConfirmDialog } from "@/hooks/useJobConfirmDialog";
import { ReactNode } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useUser } from "@/hooks/useUser";
import { HasAdmin, HasRecruiter } from "@/components/common/HasRole";
import DisableJobsDialog from "@/components/management/jobs/DisableJobsDialog";

const TooltipExpiredWrapper = ({ isExpired, children }: { isExpired: boolean, children: ReactNode }) => {
  if (!isExpired) return children;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div>
          {children}
        </div>
      </TooltipTrigger>
      <TooltipContent side={"bottom"} align={"center"}>
        <p>Không thể kích hoạt vì đã quá hạn. Vui lòng cập nhật lại ngày kết thúc</p>
      </TooltipContent>
    </Tooltip>
  );
};

const JobActionsCell = ({ job }: { job: Job }) => {
  const {
    handleToggleStatus,
    handleDeleteJob,
    handleEnableJobs,
    handleDisableJobs,
    isActivating,
    isDeactivating,
    isDeleting,
    isEnabling,
    isDisabling,
  } = useJobActions();
  const { user } = useUser();

  const { actionType, dialogConfig, openDialog, closeDialog, handleConfirm, isLoading } =
    useJobConfirmDialog({
      onConfirm: async (type, ids, reason) => {
        if (type === "delete") {
          await handleDeleteJob(ids[0]);
        } else if (type === "activate" || type === "deactivate") {
          await handleToggleStatus(ids[0], job.active);
        } else if (type === "enable") {
          await handleEnableJobs([ids[0]]);
        } else if (type === "disable") {
          await handleDisableJobs([ids[0]], reason);
        }
      },
      isActivating,
      isDeactivating,
      isDeleting,
      isEnabling,
      isDisabling,
    });

  const isExpired = job.endDate ? new Date(job.endDate) < new Date() : false;

  return (
    <>
      <div className="flex items-center gap-2">
        <Link href={`/jobs/${job.jobId}`}>
          <Button
            variant="outline"
            size="icon"
            className="rounded-xl"
            title="Xem chi tiết"
          >
            <FileText className="w-4 h-4" />
          </Button>
        </Link>

        <HasRecruiter user={user}>
          {job.active ? (
            <Button
              variant="outline"
              size="icon"
              disabled={isLoading}
              className="rounded-xl text-orange-500 hover:text-orange-600 hover:bg-orange-50 border-orange-200"
              onClick={() => openDialog("deactivate", [job.jobId], job.title)}
              title="Ngừng tuyển"
            >
              <Ban className="w-4 h-4" />
            </Button>
          ) : (
            <TooltipExpiredWrapper isExpired={isExpired}>
              <Button
                variant="outline"
                size="icon"
                disabled={isLoading || isExpired}
                className="rounded-xl text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
                onClick={() => openDialog("activate", [job.jobId], job.title)}
                title="Đăng tuyển lại"
              >
                <CheckCircle className="w-4 h-4" />
              </Button>
            </TooltipExpiredWrapper>
          )}

          <Link href={`/recruiter-portal/jobs/form?jobId=${job.jobId}`}>
            <Button
              variant="outline"
              size="icon"
              className="rounded-xl"
              title="Chỉnh sửa"
            >
              <Edit className="w-4 h-4" />
            </Button>
          </Link>

          <Button
            variant="outline"
            size="icon"
            className="rounded-xl text-destructive hover:text-destructive hover:bg-destructive/10"
            title="Xóa"
            disabled={isLoading}
            onClick={() => openDialog("delete", [job.jobId], job.title)}
          >
            {isLoading && actionType === "delete" ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
          </Button>
        </HasRecruiter>

        <HasAdmin user={user}>
          <Button
            size="icon"
            variant="outline"
            disabled={isLoading}
            className={`rounded-xl ${
              job.enabled
                ? "text-orange-500 hover:text-orange-600 hover:bg-orange-50 border-orange-200"
                : "text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
            }`}
            title={job.enabled ? "Ẩn công việc" : "Hiển thị công việc"}
            onClick={() =>
              openDialog(
                job.enabled ? "disable" : "enable",
                [job.jobId],
                job.title
              )
            }
          >
            {job.enabled ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </Button>
        </HasAdmin>
      </div>

      <ConfirmDialog
        open={actionType === "delete" || actionType === "activate" || actionType === "deactivate" || actionType === "enable"}
        onOpenChange={(open) => !open && closeDialog()}
        title={dialogConfig.title}
        description={dialogConfig.description}
        confirmText={dialogConfig.confirmText}
        confirmBtnClass={dialogConfig.confirmBtnClass}
        onConfirm={handleConfirm}
        isLoading={isLoading}
        disableCancel={isLoading}
      />

      <DisableJobsDialog
        open={actionType === "disable"}
        onOpenChange={(open) => !open && closeDialog()}
        onConfirm={(reason) => handleConfirm(reason)}
      />
    </>
  );
};

export default JobActionsCell;