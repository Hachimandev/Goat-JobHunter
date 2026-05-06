import { Button } from '@/components/ui/button';
import { Trash2, X, Loader2 } from 'lucide-react';
import { ChatRoom } from '@/types/model';
import React, { useMemo, useState } from 'react';
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
import {
  useDissolveGroupChatMutation,
  useUpdateGroupInfoMutation,
  useUpdateGroupPermissionsMutation,
} from '@/services/chatRoom/groupChat/groupChatApi';
import { toast } from 'sonner';
import { IBackendError } from '@/types/api';
import { useRouter } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChatRoomPrivacy } from '@/types/enum';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ChatRole } from '@/services/chatRoom/groupChat/groupChatType';

interface ManageGroupPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chatRoom: ChatRoom;
  currentUserRole?: ChatRole;
}

type GroupPermissionField =
  | 'allowMemberUpdate'
  | 'allowMemberPin'
  | 'allowMemberCreateVote'
  | 'allowMemberSendMessage'
  | 'allowModeratorSendMessage';

const PERMISSION_LABELS: Array<{
  key: GroupPermissionField;
  label: string;
  roles: ChatRole[];
}> = [
  { key: 'allowMemberUpdate', label: 'Thành viên đổi tên và ảnh nhóm', roles: [ChatRole.OWNER, ChatRole.MODERATOR] },
  {
    key: 'allowMemberPin',
    label: 'Thành viên ghim tin nhắn, ghi chú, bình chọn',
    roles: [ChatRole.OWNER, ChatRole.MODERATOR],
  },
  { key: 'allowMemberCreateVote', label: 'Thành viên tạo bình chọn', roles: [ChatRole.OWNER, ChatRole.MODERATOR] },
  { key: 'allowMemberSendMessage', label: 'Thành viên gửi tin nhắn', roles: [ChatRole.OWNER, ChatRole.MODERATOR] },
  { key: 'allowModeratorSendMessage', label: 'Quản trị viên gửi tin nhắn', roles: [ChatRole.OWNER] },
];

export function ManageGroupPanel({
  open,
  onOpenChange,
  chatRoom,
  currentUserRole = ChatRole.MEMBER,
}: Readonly<ManageGroupPanelProps>) {
  const currentPrivacy = chatRoom.privacy ?? ChatRoomPrivacy.PUBLIC;
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [privacy, setPrivacy] = useState<ChatRoomPrivacy>(currentPrivacy);
  const [permissions, setPermissions] = useState<Record<GroupPermissionField, boolean>>({
    allowMemberUpdate: chatRoom.allowMemberUpdate ?? true,
    allowMemberPin: chatRoom.allowMemberPin ?? true,
    allowMemberCreateVote: chatRoom.allowMemberCreateVote ?? true,
    allowMemberSendMessage: chatRoom.allowMemberSendMessage ?? true,
    allowModeratorSendMessage: chatRoom.allowModeratorSendMessage ?? true,
  });
  const router = useRouter();

  const [dissolveGroup, { isLoading: isDissolving }] = useDissolveGroupChatMutation();
  const [updateGroupInfo, { isLoading }] = useUpdateGroupInfoMutation();
  const [updateGroupPermissions, { isLoading: isUpdatingPermissions }] = useUpdateGroupPermissionsMutation();

  const editablePermissions = useMemo(() => {
    return PERMISSION_LABELS.filter((item) => item.roles.includes(currentUserRole));
  }, [currentUserRole]);

  const canManagePermissions = editablePermissions.length > 0;

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

  const handlePrivacyChange = async (newPrivacy: ChatRoomPrivacy) => {
    if (newPrivacy === privacy) return;

    try {
      await updateGroupInfo({ chatroomId: chatRoom.roomId.toString(), privacy: newPrivacy }).unwrap();
      setPrivacy(newPrivacy);
      toast.success('Cập nhật quyền riêng tư thành công');
    } catch (error) {
      toast.error((error as IBackendError).data?.message || 'Có lỗi xảy ra khi cập nhật quyền riêng tư');
    }
  };

  const handlePermissionToggle = async (field: GroupPermissionField, checked: boolean) => {
    if (!editablePermissions.some((p) => p.key === field)) {
      return;
    }

    const previousState = permissions;
    const nextState = {
      ...permissions,
      [field]: checked,
    };

    setPermissions(nextState);

    try {
      await updateGroupPermissions({
        chatRoomId: chatRoom.roomId,
        ...nextState,
      }).unwrap();
      toast.success('Cập nhật quyền nhóm thành công');
    } catch (error) {
      setPermissions(previousState);
      toast.error((error as IBackendError).data?.message || 'Có lỗi xảy ra khi cập nhật quyền nhóm');
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
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => onOpenChange(false)}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      <div className="p-2 mt-2 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="group-privacy" className="font-bold">
            Quyền riêng tư nhóm
          </Label>
          <Select
            value={privacy}
            onValueChange={(value) => handlePrivacyChange(value as ChatRoomPrivacy)}
            disabled={isLoading}
          >
            <SelectTrigger
              className="rounded-xl w-full border border-input bg-background px-3 py-2 text-sm"
              disabled={isLoading}
              id="group-privacy"
            >
              <SelectValue placeholder="Quyền riêng tư" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ChatRoomPrivacy.PUBLIC}>Công khai</SelectItem>
              <SelectItem value={ChatRoomPrivacy.PRIVATE}>Riêng tư</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {canManagePermissions && (
          <>
            <div className="space-y-3">
              <Label className="font-bold">Quyền thành viên</Label>
              <div className="space-y-2">
                {editablePermissions.map((permission) => (
                  <div key={permission.key} className="flex items-center justify-between gap-3">
                    <p className="text-sm">{permission.label}</p>
                    <Switch
                      checked={permissions[permission.key]}
                      onCheckedChange={(checked) => void handlePermissionToggle(permission.key, checked)}
                      disabled={isUpdatingPermissions}
                    />
                  </div>
                ))}
              </div>
            </div>

            <Separator />
          </>
        )}

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
