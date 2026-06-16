'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Application } from '@/types/model';
import { FileText, Download, Calendar, Clock, Eye, Mail } from 'lucide-react';
import { formatDate, formatDateTime } from '@/utils/formatDate';
import { useState } from 'react';
import CoverLetterDialog from './CoverLetterDialog';
import InterviewDetailDialog from './InterviewDetailDialog';
import { getStatusConfig } from '@/utils/getApplicationStatusContent';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface ApplicationCardProps {
  application: Application;
  downloadResume: (resumeId: string, fileName: string) => void;
  isDownloading: boolean;
}

export default function ApplicationCard({
  application,
  downloadResume,
  isDownloading,
}: Readonly<ApplicationCardProps>) {
  const [isCoverLetterOpen, setIsCoverLetterOpen] = useState(false);
  const [isInterviewDetailOpen, setIsInterviewDetailOpen] = useState(false);
  const statusConfig = getStatusConfig(application.status);

  const router = useRouter();

  const handleViewJobDetails = () => {
    if (application.job?.jobId) {
      router.push(`/jobs/${application.job.jobId}`);
    }
  };

  const handleViewResume = () => {
    if (application.resume?.fileUrl) {
      window.open(application.resume.fileUrl, '_blank');
    }
  };

  const handleDownloadResume = () => {
    if (application.resume?.resumeId) {
      downloadResume(String(application.resume.resumeId), application.applicant.fullName);
      return;
    }
    toast.error('Không có CV để tải xuống.');
  };

  return (
    <>
      <Card className="group border-2 rounded-xl hover:border-primary/50 bg-card hover:shadow-lg transition-all duration-300 h-full flex flex-col overflow-hidden relative py-3">
        <div className="absolute top-3 right-3 z-20">
          <Badge
            variant={statusConfig.variant}
            className={`${statusConfig.className} text-xs px-2.5 py-1 font-medium shadow-sm`}
          >
            {statusConfig.label}
          </Badge>
        </div>

        <CardContent className="flex flex-col h-full px-3">
          <div className="mb-4 w-full cursor-pointer" onClick={handleViewJobDetails}>
            <h3 className="font-bold text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors w-full">
              {application.job?.title || 'Chưa có tiêu đề'}
            </h3>
          </div>

          <div className="space-y-2.5">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="h-4 w-4 flex-shrink-0 text-primary" />
              <span className="truncate">{application.email}</span>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4 flex-shrink-0 text-primary" />
              <span>Ứng tuyển {formatDate(application.createdAt)}</span>
            </div>

            {application.interview?.scheduledAt && (
              <div className="flex items-center gap-2 text-sm bg-primary/5 rounded-lg px-3 py-2 border border-primary/20">
                <Calendar className="h-4 w-4 flex-shrink-0 text-primary" />
                <span className="text-foreground font-medium">
                  Phỏng vấn: {formatDateTime(application.interview.scheduledAt)}
                </span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2 mt-4">
            <button
              onClick={handleViewResume}
              disabled={!application.resume?.fileUrl}
              className="flex flex-col items-center gap-1.5 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed group/btn cursor-pointer"
              title="Xem CV"
            >
              <FileText className="h-5 w-5 text-primary group-hover/btn:scale-110 transition-transform" />
            </button>

            <button
              onClick={handleDownloadResume}
              disabled={!application.resume?.fileUrl || isDownloading}
              className="flex flex-col items-center gap-1.5 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed group/btn cursor-pointer"
              title="Tải CV"
            >
              <Download className="h-5 w-5 text-primary group-hover/btn:scale-110 transition-transform" />
            </button>

            <button
              onClick={() => setIsCoverLetterOpen(true)}
              className="flex flex-col items-center gap-1.5 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed group/btn cursor-pointer"
              title="Xem thư giới thiệu"
            >
              <Eye className="h-5 w-5 text-primary group-hover/btn:scale-110 transition-transform" />
            </button>
          </div>

          {application.interview?.scheduledAt && (
            <Button
              onClick={() => setIsInterviewDetailOpen(true)}
              className="flex flex-col items-center gap-1.5 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed group/btn cursor-pointer"
              title="Xem chi tiết phỏng vấn"
            >
              <Calendar className="h-5 w-5 text-primary group-hover/btn:scale-110 transition-transform" />
            </Button>
          )}
        </CardContent>
      </Card>

      <CoverLetterDialog
        open={isCoverLetterOpen}
        onOpenChange={setIsCoverLetterOpen}
        coverLetter={application.coverLetter}
        jobTitle={application.job?.title}
      />

      {application.interview && (
        <InterviewDetailDialog
          open={isInterviewDetailOpen}
          onOpenChange={setIsInterviewDetailOpen}
          interview={application.interview}
          jobTitle={application.job?.title}
        />
      )}
    </>
  );
}
