'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Resume } from '@/types/model';
import { useState } from 'react';
import { toast } from 'sonner';

interface EditResumeTitleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resume: Resume | null;
  onUpdate: (resumeId: number, title: string) => Promise<Resume | undefined>;
  isUpdating?: boolean;
}

export const EditResumeTitleDialog = ({
  open,
  onOpenChange,
  resume,
  onUpdate,
  isUpdating = false,
}: EditResumeTitleDialogProps) => {
  const [draftTitle, setDraftTitle] = useState<string | null>(null);
  const currentTitle = draftTitle ?? resume?.title ?? '';

  const handleSubmit = async () => {
    if (!resume) return;

    if (!currentTitle.trim()) {
      toast.error('Vui lòng nhập tiêu đề CV');
      return;
    }

    try {
      await onUpdate(resume.resumeId, currentTitle.trim());
      handleClose();
    } catch {
      toast.error('Không thể cập nhật tiêu đề CV. Vui lòng thử lại sau.');
    }
  };

  const handleClose = () => {
    setDraftTitle(null);
    onOpenChange(false);
  };

  const handleDialogOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setDraftTitle(null);
    }
    onOpenChange(nextOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Đổi tên CV</DialogTitle>
          <DialogDescription>Cập nhật tiêu đề cho CV của bạn để dễ dàng quản lý hơn</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="edit-title">Tiêu đề CV</Label>
            <Input
              id="edit-title"
              placeholder="VD: CV Kỹ thuật phần mềm"
              value={currentTitle}
              onChange={(e) => setDraftTitle(e.target.value)}
              disabled={isUpdating}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !isUpdating) {
                  handleSubmit();
                }
              }}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isUpdating} className="rounded-2xl">
            Hủy
          </Button>
          <Button onClick={handleSubmit} disabled={isUpdating || !currentTitle.trim()} className="rounded-2xl">
            {isUpdating ? 'Đang cập nhật...' : 'Cập nhật'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
