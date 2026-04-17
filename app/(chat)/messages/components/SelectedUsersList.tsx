import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { User } from '@/types/model';

interface SelectedUsersListProps {
  users: User[];
  onRemove: (userId: number) => void;
  emptyText?: string;
}

export function SelectedUsersList({ users, onRemove, emptyText = 'Chưa chọn thành viên nào' }: SelectedUsersListProps) {
  return (
    <div className="min-h-14 max-h-32 overflow-y-auto rounded-lg bg-accent/30 p-3">
      {users.length === 0 ? (
        <div className="flex min-h-8 items-center text-sm text-muted-foreground">{emptyText}</div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {users.map((user) => (
            <div
              key={user.accountId}
              className="flex items-center gap-2 rounded-full border bg-background py-1 pl-1 pr-3"
            >
              <Avatar className="h-6 w-6">
                <AvatarImage src={user.avatar || '/placeholder.svg'} />
                <AvatarFallback className="text-xs">{user.fullName.charAt(0)}</AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">{user.fullName}</span>
              <Button
                size="icon"
                variant="ghost"
                className="h-4 w-4 rounded-full p-0 hover:bg-destructive/20"
                onClick={() => onRemove(user.accountId)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
