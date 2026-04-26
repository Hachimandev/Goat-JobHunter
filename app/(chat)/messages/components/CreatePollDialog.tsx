'use client';

import React, { useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Plus, Trash2 } from 'lucide-react';
import { DatePicker } from 'antd';
import { useCreatePollMutation } from '@/services/poll/pollApi';
import { toast } from 'sonner';
import { IBackendError } from '@/types/api';
import dayjs from 'dayjs';
import { Label } from '@/components/ui/label';

interface CreatePollDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chatRoomId?: number;
}

export default function CreatePollDialog({ open, onOpenChange, chatRoomId }: Readonly<CreatePollDialogProps>) {
  const [title, setTitle] = useState('');
  const [options, setOptions] = useState<string[]>(['', '']);
  const [deadline, setDeadline] = useState<dayjs.Dayjs | null>(null);
  const [pinToTop, setPinToTop] = useState(false);
  const [allowMultiple, setAllowMultiple] = useState(false);
  const [allowAddOption, setAllowAddOption] = useState(true);

  const titleChars = useMemo(() => title.length, [title]);

  const updateOption = (idx: number, value: string) => {
    setOptions((prev) => prev.map((o, i) => (i === idx ? value : o)));
  };

  const addOption = () => {
    if (options.length >= 10) return;
    setOptions((prev) => [...prev, '']);
  };

  const removeOption = (idx: number) => setOptions((prev) => prev.filter((_, i) => i !== idx));

  const canCreate = title.trim().length > 0 && options.filter((o) => o.trim().length > 0).length >= 2;
  const [createPoll, { isLoading: isCreating }] = useCreatePollMutation();

  const handleCreate = async () => {
    if (!canCreate) return;
    try {
      const payload = {
        chatRoomId: chatRoomId ?? 0,
        question: title.trim(),
        options: options.filter((o) => o.trim().length > 0).map((o) => o.trim()),
        multipleChoice: allowMultiple,
        allowAddOption: allowAddOption,
        pinned: pinToTop,
        expiresAt: deadline ? deadline.toISOString() : '',
      };

      await createPoll(payload).unwrap();
      toast.success('Tạo bình chọn thành công');

      setTitle('');
      setOptions(['', '']);
      setDeadline(null);
      setPinToTop(false);
      setAllowMultiple(false);
      setAllowAddOption(true);
      onOpenChange(false);
    } catch (error: unknown) {
      const err = error as IBackendError;
      const msg = err?.data?.message || 'Không thể tạo bình chọn';
      toast.error(msg);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl w-full rounded-xl p-0 gap-0 max-h-[90vh] overflow-hidden">
        <DialogHeader className="px-5 pt-5 pb-3 border-b">
          <div className="flex items-start justify-between w-full">
            <div>
              <DialogTitle>Tạo bình chọn</DialogTitle>
            </div>
          </div>
        </DialogHeader>

        <div className="flex gap-4 p-5">
          <div className="flex-1 space-y-4">
            <div>
              <Label className="text-sm font-bold">Chủ đề bình chọn</Label>
              <div className="relative mt-2">
                <Textarea
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Đặt câu hỏi bình chọn"
                  className="rounded-xl h-30 w-130"
                  maxLength={200}
                />
                <div className="absolute right-10 bottom-2 text-xs text-muted-foreground">{titleChars}/200</div>
              </div>
            </div>

            <div>
              <Label className="text-sm font-bold">Các lựa chọn</Label>
              <div className="mt-2">
                <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                  {options.map((opt, idx) => (
                    <div key={idx} className="flex items-center gap-2 relative">
                      <Input
                        value={opt}
                        onChange={(e) => updateOption(idx, e.target.value)}
                        placeholder={`Lựa chọn ${idx + 1}`}
                        className="rounded-xl w-130 focus:ring-0 focus-visible:ring-0"
                      />
                      {options.length > 2 && idx !== 0 && idx !== 1 && (
                        <div
                          onClick={() => removeOption(idx)}
                          aria-label={`Xoá lựa chọn ${idx + 1}`}
                          className="absolute right-8 cursor-pointer p-1 rounded hover:bg-destructive/50 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between mt-4 w-130">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addOption}
                    className="px-2! has-[>svg]:px-0 text-primary hover:text-primary border-primary rounded-xl"
                    disabled={options.length >= 10}
                  >
                    <Plus className="h-4 w-4" /> Thêm lựa chọn
                  </Button>
                  <div className="text-xs text-muted-foreground">{options.length}/10</div>
                </div>
              </div>
            </div>
          </div>

          <div className="w-72 shrink-0 space-y-4">
            <div className="h-40">
              <Label className="text-sm font-bold">Thời hạn bình chọn</Label>
              <div className="mt-2">
                <DatePicker
                  value={deadline}
                  onChange={(value) => setDeadline(value)}
                  placeholder="Không thời hạn"
                  showTime
                />
              </div>
            </div>

            <div>
              <div className="text-sm font-bold mb-2">Thiết lập nâng cao</div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm">Ghim lên đầu trò chuyện</div>
                  <Switch
                    checked={pinToTop}
                    onCheckedChange={(v) => setPinToTop(Boolean(v))}
                    className="cursor-pointer"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm">Cho phép nhiều phương án</div>
                  <Switch
                    checked={allowMultiple}
                    onCheckedChange={(v) => setAllowMultiple(Boolean(v))}
                    className="cursor-pointer"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm">Có thể thêm phương án</div>
                  <Switch
                    checked={allowAddOption}
                    onCheckedChange={(v) => setAllowAddOption(Boolean(v))}
                    className="cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="px-5 pb-5 pt-5 border-t">
          <div className="flex w-full items-center justify-between gap-4">
            <div />
            <div className="flex items-center gap-2">
              <Button variant="destructive" className="rounded-xl" onClick={() => onOpenChange(false)}>
                Hủy
              </Button>
              <Button onClick={handleCreate} className="rounded-xl" disabled={!canCreate || isCreating}>
                {isCreating ? 'Đang tạo...' : 'Tạo bình chọn'}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
