import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { Crown, Shield, MoreVertical, UserMinus } from 'lucide-react';
import { useState } from 'react';
import {
  useUpdateMemberRoleMutation,
  useRemoveMemberFromGroupMutation,
  ChatMemberResponse,
} from '@/services/chatRoom/groupChat/groupChatApi';
import { toast } from 'sonner';
import { ChatRole } from '@/services/chatRoom/groupChat/groupChatType';

interface ChatMemberItemProps {
  member: ChatMemberResponse;
  chatroomId: string;
  currentUserRole: ChatRole;
  currentUserId: number;
  readOnly?: boolean;
}

export function ChatMemberItem({
  member,
  chatroomId,
  currentUserRole,
  currentUserId,
  readOnly = false,
}: ChatMemberItemProps) {
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [updateRole, { isLoading: isUpdatingRole }] = useUpdateMemberRoleMutation();
  const [removeMember, { isLoading: isRemoving }] = useRemoveMemberFromGroupMutation();

  const canManageRole = currentUserRole === ChatRole.OWNER && member.role !== ChatRole.OWNER;
  const canRemove =
    (currentUserRole === ChatRole.OWNER && member.role !== ChatRole.OWNER) ||
    (currentUserRole === ChatRole.MODERATOR && member.role === ChatRole.MEMBER);
  const isSelf = member.accountId === currentUserId;

  const getRoleBadge = () => {
    switch (member.role) {
      case ChatRole.OWNER:
        return (
          <Badge variant="default" className="gap-1">
            <Crown className="h-3 w-3" />
            Chủ nhóm
          </Badge>
        );
      case ChatRole.MODERATOR:
        return (
          <Badge variant="secondary" className="gap-1">
            <Shield className="h-3 w-3" />
            Quản trị viên
          </Badge>
        );
      default:
        return null;
    }
  };

  const handleRoleChange = async (newRole: ChatRole) => {
    try {
      await updateRole({
        chatroomId,
        chatMemberId: member.chatMemberId.toString(),
        role: newRole,
      }).unwrap();
      toast.success(`Đã cập nhật vai trò của ${member.fullName}`);
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error('Không thể cập nhật vai trò');
    }
  };

  const handleRemove = async () => {
    try {
      await removeMember({
        chatroomId,
        chatMemberId: member.chatMemberId.toString(),
      }).unwrap();
      toast.success(`Đã xóa ${member.fullName} khỏi nhóm`);
      setShowRemoveDialog(false);
    } catch (error) {
      console.error('Error removing member:', error);
      toast.error('Không thể xóa thành viên');
    }
  };

  return (
    <>
      <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-accent/50 transition-colors">
        <Avatar className="h-10 w-10 shrink-0">
          <AvatarImage src={member.avatar || '/placeholder.svg'} alt={member.fullName} />
          <AvatarFallback>{member.fullName.charAt(0)}</AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="font-medium text-sm truncate">{member.fullName}</p>
            {getRoleBadge()}
          </div>
          <p className="text-xs text-muted-foreground truncate">{member.email}</p>
        </div>

        {!isSelf && (canManageRole || canRemove) && !readOnly && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 rounded-full">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl">
              {canManageRole && member.role === ChatRole.MEMBER && (
                <DropdownMenuItem
                  className="rounded-xl"
                  onClick={() => handleRoleChange(ChatRole.MODERATOR)}
                  disabled={isUpdatingRole}
                >
                  <Shield className="h-4 w-4" />
                  Đặt làm quản trị viên
                </DropdownMenuItem>
              )}
              {canManageRole && member.role === ChatRole.MODERATOR && (
                <DropdownMenuItem
                  className="rounded-xl"
                  onClick={() => handleRoleChange(ChatRole.MEMBER)}
                  disabled={isUpdatingRole}
                >
                  <Shield className="h-4 w-4" />
                  Bỏ quản trị viên
                </DropdownMenuItem>
              )}
              {canRemove && (
                <DropdownMenuItem
                  onClick={() => setShowRemoveDialog(true)}
                  className="text-destructive focus:text-destructive rounded-xl"
                  disabled={isRemoving}
                >
                  <UserMinus className="h-4 w-4 text-destructive" />
                  Xóa khỏi nhóm
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <AlertDialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa thành viên?</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa <strong>{member.fullName}</strong> khỏi nhóm? Thao tác này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemove} disabled={isRemoving} className="rounded-xl">
              {isRemoving ? 'Đang xóa...' : 'Xóa'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
