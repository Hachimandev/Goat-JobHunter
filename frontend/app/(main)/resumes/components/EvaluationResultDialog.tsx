'use client';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ResumeEvaluation } from '@/types/model';
import { getScoreColor, getScoreBgColor, getScoreLabel } from '@/utils/getEvaluationScoreStyles';
import { CheckCircle, XCircle, Lightbulb, Award, Brain, TrendingUp } from 'lucide-react';

interface EvaluationResultDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  evaluation: ResumeEvaluation | null;
}

export const EvaluationResultDialog = ({ open, onOpenChange, evaluation }: EvaluationResultDialogProps) => {
  if (!evaluation) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-5xl sm:!max-w-5xl max-h-[90vh] overflow-y-auto pr-2">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Brain className="size-6 text-blue-600" />
            Kết quả đánh giá CV
          </DialogTitle>
          <DialogDescription>Đánh giá bởi AI Model: {evaluation.aiModel}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          <div className={`flex items-center justify-between p-6 rounded-lg ${getScoreBgColor(evaluation.score)}`}>
            <div className="flex items-center gap-4">
              <Award className={`size-12 ${getScoreColor(evaluation.score)}`} />
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-1">Điểm tổng thể</h3>
                <div className={`text-5xl font-bold ${getScoreColor(evaluation.score)}`}>
                  {evaluation.score}
                  <span className="text-2xl">/100</span>
                </div>
              </div>
            </div>
            <div className={`text-3xl font-bold ${getScoreColor(evaluation.score)}`}>
              {getScoreLabel(evaluation.score)}
            </div>
          </div>

          {evaluation.skills && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="size-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">Kỹ năng được phát hiện</h3>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-gray-700 whitespace-pre-wrap">{evaluation.skills}</p>
              </div>
            </div>
          )}

          {evaluation.strengths && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="size-5 text-green-600" />
                <h3 className="text-lg font-semibold text-gray-900">Điểm mạnh</h3>
              </div>
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <p className="text-gray-700 whitespace-pre-wrap">{evaluation.strengths}</p>
              </div>
            </div>
          )}

          {evaluation.weaknesses && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <XCircle className="size-5 text-red-600" />
                <h3 className="text-lg font-semibold text-gray-900">Điểm yếu</h3>
              </div>
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <p className="text-gray-700 whitespace-pre-wrap">{evaluation.weaknesses}</p>
              </div>
            </div>
          )}

          {evaluation.missingSkills && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <XCircle className="size-5 text-orange-600" />
                <h3 className="text-lg font-semibold text-gray-900">Kỹ năng còn thiếu</h3>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                <p className="text-gray-700 whitespace-pre-wrap">{evaluation.missingSkills}</p>
              </div>
            </div>
          )}

          {evaluation.suggestions && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Lightbulb className="size-5 text-purple-600" />
                <h3 className="text-lg font-semibold text-gray-900">Gợi ý cải thiện</h3>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <p className="text-gray-700 whitespace-pre-wrap">{evaluation.suggestions}</p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
