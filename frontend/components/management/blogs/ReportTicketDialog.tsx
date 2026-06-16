import React, { useState } from 'react';
import { ReportReason } from '@/types/enum';
import useTicketActions from '@/hooks/useTicketActions';
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const reasonLabels: Record<ReportReason, string> = {
  [ReportReason.SPAM]: 'Spam',
  [ReportReason.HARASSMENT]: 'Quấy rối',
  [ReportReason.HATE_SPEECH]: 'Lời nói bậy',
  [ReportReason.VIOLENCE]: 'Bạo lực',
  [ReportReason.FALSE_INFO]: 'Tin giả',
  [ReportReason.OTHER]: 'Lý do khác',
};

const ReportTicketDialog = ({ isOpen, onClose }: Props) => {
  const [reason, setReason] = useState<ReportReason | ''>('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const { handleCreateBlogTicket, handleCreateCommentTicket, isLoading } = useTicketActions();

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(e.target.value);
    setError('');
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason) return setError('Vui lòng chọn một lý do báo cáo.');

    if (reason === ReportReason.OTHER && !description.trim()) {
      return setError('Vui lòng nhập mô tả chi tiết cho lý do khác.');
    }

    const selectedId = localStorage.getItem('selectedReportItem');
    const selectedType = localStorage.getItem('selectedReportType');

    if (!selectedId || Number.isNaN(Number(selectedId))) {
      return setError('Không tìm thấy ID bài viết hợp lệ');
    }

    const payload = {
      targetId: Number.parseInt(selectedId, 10),
      reason: reason,
      description: description.trim(),
      //   description: reason === ReportReason.OTHER ? description : `Báo cáo: ${reason}`,
      //   ...(selectedType === 'blog' ? { blogId: Number(selectedId) } : { commentId: Number(selectedId) }),
    };

    try {
      let success;
      if (selectedType === 'blog') {
        success = (await handleCreateBlogTicket(payload)) ?? false;
      } else {
        success = (await handleCreateCommentTicket(payload)) ?? false;
      }

      if (success) {
        setReason('');
        setDescription('');
        onClose();
      }
    } catch (err) {
      console.error('Lỗi Server:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/20 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg w-[450px]">
        <h3 className="text-lg font-bold mb-4">Báo cáo vi phạm</h3>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="space-y-3">
            <p className="text-sm font-medium text-muted-foreground mb-2">Chọn lý do:</p>
            {Object.entries(reasonLabels).map(([key, value]) => (
              <label
                key={key}
                className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                  reason === key ? 'border-primary bg-primary/5' : 'border-border hover:bg-accent'
                }`}
              >
                <input
                  type="radio"
                  name="reportReason"
                  value={key}
                  checked={reason === key}
                  onChange={() => {
                    setReason(key as ReportReason);
                    setError('');
                  }}
                  className="w-4 h-4 text-primary"
                />
                <span className="ml-3 text-sm font-medium">{value}</span>
              </label>
            ))}
          </div>
          <div
            className={`transition-all duration-300 ${reason === ReportReason.OTHER && 'opacity-100'}`}
          >
            <Label className="block text-sm font-medium mb-2">
              Mô tả chi tiết <span className="text-red-500">*</span>
            </Label>
            <Textarea
              className="w-full border border-border bg-background p-3 rounded-lg h-24 focus:ring-2 focus:ring-primary outline-none text-sm"
              placeholder={
                reason === ReportReason.OTHER ? 'Vui lòng mô tả rõ vi phạm...' : 'Thông tin bổ sung (không bắt buộc)'
              }
              value={description}
              onChange={handleDescriptionChange}
            />
          </div>
          {error && <p className="text-red-500 text-xs font-medium italic">{error}</p>}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-5 py-2 text-sm font-medium hover:bg-accent rounded-md transition-colors"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className={`px-5 py-2 text-sm font-medium bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors shadow-sm ${
                isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              {isLoading ? 'Đang gửi...' : 'Gửi báo cáo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportTicketDialog;
