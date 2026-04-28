'use client';

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
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  useGetInviteLinkQuery,
  useRotateInviteLinkMutation,
  useToggleInviteLinkMutation,
} from '@/services/chatRoom/invite/inviteApi';
import { IBackendError } from '@/types/api';
import { QRCode } from 'antd';
import { Loader2, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

type InviteLinkPanelProps = {
  roomId: number;
  canManageInvite: boolean;
};

export default function InviteLinkPanel({ roomId, canManageInvite }: Readonly<InviteLinkPanelProps>) {
  const [toggleConfirmOpen, setToggleConfirmOpen] = useState(false);
  const [pendingEnabled, setPendingEnabled] = useState<boolean | null>(null);

  const { data, isLoading, isError } = useGetInviteLinkQuery(roomId, { skip: !roomId });
  const [rotateInvite, { isLoading: isRotating }] = useRotateInviteLinkMutation();
  const [toggleInvite, { isLoading: isToggling }] = useToggleInviteLinkMutation();

  const invite = data?.data;

  const handleRotate = async () => {
    try {
      await rotateInvite(roomId).unwrap();
      toast.success('Đã làm mới link mời');
    } catch (error) {
      toast.error((error as IBackendError).data?.message || 'Không thể làm mới link mời');
    }
  };

  const requestToggle = (enabled: boolean) => {
    if (!canManageInvite || isToggling) return;
    setPendingEnabled(enabled);
    setToggleConfirmOpen(true);
  };

  const handleConfirmToggle = async () => {
    if (pendingEnabled === null) return;

    try {
      await toggleInvite({ roomId, enabled: pendingEnabled }).unwrap();
      toast.success(pendingEnabled ? 'Đã bật link mời' : 'Đã tắt link mời');
    } catch (error) {
      toast.error((error as IBackendError).data?.message || 'Không thể cập nhật trạng thái link mời');
    } finally {
      setToggleConfirmOpen(false);
      setPendingEnabled(null);
    }
  };

  return (
    <>
      <div className="space-y-4 rounded-xl border border-border p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <h3 className="text-sm font-semibold">Link mời vào nhóm</h3>
            <p className="text-xs text-muted-foreground">Chia sẻ link hoặc quét QR để tham gia nhóm.</p>
          </div>
          {canManageInvite && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="rounded-xl"
              onClick={handleRotate}
              disabled={isLoading || isRotating || isToggling || !invite}
            >
              {isRotating ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Làm mới
            </Button>
          )}
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-5">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        )}

        {isError && (
          <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-xs text-destructive">
            Không thể tải link mời. Vui lòng thử lại sau.
          </div>
        )}

        {!isLoading && !isError && invite && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <p className="text-xs text-muted-foreground break-all">{invite.inviteLink}</p>
              <span
                className={`shrink-0 rounded-full px-2 py-1 text-[11px] font-medium ${
                  invite.inviteEnabled ? 'bg-emerald-100 text-emerald-700' : 'bg-muted text-muted-foreground'
                }`}
              >
                {invite.inviteEnabled ? 'Đang bật' : 'Đang tắt'}
              </span>
            </div>

            <div className="flex justify-center rounded-lg border border-dashed border-border py-4">
              <QRCode value={invite.inviteLink} size={170} />
            </div>

            {canManageInvite && (
              <div className="flex items-center justify-between rounded-lg bg-accent/30 px-3 py-2">
                <p className="text-sm">Bật link mời</p>
                <Switch
                  checked={invite.inviteEnabled}
                  onCheckedChange={requestToggle}
                  disabled={isToggling || isRotating}
                  className="cursor-pointer"
                />
              </div>
            )}
          </div>
        )}
      </div>

      <AlertDialog
        open={toggleConfirmOpen}
        onOpenChange={(open) => {
          setToggleConfirmOpen(open);
          if (!open) setPendingEnabled(null);
        }}
      >
        <AlertDialogContent className="rounded-xl">
          <AlertDialogHeader>
            <AlertDialogTitle>{pendingEnabled ? 'Bật link mời?' : 'Tắt link mời?'}</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingEnabled
                ? 'Người khác có thể dùng link/QR hiện tại để tham gia nhóm.'
                : 'Người khác sẽ không thể dùng link/QR hiện tại để tham gia nhóm cho đến khi bạn bật lại.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl" disabled={isToggling}>
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmToggle}
              disabled={isToggling || pendingEnabled === null}
              className="rounded-xl"
            >
              {isToggling ? 'Đang cập nhật...' : 'Xác nhận'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
