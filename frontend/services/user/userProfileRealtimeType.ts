import { MeResponse } from '@/types/dto';

export const USER_PROFILE_UPDATED_EVENT = 'USER_PROFILE_UPDATED' as const;
export const USER_PROFILE_TYPES = ['APPLICANT', 'RECRUITER', 'COMPANY'] as const;

export type UserProfileType = (typeof USER_PROFILE_TYPES)[number];
export type UserProfilePatch = Partial<MeResponse>;

export type UserProfileUpdatedEventEnvelope = {
  event: typeof USER_PROFILE_UPDATED_EVENT;
  profileType: UserProfileType;
  emittedAt: string;
  data: MeResponse;
};

export type UserProfileUpdatedEventRaw = {
  event?: string;
  profileType?: string;
  emittedAt?: string;
  data?: UserProfilePatch;
};

export type UserProfileUpdatedEventPayload = UserProfileUpdatedEventRaw;
