'use client';

import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useCreateReminderMutation, useUpdateReminderMutation } from '@/services/chatRoom/reminder/reminderApi';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { ReminderRepeatType } from '@/types/enum';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { IBackendError } from '@/types/api';
import { Reminder } from '@/types/model';

interface ReminderFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chatRoomId: number;
  reminder?: Reminder | null;
}

function toDatetimeLocal(value: string) {
  const date = new Date(value);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

function toLocalDatetimeString(date: Date) {
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

function getQuickPresetFromDateTime(value: string): '15' | '30' | 'tomorrow' | null {
  if (!value) return null;

  const current = toLocalDatetimeString(new Date());
  const fifteenMinutes = toLocalDatetimeString(new Date(Date.now() + 15 * 60000));
  const thirtyMinutes = toLocalDatetimeString(new Date(Date.now() + 30 * 60000));

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(9, 0, 0, 0);
  const tomorrowNine = toLocalDatetimeString(tomorrow);

  if (value === fifteenMinutes && value !== current) return '15';
  if (value === thirtyMinutes) return '30';
  if (value === tomorrowNine) return 'tomorrow';

  return null;
}

export default function ReminderForm({ open, onOpenChange, chatRoomId, reminder = null }: Readonly<ReminderFormProps>) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [repeatType, setRepeatType] = useState<ReminderRepeatType>(ReminderRepeatType.NONE);
  const [allowResponse, setAllowResponse] = useState(true);
  const [activeQuickPreset, setActiveQuickPreset] = useState<'15' | '30' | 'tomorrow' | null>(null);

  const [createReminder, { isLoading: isCreating }] = useCreateReminderMutation();
  const [updateReminder, { isLoading: isUpdating }] = useUpdateReminderMutation();

  const isEditMode = Boolean(reminder);
  const isLoading = isCreating || isUpdating;

  useEffect(() => {
    if (!open) return;

    if (reminder) {
      setTitle(reminder.title || '');
      setContent(reminder.content || '');
      setDateTime(toDatetimeLocal(reminder.nextTriggerTime || reminder.reminderTime));
      setRepeatType(reminder.repeatType);
      setAllowResponse(reminder.allowResponse);
      return;
    }

    setTitle('');
    setContent('');
    setDateTime('');
    setRepeatType(ReminderRepeatType.NONE);
    setAllowResponse(true);
  }, [open, reminder]);

  useEffect(() => {
    setActiveQuickPreset(getQuickPresetFromDateTime(dateTime));
  }, [dateTime]);

  const handleQuick = (minutes: number) => {
    const d = new Date(Date.now() + minutes * 60000);
    setDateTime(toLocalDatetimeString(d));
  };

  const handleTomorrowQuick = () => {
    const t = new Date();
    t.setDate(t.getDate() + 1);
    t.setHours(9, 0, 0, 0);
    setDateTime(toLocalDatetimeString(t));
  };

  const resetForm = () => {
    setTitle('');
    setContent('');
    setDateTime('');
    setRepeatType(ReminderRepeatType.NONE);
    setAllowResponse(true);
    setActiveQuickPreset(null);
  };

  const handleSubmit = async () => {
    if (!title || !dateTime) {
      toast.error('Vui lòng nhập tiêu đề và thời gian');
      return;
    }

    try {
      const iso = new Date(dateTime).toISOString();

      if (reminder) {
        await updateReminder({
          chatRoomId,
          reminderId: reminder.reminderId,
          title,
          content,
          reminderTime: iso,
          repeatType,
          allowResponse,
        }).unwrap();
        toast.success('Cập nhật nhắc hẹn thành công');
      } else {
        await createReminder({
          chatRoomId,
          title,
          content,
          reminderTime: iso,
          repeatType,
          allowResponse,
        }).unwrap();
        toast.success('Tạo nhắc hẹn thành công');
      }

      onOpenChange(false);
      resetForm();
    } catch (err) {
      const errorMessage =
        (err as IBackendError).data?.message || (reminder ? 'Lỗi khi cập nhật nhắc hẹn' : 'Lỗi khi tạo nhắc hẹn');
      toast.error(errorMessage);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      resetForm();
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl rounded-xl">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Chỉnh sửa nhắc hẹn' : 'Tạo nhắc hẹn'}</DialogTitle>
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
            <div className="my-2 flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleQuick(15)}
                className={`rounded-xl text-xs transition-colors ${activeQuickPreset === '15' ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'hover:bg-primary hover:text-primary-foreground'}`}
              >
                15 phút nữa
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleQuick(30)}
                className={`rounded-xl text-xs transition-colors ${activeQuickPreset === '30' ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'hover:bg-primary hover:text-primary-foreground'}`}
              >
                30 phút nữa
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleTomorrowQuick}
                className={`rounded-xl text-xs transition-colors ${activeQuickPreset === 'tomorrow' ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'hover:bg-primary hover:text-primary-foreground'}`}
              >
                9:00 ngày mai
              </Button>
            </div>
            <Input
              type="datetime-local"
              className="rounded-xl"
              value={dateTime}
              onChange={(e) => {
                setDateTime(e.target.value);
                setActiveQuickPreset(null);
              }}
            />
          </div>

          <div>
            <Label className="text-sm font-bold">Lặp lại</Label>
            <Select value={repeatType} onValueChange={(value) => setRepeatType(value as ReminderRepeatType)}>
              <SelectTrigger className="mt-2 w-full cursor-pointer rounded-xl">
                <SelectValue placeholder="Chọn tần suất lặp lại" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem
                  value={ReminderRepeatType.NONE}
                  className="rounded-xl cursor-pointer hover:bg-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                >
                  Không lặp lại
                </SelectItem>
                <SelectItem
                  value={ReminderRepeatType.DAILY}
                  className="rounded-xl cursor-pointer hover:bg-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                >
                  Hàng ngày
                </SelectItem>
                <SelectItem
                  value={ReminderRepeatType.WEEKLY}
                  className="rounded-xl cursor-pointer hover:bg-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                >
                  Hàng tuần
                </SelectItem>
                <SelectItem
                  value={ReminderRepeatType.MONTHLY}
                  className="rounded-xl cursor-pointer hover:bg-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                >
                  Hàng tháng
                </SelectItem>
                <SelectItem
                  value={ReminderRepeatType.YEARLY}
                  className="rounded-xl cursor-pointer hover:bg-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                >
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
            <Label htmlFor="allowResponse" className="cursor-pointer text-sm font-bold">
              Cho phép thành viên tham gia hoặc không tham gia
            </Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="destructive" className="rounded-xl" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Hủy
          </Button>
          <Button className="rounded-xl" onClick={handleSubmit} disabled={isLoading || !title || !dateTime}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditMode ? 'Lưu thay đổi' : 'Tạo nhắc hẹn'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
