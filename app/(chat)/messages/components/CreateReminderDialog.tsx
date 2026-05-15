'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useCreateReminderMutation } from '@/services/chatRoom/reminder/reminderApi';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { ReminderRepeatType } from '@/types/enum';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { IBackendError } from '@/types/api';

interface CreateReminderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chatRoomId: number;
}

export default function CreateReminderDialog({ open, onOpenChange, chatRoomId }: Readonly<CreateReminderDialogProps>) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [repeatType, setRepeatType] = useState<ReminderRepeatType>(ReminderRepeatType.NONE);
  const [allowResponse, setAllowResponse] = useState(true);

  const [createReminder, { isLoading }] = useCreateReminderMutation();

  const handleQuick = (minutes: number) => {
    const d = new Date(Date.now() + minutes * 60000);
    const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    setDateTime(local);
  };

  const handleSubmit = async () => {
    if (!title || !dateTime) {
      toast.error('Vui lòng nhập tiêu đề và thời gian');
      return;
    }

    try {
      const iso = new Date(dateTime).toISOString();
      await createReminder({
        chatRoomId,
        title,
        content,
        reminderTime: iso,
        repeatType,
        allowResponse,
      }).unwrap();
      toast.success('Tạo nhắc hẹn thành công');
      onOpenChange(false);
      setTitle('');
      setContent('');
      setDateTime('');
      setRepeatType(ReminderRepeatType.NONE);
      setAllowResponse(true);
    } catch (err) {
      const errorMessage = (err as IBackendError).data?.message || 'Lỗi khi tạo nhắc hẹn';
      toast.error(errorMessage);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setTitle('');
      setContent('');
      setDateTime('');
      setRepeatType(ReminderRepeatType.NONE);
      setAllowResponse(true);
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl rounded-xl">
        <DialogHeader>
          <DialogTitle>Tạo nhắc hẹn</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div>
            <Label className="text-sm font-bold">Tiêu đề</Label>
            <Input
              className="mt-2 rounded-xl"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nhập tiêu đề nhắc hẹn"
            />
          </div>

          <div>
            <Label className="text-sm font-bold">Nội dung</Label>
            <Textarea
              className="mt-2 rounded-xl h-30 w-full"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Nhập nội dung chi tiết (tùy chọn)"
            />
          </div>

          <div>
            <Label className="text-sm font-bold">Chọn thời gian</Label>
            <div className="flex gap-2 my-2">
              <Button size="sm" variant="outline" onClick={() => handleQuick(15)} className="text-xs rounded-xl">
                15 phút nữa
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleQuick(30)} className="text-xs rounded-xl">
                30 phút nữa
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  const t = new Date();
                  t.setDate(t.getDate() + 1);
                  t.setHours(9, 0, 0, 0);
                  const local = new Date(t.getTime() - t.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
                  setDateTime(local);
                }}
                className="text-xs rounded-xl"
              >
                9:00 ngày mai
              </Button>
            </div>
            <Input
              type="datetime-local"
              className="rounded-xl"
              value={dateTime}
              onChange={(e) => setDateTime(e.target.value)}
            />
          </div>

          <div>
            <Label className="text-sm font-bold">Lặp lại</Label>
            <Select value={repeatType} onValueChange={(value) => setRepeatType(value as ReminderRepeatType)}>
              <SelectTrigger className="mt-2 w-full rounded-xl cursor-pointer">
                <SelectValue placeholder="Chọn tần suất lặp lại" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value={ReminderRepeatType.NONE} className="hover:bg-primary cursor-pointer">
                  Không lăp lại
                </SelectItem>
                <SelectItem value={ReminderRepeatType.DAILY} className="hover:bg-primary cursor-pointer">
                  Hàng ngày
                </SelectItem>
                <SelectItem value={ReminderRepeatType.WEEKLY} className="hover:bg-primary cursor-pointer">
                  Hàng tuần
                </SelectItem>
                <SelectItem value={ReminderRepeatType.MONTHLY} className="hover:bg-primary cursor-pointer">
                  Hàng tháng
                </SelectItem>
                <SelectItem value={ReminderRepeatType.YEARLY} className="hover:bg-primary cursor-pointer">
                  Hàng năm
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="allowResponse"
              checked={allowResponse}
              onCheckedChange={(checked) => setAllowResponse(!!checked)}
            />
            <Label htmlFor="allowResponse" className="text-sm font-bold cursor-pointer">
              Cho phép thành viên tham gia hoặc không tham gia
            </Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="destructive" className="rounded-xl" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Hủy
          </Button>
          <Button className="rounded-xl" onClick={handleSubmit} disabled={isLoading || !title || !dateTime}>
            {isLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Tạo nhắc hẹn
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
