'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { useUser } from '@/hooks/useUser';
import { Button } from '@/components/ui/button';
import { ApplicantResponse, CompanyResponse, LoginResponseDto, RecruiterResponse, UserResponse } from '@/types/dto';

type UserData = UserResponse | ApplicantResponse | RecruiterResponse | CompanyResponse | LoginResponseDto;
type UserOthers = UserResponse | ApplicantResponse | RecruiterResponse;

const isCompanyUser = (user: UserData): boolean => {
  return 'logo' in user && 'name' in user && !('fullName' in user);
};

const getDisplayImage = (user: UserData): string => {
  return isCompanyUser(user) ? (user as CompanyResponse).logo : (user as UserOthers)?.avatar;
};

const getDisplayImageAlt = (user: UserData): string => {
  return isCompanyUser(user) ? (user as CompanyResponse).name : (user as UserOthers)?.fullName;
};

const getDisplayInitial = (user: UserData): string => {
  const name = isCompanyUser(user) ? (user as CompanyResponse).name : (user as UserOthers)?.fullName;
  return name?.[0] || '';
};

const getDisplayName = (user: UserData): string => {
  return isCompanyUser(user)
    ? (user as CompanyResponse).name
    : (user as UserOthers)?.fullName || (user as UserResponse)?.email;
};

const getDisplayUsername = (user: UserData): string | undefined => {
  return isCompanyUser(user) ? undefined : (user as UserResponse)?.username;
};

export function UserDisplay() {
  const { user, isSignedIn } = useUser();

  console.log('UserDisplay - user:', user);

  if (!isSignedIn || !user) {
    return (
      <Card>
        <CardContent className="flex flex-col gap-4">
          <Link href="/signin">
            <Button
              variant="outline"
              size="sm"
              className="hover:bg-muted rounded-xl border-primary text-primary w-full"
            >
              Đăng Nhập
            </Button>
          </Link>
          <Link href="/signup">
            <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl w-full">
              Đăng Ký
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  const username = getDisplayUsername(user);

  return (
    <Card>
      <CardContent className="">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12 border">
            <AvatarImage src={getDisplayImage(user)} alt={getDisplayImageAlt(user)} />
            <AvatarFallback>{getDisplayInitial(user)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <Link href="/profile" className="text-sm font-semibold text-foreground truncate">
              {getDisplayName(user)}
            </Link>
            {username && <p className="text-xs text-muted-foreground">@{username}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
