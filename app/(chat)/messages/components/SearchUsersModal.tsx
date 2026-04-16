import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Search, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { User } from '@/types/model';
import { UserSearchItem } from './UserSearchItem';
import { SelectedUsersList } from './SelectedUsersList';
import { GroupInfoModal } from './GroupInfoModal';
import { useSearchUsers } from '@/app/(chat)/messages/hooks/useSearchUsers';
import { useDirectMessageNavigation } from '@/hooks/useDirectMessageNavigation';
import { toast } from 'sonner';
import { Visibility } from '@/types/enum';

interface UserSearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode?: 'single' | 'multi' | 'add-to-group';
  onUserSelect?: (user: User) => void;
  existingMemberIds?: number[];
  isAddingMember?: boolean;
}

export function SearchUsersModal({
  open,
  onOpenChange,
  mode = 'single',
  onUserSelect,
  existingMemberIds = [],
  isAddingMember = false,
}: UserSearchModalProps) {
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [groupInfoModalOpen, setGroupInfoModalOpen] = useState(false);

  const { keyword, setKeyword, users, isLoading, isError, isEmpty, shouldShowResults } = useSearchUsers();

  const { navigateToDirectChat, isLoading: isCreatingChat } = useDirectMessageNavigation();

  const isAddToGroupMode = mode === 'add-to-group';

  // Filter out existing members when in add-to-group mode
  const filteredUsers = isAddToGroupMode ? users.filter((user) => !existingMemberIds.includes(user.accountId)) : users;

  const getDialogTitle = () => {
    if (isAddToGroupMode) return 'Thêm thành viên vào nhóm';
    if (mode === 'multi') return 'Chọn thành viên';
    return 'Tìm người dùng';
  };

  const getButtonText = () => {
    if (isAddToGroupMode) {
      return selectedUsers.length > 0 ? `Thêm (${selectedUsers.length})` : 'Chọn người để thêm';
    }
    return `Tiếp theo (${selectedUsers.length})`;
  };

  const handleSelectUser = async (user: User) => {
    // Add-to-group mode: multi-select, no immediate action
    if (isAddToGroupMode) {
      setSelectedUsers((prev) => {
        const isSelected = prev.some((u) => u.accountId === user.accountId);
        return isSelected ? prev.filter((u) => u.accountId !== user.accountId) : [...prev, user];
      });
      return;
    }

    // External handler (used by GroupDetailsPanel)
    if (onUserSelect) {
      onUserSelect(user);
      return;
    }

    // Default single mode behavior
    if (mode === 'single') {
      if (user.visibility === Visibility.PRIVATE) {
        toast.error('Tài khoản này đang ở chế độ riêng tư. Bạn không thể bắt đầu cuộc trò chuyện mới.');
        return;
      }

      const isNavigated = await navigateToDirectChat(user.accountId, { visibility: user.visibility });

      if (isNavigated) {
        onOpenChange(false);
      }
    } else {
      // Multi mode for group creation
      setSelectedUsers((prev) => {
        const isSelected = prev.some((u) => u.accountId === user.accountId);
        return isSelected ? prev.filter((u) => u.accountId !== user.accountId) : [...prev, user];
      });
    }
  };

  const handleRemoveUser = (userId: number) => {
    setSelectedUsers((prev) => prev.filter((u) => u.accountId !== userId));
  };

  const handleNext = async () => {
    if (isAddToGroupMode) {
      if (selectedUsers.length === 0) {
        toast.error('Vui lòng chọn ít nhất 1 người');
        return;
      }

      // Add all selected users using external handler
      if (onUserSelect) {
        for (const user of selectedUsers) {
          await onUserSelect(user);
        }
        onOpenChange(false);
        setSelectedUsers([]);
        setKeyword('');
      }
    } else {
      if (selectedUsers.length < 2) {
        toast.error('Vui lòng chọn ít nhất 2 người');
        return;
      }
      setGroupInfoModalOpen(true);
    }
  };

  const handleCloseGroupInfoModal = (open: boolean) => {
    setGroupInfoModalOpen(open);
    if (!open) {
      onOpenChange(false);
      setSelectedUsers([]);
      setKeyword('');
    }
  };

  const handleModalClose = (open: boolean) => {
    onOpenChange(open);
    if (!open) {
      setSelectedUsers([]);
      setKeyword('');
    }
  };

  const showMultiSelectUI = mode === 'multi' || isAddToGroupMode;

  return (
    <>
      <Dialog open={open} onOpenChange={handleModalClose}>
        <DialogContent className="sm:max-w-md rounded-xl">
          <DialogHeader>
            <DialogTitle>{getDialogTitle()}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm theo tên..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="pl-9 rounded-xl"
              />
            </div>

            {showMultiSelectUI && (
              <SelectedUsersList
                users={selectedUsers}
                onRemove={handleRemoveUser}
                emptyText={isAddToGroupMode ? 'Chưa chọn người dùng nào' : 'Chưa chọn thành viên nào'}
              />
            )}

            <ScrollArea className="h-[400px]">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : isError ? (
                <div className="text-center py-8 text-destructive">Có lỗi xảy ra khi tìm kiếm</div>
              ) : !shouldShowResults ? (
                <div className="text-center py-8 text-muted-foreground">Nhập ít nhất 2 ký tự để tìm kiếm</div>
              ) : isEmpty || (isAddToGroupMode && filteredUsers.length === 0) ? (
                <div className="text-center py-8 text-muted-foreground">
                  {isAddToGroupMode ? 'Không tìm thấy người dùng mới' : 'Không tìm thấy người dùng'}
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredUsers.map((user) => (
                    <UserSearchItem
                      key={user.accountId}
                      user={user}
                      mode={showMultiSelectUI ? 'multi' : 'single'}
                      isSelected={selectedUsers.some((u) => u.accountId === user.accountId)}
                      loading={isCreatingChat}
                      onAction={handleSelectUser}
                    />
                  ))}
                </div>
              )}
            </ScrollArea>

            {showMultiSelectUI && (
              <Button
                className="w-full rounded-xl"
                onClick={handleNext}
                disabled={
                  (isAddToGroupMode && selectedUsers.length === 0) ||
                  (!isAddToGroupMode && selectedUsers.length < 2) ||
                  isCreatingChat ||
                  (isAddToGroupMode && isAddingMember)
                }
              >
                {getButtonText()}
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {mode === 'multi' && (
        <GroupInfoModal
          open={groupInfoModalOpen}
          onOpenChange={handleCloseGroupInfoModal}
          selectedUsers={selectedUsers}
        />
      )}
    </>
  );
}
