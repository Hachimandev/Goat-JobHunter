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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  useGetInviteLinkQuery,
  useRotateInviteLinkMutation,
  useToggleInviteLinkMutation,
} from '@/services/chatRoom/invite/inviteApi';
import { IBackendError } from '@/types/api';
import { QRCode } from 'antd';
import { truncate } from 'lodash';
import { Copy, Loader2, RefreshCw } from 'lucide-react';
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

  const handleCopyInviteLink = async () => {
    if (!invite?.inviteLink) return;
    try {
      await navigator.clipboard.writeText(invite.inviteLink);
      toast.success('Đã sao chép link mời');
    } catch {
      toast.error('Không thể sao chép link mời');
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
          <div className="flex items-center justify-between w-full">
            <div className="space-y-1">
              <h3 className="text-sm font-semibold">Link mời vào nhóm</h3>
              <p className="text-xs text-muted-foreground">Chia sẻ link hoặc quét QR để tham gia nhóm.</p>
            </div>
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
              <p className="text-sm text-primary break-all flex-1 cu" onClick={handleCopyInviteLink} title="Sao chép">
                {truncate(invite.inviteLink, { length: 40 })}
              </p>
              <Button
                size="icon-sm"
                variant="ghost"
                className="rounded-xl"
                onClick={handleCopyInviteLink}
                disabled={!invite.inviteLink}
                title="Sao chép"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>

            <div className="relative flex justify-center rounded-lg border border-dashed border-border py-4">
              <QRCode value={invite.inviteLink} size={170} />
              <div className="absolute right-2">
                <Badge variant={invite?.inviteEnabled ? 'default' : 'destructive'}>
                  {invite?.inviteEnabled ? 'Đang bật' : 'Đang tắt'}
                </Badge>
              </div>
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
