import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ChatRoom } from '@/types/model';
import { useState } from 'react';
import { Upload, Loader2 } from 'lucide-react';
import { useUpdateGroupInfoMutation } from '@/services/chatRoom/groupChat/groupChatApi';
import { toast } from 'sonner';
import Image from 'next/image';
import { useUploadSingleFileMutation } from '@/services/upload/uploadApi';
import { ChatRole } from '@/services/chatRoom/groupChat/groupChatType';

interface EditGroupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chatRoom: ChatRoom;
  currentUserRole?: ChatRole;
}

export function EditGroupModal({
  open,
  onOpenChange,
  chatRoom,
  currentUserRole = ChatRole.MEMBER,
}: EditGroupModalProps) {
  const [groupName, setGroupName] = useState(chatRoom.name);
  const [avatarPreview, setAvatarPreview] = useState<string>(chatRoom.avatar || '');
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarError, setAvatarError] = useState<string>('');
  const canEditGroupInfo =
    currentUserRole === ChatRole.OWNER || currentUserRole === ChatRole.MODERATOR || chatRoom.allowMemberUpdate;
  const disabledReason = 'Bạn không có quyền chỉnh sửa tên hoặc ảnh nhóm.';

  const [updateGroupInfo, { isLoading }] = useUpdateGroupInfoMutation();
  const [uploadFile] = useUploadSingleFileMutation();

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setAvatarError('Chỉ chấp nhận file ảnh');
        return;
      }

      // Kiểm tra kích thước file (2MB = 2 * 1024 * 1024 bytes)
      if (file.size > 2 * 1024 * 1024) {
        setAvatarError('Kích thước ảnh tối đa 2MB');
        return;
      }

      setAvatarError('');
      setAvatar(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!canEditGroupInfo) {
      toast.error(disabledReason);
      return;
    }

    try {
      if (!groupName.trim()) {
        toast.error('Vui lòng nhập tên nhóm');
        return;
      }

      const updateData: { name?: string; avatar?: string } = {};

      if (groupName.trim() !== chatRoom.name) {
        updateData.name = groupName.trim();
      }

      let toastId: string | number | undefined; // Lưu ID toast để cập nhật trạng thái

      // Nếu có avatar mới, upload trước
      if (avatar) {
        toastId = toast.loading('Đang tải ảnh lên...');
        const uploadResult = await uploadFile({
          file: avatar,
          folderType: '/chatgroup/avatars',
        }).unwrap();

        if (!uploadResult.data?.url) {
          toast.dismiss(toastId);
          toast.error('Không thể tải ảnh lên. Vui lòng kiểm tra định dạng ảnh và thử lại.');
          return;
        }

        updateData.avatar = uploadResult.data.url;
      }

      if (Object.keys(updateData).length === 0) {
        toast.info('Không có thay đổi nào');
        onOpenChange(false);
        return;
      }

      // Cập nhật thông tin group

      if (!toastId) {
        toastId = toast.loading('Đang cập nhật thông tin nhóm...');
      } else {
        toast.loading('Đang cập nhật thông tin nhóm...', { id: toastId });
      }

      await updateGroupInfo({
        chatroomId: chatRoom.roomId.toString(),
        ...updateData,
      }).unwrap();

      toast.dismiss(toastId);
      toast.success('Cập nhật thông tin nhóm thành công');
      onOpenChange(false);
    } catch (error) {
      toast.dismiss();
      toast.error('Không thể cập nhật thông tin nhóm');
      console.error(error);
    }
  };

  const handleClose = () => {
    setGroupName(chatRoom.name);
    setAvatar(null);
    setAvatarPreview(chatRoom.avatar || '');
    setAvatarError('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md rounded-xl">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa thông tin nhóm</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <Avatar className="h-24 w-24 border-2">
                {avatarPreview ? (
                  <Image src={avatarPreview} alt="Group avatar" className="object-cover" height={96} width={96} />
                ) : (
                  <AvatarFallback className="text-2xl">{groupName.charAt(0) || 'G'}</AvatarFallback>
                )}
              </Avatar>
              <Label
                htmlFor="avatar-upload"
                className={`absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-2 ${
                  canEditGroupInfo ? 'cursor-pointer hover:bg-primary/90' : 'cursor-not-allowed opacity-60'
                }`}
              >
                <Upload className="h-4 w-4" />
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                  disabled={!canEditGroupInfo}
                />
              </Label>
            </div>
            <p className="text-xs text-muted-foreground text-center">Chỉ chấp nhận file ảnh, tối đa 2MB</p>
            {avatarError && <p className="text-xs text-destructive">{avatarError}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="group-name" className="font-bold" required>
              Tên nhóm
            </Label>
            <Input
              id="group-name"
              placeholder="Nhập tên nhóm..."
              value={groupName}
              className={'rounded-xl'}
              onChange={(e) => setGroupName(e.target.value)}
              maxLength={100}
              disabled={!canEditGroupInfo}
            />
            <p
              className={`text-xs ${groupName.length > 100 ? 'text-destructive' : 'text-muted-foreground'} text-right`}
            >
              {groupName.length}/100 ký tự
            </p>
            {!canEditGroupInfo && <p className="text-xs text-muted-foreground">{disabledReason}</p>}
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1 rounded-xl"
              onClick={handleClose}
              disabled={isLoading}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              className="flex-1 rounded-xl"
              disabled={isLoading || !groupName.trim() || !canEditGroupInfo}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                'Lưu thay đổi'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
