'use client';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, Video, FileText } from 'lucide-react';
import { formatDateTime } from '@/utils/formatDate';

interface InterviewDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  interview: {
    interviewId?: number;
    scheduledAt?: string;
    type?: string;
    location?: string;
    notes?: string;
  };
  jobTitle?: string;
}

export default function InterviewDetailDialog({
  open,
  onOpenChange,
  interview,
  jobTitle,
}: Readonly<InterviewDetailDialogProps>) {
  if (!interview.scheduledAt) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl rounded-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            <DialogTitle>Chi tiết lịch phỏng vấn</DialogTitle>
          </div>
          {jobTitle && (
            <DialogDescription>
              Vị trí: <span className="font-medium text-foreground">{jobTitle}</span>
            </DialogDescription>
          )}
        </DialogHeader>
        <div className="mt-4 space-y-6">
          {/* Thời gian */}
          <div className="flex items-start gap-3">
            <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground mb-1">Thời gian phỏng vấn</p>
              <p className="text-base font-semibold">{formatDateTime(interview.scheduledAt)}</p>
            </div>
          </div>

          {/* Hình thức */}
          {interview.type && (
            <div className="flex items-start gap-3">
              <Video className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground mb-1">Hình thức</p>
                <Badge variant="secondary" className="text-sm">
                  {interview.type}
                </Badge>
              </div>
            </div>
          )}

          {/* Địa điểm */}
          {interview.location && (
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground mb-1">Địa điểm</p>
                <p className="text-base">{interview.location}</p>
              </div>
            </div>
          )}

          {/* Ghi chú */}
          {interview.notes && (
            <div className="flex items-start gap-3">
              <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground mb-1">Ghi chú</p>
                <div className="rounded-lg bg-muted/50 p-4">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{interview.notes}</p>
                </div>
              </div>
            </div>
          )}

          {/* Lưu ý */}
          <div className="rounded-lg bg-blue-50 dark:bg-blue-950/20 p-4 border border-blue-200 dark:border-blue-900">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              💡 <span className="font-medium">Lưu ý:</span> Vui lòng chuẩn bị đầy đủ trước buổi phỏng vấn và đến đúng
              giờ. Nếu có thay đổi, hãy liên hệ với nhà tuyển dụng sớm nhất có thể.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
