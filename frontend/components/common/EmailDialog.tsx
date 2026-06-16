"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Applicant, Application } from "@/types/model";
import { useMemo } from "react";
import { AcceptFormData, RejectFormData } from "@/components/common/Form/schema";
import AcceptForm from "@/components/common/Form/AcceptForm";
import RejectForm from "@/components/common/Form/RejectForm";

export type EmailDialogMode = "accept" | "reject" | "invite";

interface TitleProps {
  mode: EmailDialogMode;
  isBulk: boolean;
  count: number;
}

const Title = ({ mode, isBulk, count }: TitleProps) => {
  switch (mode) {
    case "accept":
      return isBulk ? `Gửi email mời phỏng vấn cho ${count} ứng viên` : "Gửi email mời phỏng vấn";
    case "reject":
      return isBulk ? `Gửi email từ chối cho ${count} ứng viên` : "Gửi email từ chối";
    case "invite":
      return isBulk ? `Gửi email mời tham gia ứng tuyển cho ${count} ứng viên` : "Gửi email mời tham gia ứng tuyển";
    default:
      return "";
  }
};

interface DescriptionProps {
  isBulk: boolean;
  applicant?: Applicant;
  application?: Application;
}

const Description = ({ isBulk, application, applicant }: DescriptionProps) => {
  if (isBulk) {
    return (
      <p className="text-sm text-gray-500">
        Hành động này sẽ áp dụng cho tất cả các ứng viên đã chọn.
      </p>
    );
  }

  if (application) {
    return (
      <p className="text-sm text-gray-500">
        Email: {application.email}
      </p>
    );
  }

  if (applicant) {
    return (
      <p className="text-sm text-gray-500">
        Email: {applicant.email}
      </p>
    );
  }

  return null;
};

interface EmailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: EmailDialogMode;
  isLoading: boolean;
  onAcceptSubmit: (data: AcceptFormData) => Promise<void>;
  onRejectSubmit: (data: RejectFormData) => Promise<void>;
  onInvite: () => void;
  application?: Application;
  applicant?: Applicant;
  selectedCount?: number;
}

const EmailDialog = ({
 open,
 onOpenChange,
 mode,
 isLoading,
 onAcceptSubmit,
 onRejectSubmit,
 onInvite,
 application,
 applicant,
 selectedCount = 0
}: EmailDialogProps) => {

  const isBulk = useMemo(() => selectedCount > 0, [selectedCount]);
  const count = useMemo(() => isBulk ? selectedCount : 1, [isBulk, selectedCount]);

  const btnVariant = useMemo(() => {
    if (mode === "accept") return "default";
    if (mode === "reject") return "destructive";
    return "default";
  }, [mode]);

  const btnForm = useMemo(() => {
    if (mode === "accept") return "accept-form";
    if (mode === "reject") return "reject-form";
    return "";
  }, [mode]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl rounded-xl">
        <DialogHeader
          className="rounded-t-xl px-6 pt-4 -mx-6 -mt-6"
        >
          <DialogTitle
            className="text-xl font-semibold"
          >
            <Title mode={mode} isBulk={isBulk} count={count} />
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-4">
          <div className={"p-2 border-border border rounded-xl"}>
            <Description isBulk={isBulk} application={application} applicant={applicant} />
          </div>

          {mode === "accept" && <AcceptForm onSubmit={onAcceptSubmit} open={open} />}

          {mode == "reject" && <RejectForm onSubmit={onRejectSubmit} open={open} />}
        </div>

        <DialogFooter className="bg-gray-50 -mx-6 -mb-6 px-6 py-4 rounded-b-xl">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            type="button"
            className="rounded-xl"
          >
            Huỷ
          </Button>
          {["accept", "reject"].includes(mode) &&
            <Button
              type="submit"
              form={btnForm}
              variant={btnVariant}
              disabled={isLoading}
              className="rounded-xl"
            >
              {isLoading ? "Đang gửi..." : "Xác nhận"}
            </Button>
          }
          {mode === "invite" &&
            <Button
              type="button"
              variant={btnVariant}
              disabled={isLoading}
              onClick={onInvite}
              className="rounded-xl"
            >
              {isLoading ? "Đang gửi..." : "Gửi email"}
            </Button>
            }
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EmailDialog;
