'use client';

import React, { useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Poll } from '@/types/model';
import { toast } from 'sonner';
import { useVotePollMutation } from '@/services/poll/vote/voteApi';
import { IBackendError } from '@/types/api';

interface PollVoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  poll: Poll;
}

export default function PollVoteDialog({ open, onOpenChange, poll }: Readonly<PollVoteDialogProps>) {
  const totalVotes = useMemo(() => poll.options.reduce((s, o) => s + (o.voteCount || 0), 0), [poll]);

  const [selectedSingle, setSelectedSingle] = useState<string | undefined>(undefined);
  const [selectedMulti, setSelectedMulti] = useState<Record<string, boolean>>({});
  const [addingOption, setAddingOption] = useState('');

  // initialize selected state when dialog opens
  React.useEffect(() => {
    if (!open) return;
    // reset selection
    setSelectedSingle(undefined);
    setSelectedMulti(() => {
      const map: Record<string, boolean> = {};
      for (const o of poll.options) map[o.optionId] = false;
      return map;
    });
    setAddingOption('');
  }, [open, poll.options]);

  const handleToggleMulti = (optId: string, checked: boolean) => {
    setSelectedMulti((prev) => ({ ...prev, [optId]: checked }));
  };

  const handleAddOption = () => {
    if (!addingOption.trim()) return;
    // local-only: push into poll.options is not safe (poll is readonly). We'll just toast for now.
    toast.success('Yêu cầu thêm phương án đã được ghi nhận (chưa gửi server)');
    setAddingOption('');
  };

  const [votePoll, { isLoading: isVoting }] = useVotePollMutation();

  const handleConfirm = async () => {
    const selected = poll.multipleChoice
      ? Object.entries(selectedMulti)
          .filter(([, v]) => v)
          .map(([k]) => k)
      : selectedSingle
        ? [selectedSingle]
        : [];

    try {
      await votePoll({ chatRoomId: Number(poll.chatRoomId), pollId: poll.pollId, optionIds: selected }).unwrap();
      toast.success('Bình chọn thành công');
      onOpenChange(false);
    } catch (err: unknown) {
      const e = err as IBackendError;
      const msg = e?.data?.message || 'Không thể gửi bình chọn';
      toast.error(msg);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md w-full rounded-xl p-0 gap-0 max-h-[80vh] overflow-auto">
        <DialogHeader className="px-5 pt-5 pb-2 border-b">
          <DialogTitle>Bình chọn</DialogTitle>
        </DialogHeader>

        <div className="p-5 space-y-4">
          <div className="text-sm font-semibold">{poll.question}</div>
          <div className="text-xs text-muted-foreground">Tổng: {totalVotes} lượt</div>

          <div className="space-y-3">
            {poll.multipleChoice ? (
              // multiple: show checkboxes
              <div className="space-y-2">
                {poll.options.map((opt) => (
                  <label
                    key={opt.optionId}
                    className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/80 cursor-pointer"
                  >
                    <Checkbox
                      checked={Boolean(selectedMulti[opt.optionId])}
                      onCheckedChange={(v) => handleToggleMulti(opt.optionId, Boolean(v))}
                    />

                    <div className="flex-1">
                      <div className="text-sm font-medium">{opt.text}</div>
                      <div className="text-xs text-muted-foreground">{opt.voteCount} lượt</div>
                    </div>
                  </label>
                ))}
              </div>
            ) : (
              // single: radio group
              <RadioGroup value={selectedSingle} onValueChange={(v) => setSelectedSingle(v)}>
                {poll.options.map((opt) => (
                  <div
                    key={opt.optionId}
                    className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/80 cursor-pointer"
                  >
                    <RadioGroupItem value={opt.optionId} />
                    <div className="flex-1">
                      <div className="text-sm font-medium">{opt.text}</div>
                      <div className="text-xs text-muted-foreground">{opt.voteCount} lượt</div>
                    </div>
                  </div>
                ))}
              </RadioGroup>
            )}
          </div>

          {poll.allowAddOption && (
            <div className="pt-2">
              <div className="text-sm text-primary cursor-pointer" onClick={() => {}}>
                + Thêm lựa chọn
              </div>
              <div className="mt-2 flex gap-2">
                <Input
                  placeholder="Thêm lựa chọn"
                  value={addingOption}
                  onChange={(e) => setAddingOption(e.target.value)}
                />
                <Button onClick={handleAddOption} disabled={!addingOption.trim()}>
                  Thêm
                </Button>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="px-5 pb-5 pt-2 border-t">
          <div className="flex w-full items-center justify-end gap-2">
            <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={isVoting}>
              Hủy
            </Button>
            <Button onClick={handleConfirm} disabled={isVoting}>
              {isVoting ? 'Đang gửi...' : 'Xác nhận'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
