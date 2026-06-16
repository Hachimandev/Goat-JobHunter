'use client';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FileText } from 'lucide-react';

interface CoverLetterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  coverLetter: string;
  jobTitle?: string;
}

export default function CoverLetterDialog({
  open,
  onOpenChange,
  coverLetter,
  jobTitle,
}: Readonly<CoverLetterDialogProps>) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl rounded-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <DialogTitle>Thư giới thiệu</DialogTitle>
          </div>
          {jobTitle && (
            <DialogDescription>
              Vị trí ứng tuyển: <span className="font-medium text-foreground">{jobTitle}</span>
            </DialogDescription>
          )}
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto">
          <div className="rounded-lg bg-muted/50 p-6">
            <p className="whitespace-pre-wrap text-sm leading-relaxed">{coverLetter}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
