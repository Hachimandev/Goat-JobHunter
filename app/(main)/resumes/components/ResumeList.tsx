'use client';

import { Button } from '@/components/ui/button';
import { Resume, ResumeEvaluation } from '@/types/model';
import { FileText, Plus } from 'lucide-react';
import { ResumeCard } from './ResumeCard';

interface ResumeListProps {
  resumes: Resume[];
  title: string;
  emptyMessage: string;
  onUploadClick: () => void;
  onDelete: (resumeId: string) => void;
  onToggleDefault: (resumeId: string, isDefault: boolean) => void;
  onTogglePublic: (resumeId: string, isPublic: boolean) => void;
  onDownload: (resumeId: string, fileName: string) => void;
  onEditTitle: (resume: Resume) => void;
  onEvaluateResume: (resumeUrl: string) => Promise<ResumeEvaluation | undefined>;
  onViewEvaluations: (resumeId: string) => void;
  isProcessing?: boolean;
  uploadButtonText?: string;
}

export const ResumeList = ({
  resumes,
  title,
  emptyMessage,
  onUploadClick,
  onDelete,
  onToggleDefault,
  onTogglePublic,
  onDownload,
  onEditTitle,
  onEvaluateResume,
  onViewEvaluations,
  isProcessing = false,
  uploadButtonText,
}: ResumeListProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">{title}</h2>
        <Button onClick={onUploadClick} disabled={isProcessing} className="font-bold rounded-2xl">
          <Plus className="size-5" />
          {uploadButtonText}
        </Button>
      </div>

      {resumes.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {resumes.map((resume) => (
            <ResumeCard
              key={resume.resumeId}
              resume={resume}
              onDelete={onDelete}
              onToggleDefault={onToggleDefault}
              onTogglePublic={onTogglePublic}
              onDownload={onDownload}
              onEditTitle={onEditTitle}
              onEvaluateResume={onEvaluateResume}
              onViewEvaluations={onViewEvaluations}
              isProcessing={isProcessing}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-gray-100">
            <FileText className="size-8 text-gray-400" />
          </div>
          <h3 className="mb-2 text-lg font-medium text-gray-900">Chưa có CV nào</h3>
          <p className="mb-4 text-sm text-gray-500">{emptyMessage}</p>
          <Button onClick={onUploadClick} disabled={isProcessing} className="font-bold rounded-2xl">
            <Plus className="size-5" />
            {uploadButtonText}
          </Button>
        </div>
      )}
    </div>
  );
};
