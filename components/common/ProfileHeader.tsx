'use client';

import UpdateAvatarDialog from '@/app/(main)/profile/components/UpdateAvatarDialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useUser } from '@/hooks/useUser';
import { Camera, Eye, EyeOff, Mail, User as UserIcon } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ApplicantResponse, MeResponse, RecruiterResponse } from '@/types/dto';
import { isApplicantResponse, isCompanyResponse } from '@/utils/slug';

interface ProfileHeaderProps {
  fullPage?: boolean;
  type: string;
}

export default function ProfileHeader({ fullPage = false, type }: Readonly<ProfileHeaderProps>) {
  const [imageError, setImageError] = useState(false);
  const [isAvatarDialogOpen, setIsAvatarDialogOpen] = useState(false);
  const [isCoverPhotoDialogOpen, setIsCoverPhotoDialogOpen] = useState(false);
  const { user } = useUser();

  const me = user as MeResponse;
  const isApplicant = isApplicantResponse(me);
  const isCompany = isCompanyResponse(me);
  const profile = !isCompany ? (me as ApplicantResponse | RecruiterResponse) : null;

  const displayName = isCompany ? me.name : profile?.fullName || profile?.email || '';
  const displayImage = isCompany ? me.logo : profile?.avatar;
  const coverPhoto = me?.coverPhoto || '/default-cover.svg';
  const hasAvatar = displayImage && !imageError;

  return (
    <div className="border-b border-border bg-card">
      <div
        className="h-48 bg-muted bg-cover bg-center bg-no-repeat relative group"
        style={{
          backgroundImage: `url(${coverPhoto})`,
        }}
      >
        <div className="absolute inset-0 bg-black/10" />
        <Button
          onClick={() => setIsCoverPhotoDialogOpen(true)}
          size="icon"
          variant="secondary"
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity rounded-full"
        >
          <Camera className="h-4 w-4" />
        </Button>
      </div>

      <div className={cn(!fullPage && 'mx-auto max-w-7xl px-4 sm:px-6 lg:px-8', 'py-8')}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="relative group -mt-24">
            <div className="h-36 w-36 rounded-full border-4 border-card overflow-hidden bg-muted flex items-center justify-center">
              {hasAvatar ? (
                <Avatar className="h-full w-full">
                  <AvatarImage
                    src={displayImage}
                    alt={displayName}
                    onError={() => setImageError(true)}
                    className="aspect-square object-cover"
                  />
                  <AvatarFallback className="text-2xl font-semibold">
                    {displayName
                      .split(' ')
                      .map((n: string) => n[0])
                      .join('')
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              ) : (
                <UserIcon className="w-12 h-12 text-muted-foreground" />
              )}
            </div>

            <Button
              onClick={() => setIsAvatarDialogOpen(true)}
              size="icon"
              variant="secondary"
              className="absolute bottom-0 right-0 h-8 w-8 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Camera className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-foreground">{displayName || 'Người dùng'}</h1>

              {isApplicant && user && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild className="cursor-pointer">
                      <div className="flex items-center gap-2 py-1 rounded-full">
                        {(me as ApplicantResponse).availableStatus ? (
                          <Eye className="h-5 w-5 text-green-600" />
                        ) : (
                          <EyeOff className="h-5 w-5 text-destructive" />
                        )}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        {(me as ApplicantResponse).availableStatus
                          ? 'Hồ sơ của bạn đang công khai, có thể tìm thấy bởi các nhà tuyển dụng'
                          : 'Hồ sơ của bạn đang ẩn, không thể tìm thấy bởi các nhà tuyển dụng'}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>

            <div className="text-sm space-y-1">
              {me?.username && <p className="text-sm text-muted-foreground">@{me.username}</p>}

              {me?.email && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4 shrink-0" />
                  <span className="truncate">{me.email}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <UpdateAvatarDialog open={isAvatarDialogOpen} onOpenChange={setIsAvatarDialogOpen} type={type} />
      <UpdateAvatarDialog
        open={isCoverPhotoDialogOpen}
        onOpenChange={setIsCoverPhotoDialogOpen}
        type={type}
        field="coverPhoto"
      />
    </div>
  );
}
