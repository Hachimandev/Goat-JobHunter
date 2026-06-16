import React, { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface DisableJobsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (reason: string) => void;
}

const DisableJobsDialog = ({
  open,
  onOpenChange,
  onConfirm
}: DisableJobsDialogProps) => {

  const [reason, setReason] = useState<string>("");

  const handleConfirm = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();

    if (!reason.trim()) {
      toast.error("Vui lòng nhập lý do ẩn công việc.");
      return;
    }

    onConfirm(reason);
    setReason("");
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="rounded-xl">
        <AlertDialogHeader>
          <AlertDialogTitle>Xác nhận ẩn công việc đã chọn?</AlertDialogTitle>
          <AlertDialogDescription>
            Hành động này sẽ ẩn các công việc đã chọn khỏi trang hiển thị công khai và gửi thông báo đến các nhà tuyển dụng.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <Label className={"text-base font-semibold"} required>Lý do ẩn</Label>
        <Textarea
          className={"rounded-xl"}
          placeholder={"Lý do công việc này bị ẩn / không được chấp nhận"}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />

        <AlertDialogFooter>
          <AlertDialogCancel className={`rounded-xl`}>
            Hủy
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => handleConfirm(e)}
            className={`rounded-xl bg-orange-600 text-white hover:bg-orange-700`}
          >
            Xác nhận
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DisableJobsDialog;