import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { MessageCircle, UserPlus } from 'lucide-react';
import type { User } from '@/types/model';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Visibility } from '@/types/enum';

interface UserSearchResultItemProps {
  user: User;
  onMessage: (user: User) => void;
  onAddFriend?: (user: User) => void;
  isLoadingMessage?: boolean;
}

export function UserSearchResultItem({ user, onMessage, onAddFriend, isLoadingMessage }: UserSearchResultItemProps) {
  const isPrivateAccount = user.visibility === Visibility.PRIVATE;

  const messageButton = (
    <Button
      size="icon"
      variant="outline"
      onClick={() => onMessage(user)}
      disabled={isLoadingMessage || isPrivateAccount}
      className="rounded-full"
    >
      <MessageCircle className="h-4 w-4" />
    </Button>
  );

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-accent/50 transition-colors">
      <Avatar className="h-12 w-12 border">
        <AvatarImage src={user.avatar || '/placeholder.svg'} alt={user.fullName} />
        <AvatarFallback>{user.fullName?.charAt(0) || 'U'}</AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{user.fullName}</p>
        <p className="text-sm text-muted-foreground truncate">@{user.username}</p>
      </div>

      <div className="flex gap-2 shrink-0">
        {onAddFriend && (
          <Button size="icon" variant="outline" onClick={() => onAddFriend(user)} className="rounded-full">
            <UserPlus className="h-4 w-4" />
          </Button>
        )}
        {isPrivateAccount ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>{messageButton}</TooltipTrigger>
              <TooltipContent>
                <p>Tài khoản đang ở chế độ riêng tư nên không thể nhắn tin chủ động.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          messageButton
        )}
      </div>
    </div>
  );
}
