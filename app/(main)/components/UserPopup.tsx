'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useUser } from '@/hooks/useUser';
import { Briefcase, FileText, LogOut, Shield, User } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { HasAdmin, HasApplicant, HasCompany } from '@/components/common/HasRole';
import {
  getDisplayImage,
  getDisplayImageAlt,
  getDisplayName,
  getDisplayUsername,
} from '@/app/(social-hub)/hub/hooks/useDisplay';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { isCompanyResponse } from '@/utils/slug';
import { ApplicantResponse, CompanyResponse, MeResponse, RecruiterResponse } from '@/types/dto';

interface UserPopupProps {
  align?: 'start' | 'end' | 'center';
}

export default function UserPopup({ align = 'end' }: UserPopupProps) {
  const { user, signOut, isSigningOut, isSignedIn } = useUser();
  const [imageError, setImageError] = useState(false);

  const handleLogout = async () => {
    await signOut();
  };

  const hasAvatar = getDisplayImage(user!) && !imageError;

  const displayName =
    user && isCompanyResponse(user as MeResponse)
      ? (user as CompanyResponse).name
      : (user as ApplicantResponse | RecruiterResponse)?.fullName || 'User';
  const displayImage =
    user && isCompanyResponse(user as MeResponse)
      ? (user as CompanyResponse).logo
      : (user as ApplicantResponse | RecruiterResponse)?.avatar;

  if (!user || !isSignedIn) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0">
          {hasAvatar ? (
            <Avatar className="h-10 w-10 border">
              <AvatarImage src={displayImage || '/placeholder.svg'} alt={displayName} />
              <AvatarFallback>{displayName.charAt(0)}</AvatarFallback>
            </Avatar>
          ) : (
            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
              <User className="h-5 w-5 text-muted-foreground" />
            </div>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64 rounded-xl" align={align} forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex items-center gap-3 py-2">
            {hasAvatar ? (
              <div className="h-12 w-12 rounded-full overflow-hidden bg-muted shrink-0 flex items-center justify-center">
                <Image
                  src={getDisplayImage(user!)}
                  alt={getDisplayImageAlt(user!)}
                  width={48}
                  height={48}
                  className="h-full w-full object-cover"
                  onError={() => setImageError(true)}
                />
              </div>
            ) : (
              <div className="h-12 w-12 rounded-full bg-muted shrink-0 flex items-center justify-center">
                <User className="h-6 w-6 text-muted-foreground" />
              </div>
            )}

            <div className="flex flex-col space-y-1 min-w-0">
              <p className="text-sm font-semibold leading-none truncate">{getDisplayName(user!)}</p>
              <p className="text-xs leading-none text-muted-foreground truncate">{getDisplayUsername(user!)}</p>
            </div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link href="/my-jobs" className="flex items-center cursor-pointer rounded-xl">
            <Briefcase className="mr-2 h-4 w-4" />
            <span>Việc làm của tôi</span>
          </Link>
        </DropdownMenuItem>

        <HasApplicant user={user}>
          <DropdownMenuItem asChild>
            <Link href="/resumes" className="flex items-center cursor-pointer rounded-xl">
              <FileText className="mr-2 h-4 w-4" />
              <span>CV của tôi</span>
            </Link>
          </DropdownMenuItem>
        </HasApplicant>

        <DropdownMenuItem asChild>
          <Link href="/profile" className="flex items-center cursor-pointer rounded-xl">
            <User className="mr-2 h-4 w-4" />
            <span>Hồ sơ cá nhân</span>
          </Link>
        </DropdownMenuItem>

        <HasAdmin user={user}>
          <DropdownMenuItem asChild>
            <Link href="/dashboard" className="flex items-center cursor-pointer rounded-xl">
              <Shield className="mr-2 h-4 w-4" />
              <span>Bảng điều khiển</span>
            </Link>
          </DropdownMenuItem>
        </HasAdmin>

        <HasCompany user={user}>
          <DropdownMenuItem asChild>
            <Link href="/recruiter-portal" className="flex items-center cursor-pointer rounded-xl">
              <Shield className="mr-2 h-4 w-4" />
              <span>Bảng điều khiển</span>
            </Link>
          </DropdownMenuItem>
        </HasCompany>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          className="text-destructive focus:text-destructive cursor-pointer rounded-xl"
          onClick={handleLogout}
          disabled={isSigningOut}
        >
          <LogOut className="mr-2 h-4 w-4 text-destructive" />
          <span>{isSigningOut ? 'Đang đăng xuất...' : 'Đăng Xuất'}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
