import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { User } from '@/types/model';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Visibility } from '@/types/enum';

interface UserSearchItemProps {
  user: User;
  mode: 'single' | 'multi';
  isSelected?: boolean;
  loading?: boolean;
  onAction: (user: User) => void;
}

export function UserSearchItem({ user, mode, isSelected, loading = false, onAction }: UserSearchItemProps) {
  const isPrivateAccount = user.visibility === Visibility.PRIVATE;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex items-center gap-3 p-3 hover:bg-accent cursor-pointer transition-colors rounded-xl">
          <Avatar className="h-10 w-10 border">
            <AvatarImage src={user.avatar || '/placeholder.svg'} alt={user.fullName} />
            <AvatarFallback>{user.fullName.charAt(0)}</AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{user.fullName}</p>
            <p className="text-sm text-muted-foreground truncate">{user.email}</p>
          </div>

          {!isPrivateAccount && mode === 'single' && (
            <Button
              size="sm"
              onClick={() => onAction(user)}
              disabled={loading || isPrivateAccount}
              className="rounded-xl"
            >
              Nhắn tin
            </Button>
          )}

          {!isPrivateAccount && mode === 'multi' && (
            <Button
              size="sm"
              variant={isSelected ? 'default' : 'outline'}
              onClick={() => onAction(user)}
              disabled={loading}
              className="rounded-xl"
            >
              {isSelected ? (
                <>
                  <Check className="h-4 w-4 mr-1" />
                  Đã chọn
                </>
              ) : (
                <>Chọn</>
              )}
            </Button>
          )}
        </div>
      </TooltipTrigger>
      {isPrivateAccount && (
        <TooltipContent side="bottom">
          <p>Tài khoản đang ở chế độ riêng tư.</p>
        </TooltipContent>
      )}
    </Tooltip>
  );
}
