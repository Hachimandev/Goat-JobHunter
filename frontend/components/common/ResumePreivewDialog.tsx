"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Application } from "@/types/model";
import { Download, FileText } from "lucide-react";
import { useMemo, useState } from "react";

interface ResumePreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  application: Application;
}

export default function ResumePreviewDialog({
  open,
  onOpenChange,
  application,
}: Readonly<ResumePreviewDialogProps>) {
  const [isIframeLoading, setIsIframeLoading] = useState(true);

  const resumeUrl = application.resume.fileUrl || "";
  const isPdf = resumeUrl.toLowerCase().endsWith(".pdf");
  const applicantName = useMemo(
    () => (application.applicant.fullName ? application.applicant.fullName : "Ứng_viên"),
    [application.applicant],
  );
  const jobTitle = useMemo(
    () => (application.job?.title ? application.job.title : "Việc_làm"),
    [application.job],
  );

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = resumeUrl;
    link.download = `CV_${applicantName}_${jobTitle}.pdf`;
    link.click();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl w-full h-[90vh] rounded-2xl p-0 flex flex-col overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-1">
              <DialogTitle className="text-xl">
                CV - {applicantName}
              </DialogTitle>
              <DialogDescription>
                Ứng tuyển vào vị trí:{" "}
                <span className="font-semibold text-foreground">
                  {jobTitle}
                </span>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 relative flex flex-col">
          {isPdf ? (
            <div className="flex-1 relative px-6 pb-6">
              {isIframeLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-muted/50 z-10">
                  <div className="flex flex-col items-center gap-2">
                    <FileText className="h-12 w-12 text-muted-foreground animate-pulse" />
                    <p className="text-sm text-muted-foreground">
                      Đang tải CV...
                    </p>
                  </div>
                </div>
              )}
              <iframe
                src={`${resumeUrl}`}
                className="w-full h-full border-0 rounded-xl"
                title="Resume Preview"
                onLoad={() => setIsIframeLoading(false)}
              />
            </div>
          ) : (
            // Non-PDF preview
            <div className="flex-1 flex flex-col items-center justify-center px-6">
              <FileText className="h-20 w-20 text-muted-foreground mb-4" />
              <div className="text-center space-y-2">
                <p className="text-lg font-medium text-foreground">
                  Không thể xem trước file này
                </p>
                <p className="text-sm text-muted-foreground">
                  File không phải định dạng PDF. Vui lòng tải xuống để xem.
                </p>
              </div>
              <Button onClick={handleDownload} className="rounded-xl mt-4">
                <Download className="h-4 w-4 mr-2" />
                Tải xuống CV
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
