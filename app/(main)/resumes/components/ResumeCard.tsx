'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { Resume, ResumeEvaluation } from '@/types/model';
import { formatDate } from '@/utils/formatDate';
import { Download, ExternalLink, Eye, EyeOff, Gavel, MoreHorizontal, Pencil, Star, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { EvaluationResultDialog } from './EvaluationResultDialog';

interface ResumeCardProps {
  resume: Resume;
  onDelete: (resumeId: string) => void;
  onToggleDefault: (resumeId: string, isDefault: boolean) => void;
  onTogglePublic: (resumeId: string, isPublic: boolean) => void;
  onDownload: (resumeId: string, fileName: string) => void;
  onEditTitle: (resume: Resume) => void;
  onEvaluateResume: (resumeUrl: string) => Promise<ResumeEvaluation | undefined>;
  onViewEvaluations: (resumeId: string) => void;
  isProcessing?: boolean;
}

export const ResumeCard = ({
  resume,
  onDelete,
  onToggleDefault,
  onTogglePublic,
  onDownload,
  onEditTitle,
  onEvaluateResume,
  onViewEvaluations,
  isProcessing = false,
}: ResumeCardProps) => {
  const [imageError, setImageError] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<ResumeEvaluation | null>(null);
  const [showEvaluationDialog, setShowEvaluationDialog] = useState(false);

  const fileUrlLower = resume.fileUrl?.toLowerCase() || '';

  const isPDF = fileUrlLower.endsWith('.pdf') || fileUrlLower.includes('.pdf');

  const isImage = fileUrlLower.match(/\.(png|jpg|jpeg|gif|webp|bmp)($|\?)/);

  const isDocument = fileUrlLower.match(/\.(doc|docx)($|\?)/);

  const handleDelete = () => {
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    onDelete(resume.resumeId.toString());
    setShowDeleteDialog(false);
  };

  const handleToggleDefault = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleDefault(resume.resumeId.toString(), resume.default);
  };

  const handleEvaluate = async () => {
    const result = await onEvaluateResume(resume.fileUrl);
    if (result) {
      setEvaluationResult(result);
      setShowEvaluationDialog(true);
    }
  };

  return (
    <Card className="group relative overflow-hidden transition-all hover:shadow-lg py-0">
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-3 top-3 z-10 hover:bg-transparent"
        onClick={handleToggleDefault}
        disabled={isProcessing}
      >
        <Star
          className={`size-8 transition-colors ${
            resume.default ? 'fill-yellow-500 text-yellow-500' : 'fill-none text-gray-400'
          }`}
        />
      </Button>

      <div className="absolute bottom-0 left-0 right-0 z-10 flex items-center justify-center gap-2 bg-gradient-to-t from-black/60 to-transparent p-4 opacity-0 transition-opacity group-hover:opacity-100">
        <Button
          variant="secondary"
          size="sm"
          className="bg-white/90 backdrop-blur-sm hover:bg-white rounded-2xl"
          onClick={() => window.open(resume.fileUrl, '_blank')}
          disabled={isProcessing}
        >
          <ExternalLink className="size-4" />
          Xem
        </Button>

        <Button
          variant="secondary"
          size="sm"
          className="bg-white/90 backdrop-blur-sm hover:bg-white rounded-2xl"
          onClick={() => onDownload(resume.resumeId.toString(), resume.fileUrl.split('/').pop() || resume.title)}
          disabled={isProcessing}
        >
          <Download className="size-4" />
          Tải xuống
        </Button>

        <Button
          variant="secondary"
          size="sm"
          className="bg-white/90 backdrop-blur-sm hover:bg-white rounded-2xl"
          onClick={handleEvaluate}
          disabled={isProcessing}
        >
          <Gavel className="size-4" />
          Đánh giá
        </Button>

        <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="secondary"
              size="icon"
              className="size-9 bg-white/90 backdrop-blur-sm hover:bg-white rounded-2xl"
              disabled={isProcessing}
              onMouseEnter={() => setIsDropdownOpen(true)}
            >
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48" onMouseLeave={() => setIsDropdownOpen(false)}>
            <DropdownMenuItem onClick={() => onEditTitle(resume)} className="cursor-pointer">
              <Pencil className="mr-2 size-4" />
              Đổi tên CV
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onTogglePublic(resume.resumeId.toString(), resume.public)}
              className="cursor-pointer"
            >
              {resume.public ? (
                <>
                  <EyeOff className="mr-2 size-4" />
                  Ẩn CV
                </>
              ) : (
                <>
                  <Eye className="mr-2 size-4" />
                  Công khai CV
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onViewEvaluations(resume.resumeId.toString())} className="cursor-pointer">
              <Gavel className="mr-2 size-4" />
              Xem đánh giá
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleDelete} className="cursor-pointer text-destructive">
              <Trash2 className="mr-2 size-4" />
              Xóa CV
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="relative aspect-[3/4] w-full overflow-hidden bg-gray-100">
        {isPDF ? (
          <div className="relative w-full h-full overflow-hidden bg-white">
            <iframe
              src={`${resume.fileUrl}#view=FitH&zoom=200&toolbar=0&navpanes=0`}
              className="absolute -inset-2 w-[calc(100%+32px)] h-full"
              title={resume.title}
            />
          </div>
        ) : isDocument ? (
          <div className="flex size-full items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-2 size-16 rounded-lg bg-gray-200 p-3">
                <svg className="size-full text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
        ) : isImage && resume.fileUrl ? (
          !imageError ? (
            <Image
              src={resume.fileUrl}
              alt={resume.title}
              fill
              className="object-cover"
              onError={() => setImageError(true)}
            />
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

        <div className="mt-3 flex flex-wrap gap-2">
          {resume.public ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
              <Eye className="size-3" />
              Công khai
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700">
              <EyeOff className="size-3" />
              Ẩn
            </span>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={confirmDelete}
        title="Xóa CV"
        description="Bạn có chắc chắn muốn xóa CV này không? Hành động này không thể hoàn tác."
        confirmText="Xóa"
        cancelText="Hủy"
      />

      <EvaluationResultDialog
        open={showEvaluationDialog}
        onOpenChange={setShowEvaluationDialog}
        evaluation={evaluationResult}
      />
    </Card>
  );
};
