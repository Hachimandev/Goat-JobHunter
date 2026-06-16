import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User } from "@/types/model";
import { useState } from "react";
import { Upload, Loader2 } from "lucide-react";
import { useCreateGroupChatMutation } from "@/services/chatRoom/groupChat/groupChatApi";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Image from "next/image";
import { useUploadSingleFileMutation } from "@/services/upload/uploadApi";

interface GroupInfoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedUsers: User[];
}

export function GroupInfoModal({ open, onOpenChange, selectedUsers }: GroupInfoModalProps) {
  const router = useRouter();
  const [groupName, setGroupName] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarError, setAvatarError] = useState<string>("");

  const [createGroupChat, { isLoading }] = useCreateGroupChatMutation();
  const [uploadFile] = useUploadSingleFileMutation();

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Kiểm tra loại file
      if (!file.type.startsWith("image/")) {
        setAvatarError("Chỉ chấp nhận file ảnh");
        return;
      }

      // Kiểm tra kích thước file (2MB = 2 * 1024 * 1024 bytes)
      if (file.size > 2 * 1024 * 1024) {
        setAvatarError("Kích thước ảnh tối đa 2MB");
        return;
      }

      setAvatarError("");
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

    try {
      if (selectedUsers.length < 2) {
        toast.error("Nhóm chat cần có ít nhất 2 thành viên");
        return;
      }

      if (!groupName.trim()) {
        toast.error("Vui lòng nhập tên nhóm");
        return;
      }

      if (!avatar) {
        toast.error("Vui lòng chọn ảnh đại diện cho nhóm");
        return;
      }

      // Upload avatar trước
      const toastId = toast.loading("Đang tải ảnh lên...");
      const uploadResult = await uploadFile({
        file: avatar,
        folderType: "/chatgroup/avatars"
      }).unwrap();

      if (!uploadResult.data?.url) {
        toast.dismiss(toastId);
        toast.error("Không thể tải ảnh lên. Vui lòng kiểm tra định dạng ảnh và thử lại.");
        return;
      }

      // Tạo group với avatar URL
      toast.loading("Đang tạo nhóm...", { id: toastId });
      const result = await createGroupChat({
        accountIds: selectedUsers.map((u) => u.accountId),
        name: groupName.trim(),
        avatar: uploadResult.data.url
      }).unwrap();

      toast.dismiss(toastId);

      if (result.data?.roomId) {
        toast.success("Tạo nhóm chat thành công");
        onOpenChange(false);
        router.push(`/messages/${result.data.roomId}`);
      }
    } catch (error) {
      toast.dismiss();
      toast.error("Không thể tạo nhóm chat");
      console.error(error);
    } finally {
      setGroupName("");
      setAvatar(null);
      setAvatarPreview("");
    }
  };

  const handleClose = () => {
    setGroupName("");
    setAvatar(null);
    setAvatarPreview("");
    setAvatarError("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md rounded-xl">
        <DialogHeader>
          <DialogTitle>Tạo nhóm chat</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <Avatar className="h-24 w-24 border-2">
                {avatarPreview ? (
                  <Image src={avatarPreview} alt="Group avatar" className="object-cover" height={96} width={96} />
                ) : (
                  <AvatarFallback className="text-2xl">
                    {groupName.charAt(0) || "G"}
                  </AvatarFallback>
                )}
              </Avatar>
              <label
                htmlFor="avatar-upload"
                className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-2 cursor-pointer hover:bg-primary/90"
              >
                <Upload className="h-4 w-4" />
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </label>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Chỉ chấp nhận file ảnh, tối đa 2MB
            </p>
            {avatarError && (
              <p className="text-xs text-destructive">{avatarError}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="group-name" className="font-bold" required>Tên nhóm</Label>
            <Input
              id="group-name"
              placeholder="Nhập tên nhóm..."
              className="rounded-xl"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              maxLength={100}
            />
            <p className={`text-xs ${groupName.length > 100 ? 'text-destructive' : 'text-muted-foreground'} text-right`}>
              {groupName.length}/100 ký tự
            </p>
          </div>

          <div className="space-y-2">
            <Label>Thành viên ({selectedUsers.length})</Label>
            <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto p-2 bg-accent/30 rounded-lg">
              {selectedUsers.map((user) => (
                <div key={user.accountId} className="flex items-center gap-1 text-sm rounded-xl">
                  <Avatar className="h-5 w-5">
                    <AvatarFallback className="text-xs">
                      {user.fullName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="truncate max-w-[100px]">{user.fullName}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1 rounded-xl"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Hủy
            </Button>
            <Button type="submit" className="flex-1 rounded-xl" disabled={isLoading || !groupName.trim()}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang tạo...
                </>
              ) : (
                "Tạo nhóm"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}