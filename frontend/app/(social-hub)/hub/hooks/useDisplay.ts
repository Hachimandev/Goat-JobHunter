import { ApplicantResponse, CompanyResponse, LoginResponseDto, RecruiterResponse, UserResponse } from '@/types/dto';

export type UserData = UserResponse | ApplicantResponse | RecruiterResponse | CompanyResponse | LoginResponseDto;
export type UserOthers = UserResponse | ApplicantResponse | RecruiterResponse;

export const isCompanyUser = (user: UserData): boolean => {
  return 'logo' in user;
};

export const getDisplayImage = (user: UserData): string => {
  return isCompanyUser(user) ? (user as CompanyResponse).logo : (user as UserOthers)?.avatar;
};

export const getDisplayImageAlt = (user: UserData): string => {
  return isCompanyUser(user) ? (user as CompanyResponse).name : (user as UserOthers)?.fullName;
};

export const getDisplayInitial = (user: UserData): string => {
  const name = isCompanyUser(user) ? (user as CompanyResponse).name : (user as UserOthers)?.fullName;
  return name?.[0] || '';
};

export const getDisplayName = (user: UserData): string => {
  return isCompanyUser(user)
    ? (user as CompanyResponse).name
    : (user as UserOthers)?.fullName || (user as UserResponse)?.email;
};

export const getDisplayUsername = (user: UserData): string | undefined => {
  return isCompanyUser(user) ? undefined : (user as UserResponse)?.username;
};

export const getCoverPhoto = (user: UserData): string => {
  return (
    (user as UserResponse | ApplicantResponse | RecruiterResponse | CompanyResponse)?.coverPhoto || '/default-cover.svg'
  );
};
