import { useUser } from "@/hooks/useUser";
import {
  useActivateJobsMutation,
  useCreateJobMutation,
  useDeactivateJobsMutation,
  useDeleteJobMutation,
  useDisabledJobsMutation,
  useEnabledJobsMutation,
  useUpdateJobMutation
} from "@/services/job/jobApi";
import {
  useSaveJobsMutation,
  useUnsaveJobsMutation
} from "@/services/user/savedJobsApi";
import { Job } from "@/types/model";
import { useCallback } from "react";
import { toast } from "sonner";
import { JobActionType } from "@/types/enum";
import { JobFormData } from "@/components/legacy/schema";

const useJobActions = () => {
  const { user, isSignedIn } = useUser();
  const [saveJobs, { isSuccess: isSaveSuccess, isError: isSaveError }] =
    useSaveJobsMutation();
  const [unsaveJobs, { isSuccess: isUnsaveSuccess, isError: isUnsaveError }] =
    useUnsaveJobsMutation();
  const [createJob, { isLoading: isCreating }] = useCreateJobMutation();
  const [updateJob, { isLoading: isUpdating }] = useUpdateJobMutation();
  const [deleteJob, { isLoading: isDeleting }] = useDeleteJobMutation();
  const [activateJob, { isLoading: isActivating }] = useActivateJobsMutation();
  const [deactivateJob, { isLoading: isDeactivating }] =
    useDeactivateJobsMutation();
  const [enableJobs, { isLoading: isEnabling }] = useEnabledJobsMutation();
  const [disableJobs, { isLoading: isDisabling }] = useDisabledJobsMutation();

  const handleUnsaveJob = async (job: Job | null) => {
    if (!user) {
      toast.error("Bạn phải đăng nhập để thực hiện chức năng này.");
      return;
    }

    if (!job) {
      toast.error("Có lỗi khi lưu công việc. Vui lòng thử lại sau.");
      return;
    }

    await unsaveJobs({
      jobIds: [job.jobId]
    });

    if (isUnsaveSuccess) {
      toast.success("Đã bỏ lưu công việc.");
    }

    if (isUnsaveError) {
      toast.error("Đã xảy ra lỗi. Vui lòng thử lại.");
    }
  };

  const handleToggleSaveJob = async (
    e: React.MouseEvent,
    job: Job,
    isSaved: boolean
  ) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isSignedIn || !user) {
      toast.error("Bạn phải đăng nhập để thực hiện chức năng này.");
      return;
    }

    if (isSaved) {
      await unsaveJobs({
        jobIds: [job.jobId]
      });
    } else {
      await saveJobs({
        jobIds: [job.jobId]
      });
    }

    if (isSaveSuccess || isUnsaveSuccess) {
      toast.success(
        isSaved ? "Đã bỏ lưu công việc." : "Đã lưu công việc thành công."
      );
    }

    if (isSaveError || isUnsaveError) {
      toast.error("Đã xảy ra lỗi. Vui lòng thử lại.");
    }
  };

  const handleCreateJob = useCallback(
    async (jobData: JobFormData) => {
      try {
        if (!user?.accountId) {
          toast.error("Bạn phải đăng nhập để thực hiện chức năng này.");
          return;
        }

        const response = await createJob({
          recruiterId: user.accountId,
          active: true,
          careerId: Number(jobData.career),
          skillIds: jobData.skills.map((skill) => Number(skill.skillId)),
          description: jobData.description,
          endDate: jobData.endDate,
          location: jobData.location,
          level: jobData.level,
          quantity: jobData.quantity,
          salary: jobData.salary,
          startDate: jobData.startDate,
          title: jobData.title,
          workingType: jobData.workingType
        }).unwrap();

        if (response.data) {
          toast.success("Tạo công việc thành công!", {
            description: `Đã tạo công việc: ${jobData.title}`
          });
          return response.data;
        }
      } catch (error) {
        console.error("Failed to create job:", error);
        toast.error("Không thể tạo công việc. Vui lòng thử lại sau.");
        throw error;
      }
    },
    [createJob, user]
  );

  const handleDeleteJob = useCallback(
    async (jobId: number) => {
      try {
        const response = await deleteJob(jobId).unwrap();

        if (response.data) {
          toast.success("Xóa công việc thành công!");
          return response.data;
        }
      } catch (error) {
        console.error("Failed to delete job:", error);
        toast.error("Không thể xóa công việc. Vui lòng thử lại sau.");
        throw error;
      }
    },
    [deleteJob]
  );

  const handleUpdateJob = useCallback(
    async (jobId: number, jobData: JobFormData) => {
      try {
        if (!user?.accountId) {
          toast.error("Bạn phải đăng nhập để thực hiện chức năng này.");
          return;
        }

        const response = await updateJob({
          jobId: jobId.toString(),
          active: true,
          careerId: Number(jobData.career),
          skillIds: jobData.skills.map((skill) => Number(skill.skillId)),
          description: jobData.description,
          endDate: jobData.endDate,
          location: jobData.location,
          level: jobData.level,
          quantity: jobData.quantity,
          salary: jobData.salary,
          startDate: jobData.startDate,
          title: jobData.title,
          workingType: jobData.workingType
        }).unwrap();

        if (response.data) {
          toast.success("Cập nhật công việc thành công!", {
            description: `Đã cập nhật: ${jobData.title}`
          });
          return response.data;
        }
      } catch (error) {
        console.error("Failed to update job:", error);
        toast.error("Không thể cập nhật công việc. Vui lòng thử lại sau.");
        throw error;
      }
    },
    [updateJob, user]
  );

  const handleToggleStatus = useCallback(
    async (jobId: number, isActive: boolean) => {
      try {
        if (isActive) {
          await deactivateJob({ jobIds: [jobId] }).unwrap();
          toast.success("Đã ngừng tuyển công việc.");
        } else {
          const result = await activateJob({ jobIds: [jobId] }).unwrap();

          const failedByEndDatePassed = result?.data?.filter(
            (item) =>
              item.status === "fail" &&
              item.message.includes("End date has passed")
          );

          if (failedByEndDatePassed && failedByEndDatePassed.length > 0) {
            toast.error(
              `Không thể đăng tuyển lại công việc đã quá hạn kết thúc. Vui lòng cập nhật lại ngày kết thúc.`
            );
          } else {
            toast.success("Đã đăng tuyển lại công việc.");
          }
        }
      } catch (error) {
        console.error("Failed to toggle job status:", error);
        toast.error(
          "Không thể thay đổi trạng thái công việc. Vui lòng thử lại sau."
        );
        throw error;
      }
    },
    [activateJob, deactivateJob]
  );

  const handleActivateJobs = useCallback(
    async (jobIds: number[]) => {
      try {
        const result = await activateJob({ jobIds }).unwrap();

        const failedByEndDatePassed = result?.data?.filter(
          (item) =>
            item.status === "fail" &&
            item.message.includes("End date has passed")
        );

        if (failedByEndDatePassed && failedByEndDatePassed.length > 0) {
          toast.error(
            `Không thể đăng tuyển lại các công việc đã quá hạn kết thúc. Vui lòng cập nhật lại ngày kết thúc.`
          );
        } else {
          toast.success(
            `Đã đăng tuyển lại ${jobIds.length} công việc thành công.`
          );
        }
      } catch (error) {
        console.error("Failed to activate jobs:", error);
        toast.error("Không thể đăng tuyển lại công việc. Vui lòng thử lại sau.");
        throw error;
      }
    },
    [activateJob]
  );

  const handleDeactivateJobs = useCallback(
    async (jobIds: number[]) => {
      try {
        await deactivateJob({ jobIds }).unwrap();
        toast.success(`Đã ngừng tuyển ${jobIds.length} công việc.`);
      } catch (error) {
        console.error("Failed to deactivate jobs:", error);
        toast.error("Không thể ngừng tuyển công việc. Vui lòng thử lại sau.");
        throw error;
      }
    },
    [deactivateJob]
  );

  const handleEnableJobs = useCallback(
    async (jobIds: number[]) => {
      try {
        await enableJobs({ jobIds, reason: "", mode: JobActionType.ACCEPT }).unwrap();
        toast.success(
          `Đã hiển thị ${jobIds.length} công việc thành công.`
        );
      } catch (error) {
        console.error("Failed to enable jobs:", error);
        toast.error("Không thể hiển thị công việc. Vui lòng thử lại sau.");
        throw error;
      }
    },
    [enableJobs]
  );

  const handleDisableJobs = useCallback(
    async (jobIds: number[], reason?: string) => {
      try {
        await disableJobs({ jobIds, reason, mode: JobActionType.REJECT }).unwrap();
        toast.success(`Đã ẩn ${jobIds.length} công việc.`);
      } catch (error) {
        console.error("Failed to disable jobs:", error);
        toast.error("Không thể ẩn công việc. Vui lòng thử lại sau.");
        throw error;
      }
    },
    [disableJobs]
  );

  return {
    isCreating,
    isDeleting,
    isUpdating,
    isActivating,
    isDeactivating,
    isEnabling,
    isDisabling,

    handleUnsaveJob,
    handleToggleSaveJob,
    handleCreateJob,
    handleUpdateJob,
    handleDeleteJob,
    handleToggleStatus,
    handleActivateJobs,
    handleDeactivateJobs,
    handleEnableJobs,
    handleDisableJobs
  };
};

export default useJobActions;