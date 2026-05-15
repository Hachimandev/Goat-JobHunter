"use client";

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useCreateReminderMutation } from '@/services/chatRoom/reminder/reminderApi';
import { toast } from 'sonner';

interface ReminderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chatRoomId: number;
}

export default function ReminderModal({ open, onOpenChange, chatRoomId }: ReminderModalProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [repeat, setRepeat] = useState('NONE');
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
      await createReminder({ chatRoomId, body: {
        title,
        content,
        reminderTime: iso,
        repeatType: repeat,
        participantIds: [],
        allowResponse,
      } }).unwrap();
      toast.success('Tạo nhắc hẹn thành công');
      onOpenChange(false);
      setTitle('');
      setContent('');
      setDateTime('');
      setRepeat('NONE');
    } catch (err) {
      toast.error('Lỗi khi tạo nhắc hẹn');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl rounded-xl">
        <DialogHeader>
          <DialogTitle>Tạo nhắc hẹn</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div>
            <label className="text-sm font-medium mb-1 block">Tiêu đề</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Nhập nội dung hoặc tiêu đề" />
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Nội dung</label>
            <Textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Nhập nội dung mới hoặc dán link" />
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Chọn thời gian</label>
            <div className="flex gap-2 mb-2">
              <Button size="sm" onClick={() => handleQuick(15)}>15 phút nữa</Button>
              <Button size="sm" onClick={() => handleQuick(30)}>30 phút nữa</Button>
              <Button size="sm" onClick={() => {
                const t = new Date(); t.setDate(t.getDate()+1); t.setHours(9,0,0,0);
                const local = new Date(t.getTime() - t.getTimezoneOffset() * 60000).toISOString().slice(0,16);
                setDateTime(local);
              }}>9:00 ngày mai</Button>
            </div>
            <Input type="datetime-local" value={dateTime} onChange={(e)=>setDateTime(e.target.value)} />
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Lặp lại</label>
            <select className="w-full rounded-md border px-3 py-2" value={repeat} onChange={(e)=>setRepeat(e.target.value)}>
              <option value="NONE">Không lặp lại</option>
              <option value="DAILY">Hàng ngày</option>
              <option value="WEEKLY">Hàng tuần</option>
              <option value="MONTHLY">Hàng tháng</option>
              <option value="YEARLY">Hàng năm</option>
            </select>
          </div>

          <div className="flex items-center gap-3">
            <input id="allowResponse" type="checkbox" checked={allowResponse} onChange={(e)=>setAllowResponse(e.target.checked)} />
            <label htmlFor="allowResponse" className="text-sm">Cho phép phản hồi</label>
          </div>
        </div>

        <DialogFooter>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={()=>onOpenChange(false)}>Hủy</Button>
            <Button onClick={handleSubmit} disabled={isLoading}>{isLoading ? 'Đang tạo...' : 'Tạo nhắc hẹn'}</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
