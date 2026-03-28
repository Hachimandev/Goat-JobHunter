'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Home, User2, Tag, Bookmark, FileUser, UserRoundCog } from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useUser } from '@/hooks/useUser';
import { isCompanyResponse, isRecruiterResponse } from '@/utils/slug';
import { MeResponse } from '@/types/dto';

const NAV_ITEMS = [
  { href: '/hub/fyp', label: 'Trang chủ', icon: Home },
  { href: '/hub/profile', label: 'Trang cá nhân', icon: User2 },
  { href: '/profile?tab=info', label: 'Thông tin cá nhân', icon: UserRoundCog },
  { href: '/hub/tags', label: 'Khám phá Tags', icon: Tag },
  { href: '/hub/profile/saved', label: 'Đã lưu', icon: Bookmark },
  { href: '/hub/profile/cvs', label: 'Cv của bạn', icon: FileUser },
] as const;

export function NavigationBar() {
  const pathname = usePathname();
  const { user } = useUser();

  const isActive = (href: string) => pathname == href;

  const filteredNavItems = NAV_ITEMS.filter((item) => {
    const requiresLogin = ['/hub/profile', '/profile?tab=info', '/hub/profile/saved', '/hub/profile/cvs'];

    if (!user && requiresLogin.includes(item.href)) {
      return false;
    }

    if (
      item.href === '/hub/profile/cvs' &&
      user &&
      (isCompanyResponse(user as MeResponse) || isRecruiterResponse(user as MeResponse))
    ) {
      return false;
    }

    return true;
  });

  return (
    <Card>
      <CardContent className="space-y-1">
        {filteredNavItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant="ghost"
                className={cn(
                  'w-full justify-start relative rounded-xl transition-colors',
                  active
                    ? 'text-primary hover:text-primary hover:bg-primary/10'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary',
                )}
              >
                <Icon className="h-5 w-5 mr-2" />
                <span>{item.label}</span>
              </Button>
            </Link>
          );
        })}
      </CardContent>
    </Card>
  );
}
