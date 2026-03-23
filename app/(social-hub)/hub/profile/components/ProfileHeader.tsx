import { Camera } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Image from 'next/image';
import { useUser } from '@/hooks/useUser';
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

const getCoverPhoto = (user: UserData): string => {
  return (
    (user as UserResponse | ApplicantResponse | RecruiterResponse | CompanyResponse)?.coverPhoto ||
    '/placeholder.svg?height=400&width=1200&query=abstract-landscape'
  );
};

export function ProfileHeader() {
  const { user } = useUser(); // Get user data from redux store

  if (!user) return null;

  return (
    <div className="relative">
      <div className="h-48 md:h-64 w-full relative rounded-lg overflow-hidden bg-muted">
        <Image src={getCoverPhoto(user)} alt="Cover" fill className="w-full h-full object-cover" />
      </div>

      <div className="absolute -bottom-16 left-8 md:left-12">
        <div className="relative group">
          <Avatar className="w-32 h-32 md:w-40 md:h-40 border-4 border-background shadow-lg">
            <AvatarImage src={getDisplayImage(user)} alt={getDisplayImageAlt(user)} />
            <AvatarFallback className="text-2xl">{getDisplayInitial(user)}</AvatarFallback>
          </Avatar>
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
            <Camera className="w-8 h-8 text-white" />
          </div>
        </div>
      </div>
    </div>
  );
}
