import {
  ApplicantResponse,
  CompanyResponse,
  LoginResponseDto,
  MeResponse,
  RecruiterResponse,
  UserResponse,
} from '@/types/dto';

export type AuthUser =
  | LoginResponseDto
  | UserResponse
  | MeResponse
  | CompanyResponse
  | ApplicantResponse
  | RecruiterResponse;

export type UserSyncPayload = {
  user: AuthUser;
  emittedAt?: string;
  force?: boolean;
};

export type MergeUserProfilePayload = {
  userId: number;
  profile: Partial<AuthUser>;
  emittedAt?: string;
};
