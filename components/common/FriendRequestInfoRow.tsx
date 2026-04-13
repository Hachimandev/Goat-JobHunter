import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { UserRound } from 'lucide-react';
import Link from 'next/link';
import { ReactNode } from 'react';

type FriendRequestInfoRowProps = {
  targetId: number;
  displayName: string;
  avatar: string;
  subtitle: string;
  actions?: ReactNode;
  className?: string;
  linkClassName?: string;
  avatarClassName?: string;
};

export default function FriendRequestInfoRow({
  targetId,
  displayName,
  avatar,
  subtitle,
  actions,
  className,
  linkClassName,
  avatarClassName,
}: Readonly<FriendRequestInfoRowProps>) {
  return (
    <div className={cn('flex items-center justify-between gap-3 rounded-xl border p-3', className)}>
      <Link href={`/hub/users/${targetId}`} className={cn('min-w-0 flex items-center gap-3', linkClassName)}>
        <Avatar className={cn('h-12 w-12 border', avatarClassName)}>
          <AvatarImage src={avatar} alt={displayName} />
          <AvatarFallback>
            <UserRound className="h-5 w-5" />
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0">
          <p className="truncate font-medium">{displayName}</p>
          <p className="truncate text-sm text-muted-foreground">{subtitle}</p>
        </div>
      </Link>

      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </div>
  );
}
