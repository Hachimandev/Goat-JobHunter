import { Button } from '@/components/ui/button';
import { Trash2, X, Loader2 } from 'lucide-react';
import { ChatRoom } from '@/types/model';
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useDissolveGroupChatMutation } from '@/services/chatRoom/groupChat/groupChatApi';
import { toast } from 'sonner';
import { IBackendError } from '@/types/api';
import { useRouter } from 'next/navigation';

interface ManageGroupPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chatRoom: ChatRoom;
}

export function ManageGroupPanel({ open, onOpenChange, chatRoom }: Readonly<ManageGroupPanelProps>) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const router = useRouter();

  const [dissolveGroup, { isLoading: isDissolving }] = useDissolveGroupChatMutation();

  const handleOpenConfirm = () => {
    setConfirmText('');
    setConfirmOpen(true);
  };

  const handleDissolve = async () => {
    try {
      await dissolveGroup({ chatRoomId: chatRoom.roomId, groupNameConfirmation: confirmText }).unwrap();
      router.push('/messages');
      toast.success('Đã giải tán nhóm');
      setConfirmOpen(false);
      onOpenChange(false);
    } catch (error) {
      toast.error((error as IBackendError).data?.message || 'Có lỗi xảy ra khi giải tán nhóm');
    }
  };

  const canConfirm = confirmText === chatRoom.name;

  return (
    <div
      className={`absolute inset-0 border-l border-border bg-card flex flex-col h-full min-h-0 transform transition-transform duration-300 z-10 ${
        open ? 'translate-x-0' : 'translate-x-full'
      }`}
      aria-hidden={!open}
    >
      <div className="h-16 border-b border-border flex items-center justify-between px-4 flex-none">
        <h2 className="font-semibold text-sm">Quản lý nhóm</h2>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onOpenChange(false)}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      <div className="p-2 mt-2">
        <Button
          variant="ghost"
          className="w-full text-white bg-destructive hover:bg-destructive/50 hover:text-white rounded-xl text-center justify-center font-bold"
          onClick={handleOpenConfirm}
          disabled={isDissolving}
        >
          {isDissolving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-5 w-5 mr-2" />}
          Giải tán nhóm
        </Button>
      </div>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent className="rounded-xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Giải tán nhóm?</AlertDialogTitle>
            <AlertDialogDescription>
              Vui lòng nhập chính xác tên nhóm <strong>{chatRoom.name}</strong> để xác nhận. Hành động này không thể
              hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="mt-2">
            <Input
              placeholder="Nhập tên nhóm để xác nhận"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className="rounded-xl"
            />
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDissolve}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl text-white"
              disabled={!canConfirm || isDissolving}
            >
              {isDissolving ? 'Đang xử lý...' : 'Giải tán nhóm'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default ManageGroupPanel;
