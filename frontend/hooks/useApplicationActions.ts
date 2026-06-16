import { toast } from "sonner";
import { InterviewType } from "@/types/enum";
import {
  useAcceptApplicationStatusMutation,
  useRejectApplicationStatusMutation
} from "@/services/application/applicationApi";

const UseApplicationActions = () => {
  const [acceptApplications, { isLoading: isAccepting }] = useAcceptApplicationStatusMutation();
  const [rejectApplications, { isLoading: isRejecting }] = useRejectApplicationStatusMutation();

  const handleAcceptApplications = async ({ applicationIds, interviewDate, interviewType, location, note }: {
    applicationIds: number[],
    interviewDate: Date,
    interviewType: InterviewType,
    location: string,
    note: string
  }) => {
    try {
      if (applicationIds.length === 0) {
        toast.error("Không có đơn ứng tuyển nào được chọn.");
        return;
      }

      await acceptApplications({
        applicationIds,
        interviewDate,
        interviewType,
        location,
        note
      });
    } catch (e) {
      console.error(e);
      toast.error("Không thể chấp nhận đơn ứng tuyển. Vui lòng thử lại sau.");
    }
  };

  const handleRejectApplications = async ({ applicationIds, reason }: {
    applicationIds: number[],
    reason: string
  }) => {
    try {
      if (applicationIds.length === 0) {
        toast.error("Không có đơn ứng tuyển nào được chọn.");
        return;
      }

      await rejectApplications({
        applicationIds,
        reason
      });
    } catch (e) {
      console.error(e);
      toast.error("Không thể từ chối đơn ứng tuyển. Vui lòng thử lại sau.");
    }
  };

  return {
    handleAcceptApplications,
    handleRejectApplications,
    isAccepting,
    isRejecting
  };
};
export default UseApplicationActions;
