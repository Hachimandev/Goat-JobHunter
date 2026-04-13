import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Check, MessageCirclePlus } from 'lucide-react';
import { User } from '@/types/model';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Visibility } from '@/types/enum';
import { useFriendshipStatus } from '@/hooks/useFriendshipStatus';
import FriendActionButtons from '@/components/common/FriendActionButtons';

interface UserSearchItemProps {
  user: User;
  mode: 'single' | 'multi';
  isSelected?: boolean;
  loading?: boolean;
  onAction: (user: User) => void;
}

export function UserSearchItem({ user, mode, isSelected, loading = false, onAction }: UserSearchItemProps) {
  const isPrivateAccount = user.visibility === Visibility.PRIVATE;
  const { isBlockedAnyDirection } = useFriendshipStatus(user.accountId);

  const isMessageDisabled = loading || isPrivateAccount || isBlockedAnyDirection;

  const disableReason = isPrivateAccount
    ? 'Tài khoản đang ở chế độ riêng tư.'
    : isBlockedAnyDirection
      ? 'Không thể nhắn tin khi đang ở trạng thái chặn.'
      : null;

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
            <>
              <Button
                size="icon-sm"
                onClick={() => onAction(user)}
                disabled={loading || isPrivateAccount}
                className="rounded-xl"
                title={isMessageDisabled ? disableReason || undefined : 'Nhắn tin'}
              >
                <MessageCirclePlus className="h-4 w-4" />
              </Button>
              <FriendActionButtons targetUserId={user.accountId} compact hideWhenFriendOrBlocked iconOnly />
            </>
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
      {disableReason && (
        <TooltipContent side="bottom">
          <p>{disableReason}</p>
        </TooltipContent>
      )}
    </Tooltip>
  );
}
