'use client';

import CustomPagination from '@/components/common/CustomPagination';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { ResumeEvaluation } from '@/types/model';
import { formatDate } from '@/utils/formatDate';
import { getScoreBgColor, getScoreColor, getScoreLabel } from '@/utils/getEvaluationScoreStyles';
import { Award, Brain, Calendar, FileText } from 'lucide-react';
import { useEffect, useState } from 'react';
import { EvaluationResultDialog } from './EvaluationResultDialog';

interface ViewEvaluationsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resumeId: string | null;
  evaluations: ResumeEvaluation[];
  isFetchingEvaluations: boolean;
  currentPage: number;
  totalPages: number;
  totalEvaluations: number;
  onPageChange: (page: number) => void;
  onNextPage: () => void;
  onPreviousPage: () => void;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  onFetchEvaluations: (resumeId: string) => void;
}

export const ViewEvaluationsDialog = ({
  open,
  onOpenChange,
  resumeId,
  evaluations,
  isFetchingEvaluations,
  currentPage,
  totalPages,
  totalEvaluations,
  onPageChange,
  onNextPage,
  onPreviousPage,
  hasNextPage,
  hasPreviousPage,
  onFetchEvaluations,
}: ViewEvaluationsDialogProps) => {
  const [selectedEvaluation, setSelectedEvaluation] = useState<ResumeEvaluation | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);

  useEffect(() => {
    if (open && resumeId) {
      onFetchEvaluations(resumeId);
    }
  }, [open, resumeId, onFetchEvaluations]);

  const handleViewDetail = (evaluation: ResumeEvaluation) => {
    setSelectedEvaluation(evaluation);
    setShowDetailDialog(true);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl! sm:max-w-4xl! max-h-[90vh] overflow-y-auto pr-2">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <FileText className="size-6 text-blue-600" />
              Lịch sử đánh giá CV
            </DialogTitle>
            <DialogDescription>
              Tổng số {totalEvaluations} đánh giá • Trang {currentPage} / {totalPages}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {isFetchingEvaluations ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-32 w-full" />
                ))}
              </div>
            ) : evaluations.length > 0 ? (
              <>
                <div className="space-y-3">
                  {evaluations.map((evaluation) => (
                    <div
                      key={evaluation.resumeEvaluationId}
                      className={`border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer ${getScoreBgColor(
                        evaluation.score,
                      )}`}
                      onClick={() => handleViewDetail(evaluation)}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center gap-4">
                            <div className={`flex items-center gap-2 ${getScoreColor(evaluation.score)}`}>
                              <Award className="size-8" />
                              <div>
                                <div className="text-3xl font-bold">
                                  {evaluation.score}
                                  <span className="text-lg">/100</span>
                                </div>
                                <div className="text-sm font-semibold">{getScoreLabel(evaluation.score)}</div>
                              </div>
                            </div>
                            <div className="border-l border-gray-300 pl-4 space-y-1">
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Brain className="size-4" />
                                <span>AI Model: {evaluation.aiModel}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Calendar className="size-4" />
                                <span>Đánh giá lúc: {formatDate(evaluation.createdAt)}</span>
                              </div>
                            </div>
                          </div>

                          {evaluation.skills && (
                            <div className="text-sm">
                              <span className="font-semibold text-gray-700">Kỹ năng: </span>
                              <span className="text-gray-600 line-clamp-2">{evaluation.skills}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="mt-6">
                    <CustomPagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={onPageChange}
                      onNextPage={onNextPage}
                      onPreviousPage={onPreviousPage}
                      hasNextPage={hasNextPage}
                      hasPreviousPage={hasPreviousPage}
                      visiblePageRange={2}
                    />
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-gray-100">
                  <FileText className="size-8 text-gray-400" />
                </div>
                <h3 className="mb-2 text-lg font-medium text-gray-900">Chưa có đánh giá nào</h3>
                <p className="text-sm text-gray-500">CV này chưa được đánh giá. Hãy đánh giá ngay!</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <EvaluationResultDialog
        open={showDetailDialog}
        onOpenChange={setShowDetailDialog}
        evaluation={selectedEvaluation}
      />
    </>
  );
};
