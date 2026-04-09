import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Image from 'next/image';
import { useUser } from '@/hooks/useUser';
import {
  getCoverPhoto,
  getDisplayImage,
  getDisplayImageAlt,
  getDisplayInitial,
  UserData,
} from '@/app/(social-hub)/hub/hooks/useDisplay';

type ProfileHeaderProps = {
  user?: UserData | null;
};

export function ProfileHeader({ user: profileUserProp }: Readonly<ProfileHeaderProps>) {
  const { user } = useUser();
  const profileUser = profileUserProp ?? user;

  if (!profileUser) return null;

  return (
    <div className="relative">
      <div className="h-48 md:h-64 w-full relative rounded-lg overflow-hidden bg-muted">
        <Image src={getCoverPhoto(profileUser)} alt="Cover" fill className="w-full h-full object-cover" />
      </div>

      <div className="absolute -bottom-16 left-8 md:left-12">
        <div className="relative group">
          <Avatar className="w-32 h-32 md:w-40 md:h-40 border-4 border-background shadow-lg">
            <AvatarImage src={getDisplayImage(profileUser)} alt={getDisplayImageAlt(profileUser)} />
            <AvatarFallback className="text-2xl">{getDisplayInitial(profileUser)}</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </div>
  );
}
