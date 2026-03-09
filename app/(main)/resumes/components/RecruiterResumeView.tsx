'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Resume } from '@/types/model';
import { Download, ExternalLink, FileText } from 'lucide-react';
import { useState } from 'react';
import Image from 'next/image';
import { formatDate } from '@/utils/formatDate';

type RecruiterResumeViewProps = {
  resumes: Resume[];
  isLoading: boolean;
  onDownload: (resumeId: string, fileName: string) => void;
};

export const RecruiterResumeView = ({ resumes, isLoading, onDownload }: RecruiterResumeViewProps) => {
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());

  const checkTypeResume = (resume: Resume) => {
    const fileUrlLower = resume.fileUrl?.toLowerCase() || '';
    if (fileUrlLower.endsWith('.pdf') || fileUrlLower.includes('.pdf')) {
      return 'pdf';
    } else if (fileUrlLower.match(/\.(png|jpg|jpeg|gif|webp|bmp)($|\?)/)) {
      return 'image';
    } else if (fileUrlLower.match(/\.(doc|docx)($|\?)/)) {
      return 'document';
    } else {
      return 'other';
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="space-y-6">
              <Skeleton className="h-8 w-64" />
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-96 w-full" />
                ))}
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 max-w-7xl mx-auto gap-0 py-8 space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-muted-foreground mt-1">Tìm kiếm và xem hồ sơ ứng viên phù hợp</h1>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {resumes.length > 0 ? (
          <div className="grid grid-cols-2 gap-6 md:grid-cols-3">
            {resumes.map((resume) => (
              <Card
                key={resume.resumeId}
                className="group relative overflow-hidden transition-all hover:shadow-lg py-0"
              >
                <div className="absolute bottom-0 left-0 right-0 z-10 flex items-center justify-center gap-2 bg-gradient-to-t from-black/60 to-transparent p-4 opacity-0 transition-opacity group-hover:opacity-100">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="bg-white/90 backdrop-blur-sm hover:bg-white rounded-2xl"
                    onClick={() => window.open(resume.fileUrl, '_blank')}
                    disabled={isLoading}
                  >
                    <ExternalLink className="size-4" />
                    Xem
                  </Button>

                  <Button
                    variant="secondary"
                    size="sm"
                    className="bg-white/90 backdrop-blur-sm hover:bg-white rounded-2xl"
                    onClick={() =>
                      onDownload(resume.resumeId.toString(), resume.fileUrl.split('/').pop() || resume.title)
                    }
                    disabled={isLoading}
                  >
                    <Download className="size-4" />
                    Tải xuống
                  </Button>
                </div>

                <div className="relative aspect-[3/4] w-full overflow-hidden bg-gray-100">
                  {checkTypeResume(resume) === 'pdf' ? (
                    <div className="relative w-full h-full overflow-hidden bg-white">
                      <iframe
                        src={`${resume.fileUrl}#view=FitH&zoom=200&toolbar=0&navpanes=0&scrollbar=0`}
                        className="absolute -inset-2 w-[calc(100%+32px)] h-full pointer-events-none"
                        title={resume.title}
                        scrolling="no"
                      />
                    </div>
                  ) : checkTypeResume(resume) === 'document' ? (
                    <div className="flex size-full items-center justify-center">
                      <div className="text-center">
                        <div className="mx-auto mb-2 size-16 rounded-lg bg-gray-200 p-3">
                          <svg
                            className="size-full text-gray-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                        </div>
                        <p className="text-sm text-gray-500">{resume.fileName}</p>
                      </div>
                    </div>
                  ) : checkTypeResume(resume) === 'image' && resume.fileUrl ? (
                    !imageErrors.has(resume.resumeId) ? (
                      <Image
                        src={resume.fileUrl}
                        alt={resume.title}
                        fill
                        className="object-cover pointer-events-none"
                        onError={() => setImageErrors((prev) => new Set(prev).add(resume.resumeId))}
                      />
                    ) : (
                      <div className="flex size-full items-center justify-center">
                        <div className="text-center">
                          <div className="mx-auto mb-2 size-16 rounded-lg bg-red-100 p-3">
                            <svg
                              className="size-full text-red-500"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                          </div>
                          <p className="text-sm font-medium text-red-600">Lỗi tải ảnh</p>
                          <p className="text-xs text-gray-500 mt-1">{resume.fileName}</p>
                        </div>
                      </div>
                    )
                  ) : (
                    <div className="flex size-full items-center justify-center">
                      <div className="text-center">
                        <div className="mx-auto mb-2 size-16 rounded-lg bg-red-100 p-3">
                          <svg className="size-full text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        </div>
                        <p className="text-sm font-medium text-red-600">Định dạng không hỗ trợ</p>
                        <p className="text-xs text-gray-500 mt-1">{resume.fileName}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <h3 className="mb-1 line-clamp-2 font-semibold text-gray-900">{resume.title}</h3>
                  <p className="text-sm text-gray-500">
                    Cập nhật {formatDate(resume.updatedAt ? resume.updatedAt : resume.createdAt)}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
            <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-gray-100">
              <FileText className="size-8 text-gray-400" />
            </div>
            <h3 className="mb-2 text-lg font-medium text-gray-900">Chưa có CV nào</h3>
            <p className="mb-4 text-sm text-gray-500">Không tìm thấy CV nào phù hợp.</p>
          </div>
        )}
      </div>
    </div>
  );
};
