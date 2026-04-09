import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUser } from '@/hooks/useUser';
import { useDirectMessageNavigation } from '@/hooks/useDirectMessageNavigation';
import { Visibility } from '@/types/enum';

interface UserHoverCardProps {
  userId: number;
  fullName: string;
  avatar?: string;
  username?: string;
  bio?: string;
  visibility?: Visibility | string | null;
  children: React.ReactNode;
}

export function UserHoverCard({
  userId,
  fullName,
  avatar,
  username,
  bio,
  visibility,
  children,
}: Readonly<UserHoverCardProps>) {
  const router = useRouter();
  const { isSignedIn, user } = useUser();
  const { navigateToDirectChat, isLoading } = useDirectMessageNavigation();
  const isSelf = user?.accountId === userId;
  const isPrivateAccount = visibility === Visibility.PRIVATE;
  const showMessageButton = !isSelf && !isPrivateAccount;
  const showPrivateMessage = !isSelf && isPrivateAccount;

  const handleMessageClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    if (isSelf) return;

    if (isPrivateAccount) return;

    if (!isSignedIn) {
      router.push('/signin');
      return;
    }

    await navigateToDirectChat(userId, { visibility });
  };

  // render nothing: isSelf
  // render send message button: is not self and not private
  // render private account message: is not self and is private

  return (
    <HoverCard openDelay={300}>
      <HoverCardTrigger asChild>{children}</HoverCardTrigger>
      <HoverCardContent className="w-80 rounded-xl" align="start">
        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-3">
            <Avatar className="h-14 w-14">
              <AvatarImage src={avatar || '/placeholder.svg'} alt={fullName} />
              <AvatarFallback>{fullName[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <Link href={`/hub/users/${userId}`} className="text-base font-semibold hover:underline">
                {fullName}
              </Link>
              {username && <p className="text-sm text-muted-foreground">@{username}</p>}
            </div>
          </div>

          {bio && <p className="text-sm text-muted-foreground line-clamp-3">{bio}</p>}

          <div className="flex">
            {showMessageButton && (
              <Button className="w-full rounded-xl" size="sm" onClick={handleMessageClick} disabled={isLoading}>
                <MessageCircle className="h-4 w-4 mr-2" />
                {isLoading ? 'Đang mở chat...' : 'Nhắn tin'}
              </Button>
            )}

            {showPrivateMessage && <p>Tài khoản đang ở chế độ riêng tư.</p>}
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
