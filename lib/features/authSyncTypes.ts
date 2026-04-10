import { LoginResponseDto, MeResponse, UserResponse } from '@/types/dto';

export type AuthUser = LoginResponseDto | UserResponse | MeResponse;

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
