import { AuthUser } from '@/lib/features/authSyncTypes';

export const toRecord = (value: unknown): Record<string, unknown> => {
  if (value && typeof value === 'object') {
    return value as Record<string, unknown>;
  }

  return {};
};

export const parseIsoTime = (value?: string | null): number | null => {
  if (!value) {
    return null;
  }

  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? null : timestamp;
};

export const getUserUpdatedAt = (user: unknown): string | undefined => {
  const updatedAt = toRecord(user).updatedAt;
  return typeof updatedAt === 'string' ? updatedAt : undefined;
};

export const deepEqual = (left: unknown, right: unknown): boolean => {
  if (left === right) {
    return true;
  }

  if (typeof left !== typeof right) {
    return false;
  }

  if (left === null || right === null) {
    return left === right;
  }

  if (Array.isArray(left) && Array.isArray(right)) {
    if (left.length !== right.length) {
      return false;
    }

    return left.every((item, index) => deepEqual(item, right[index]));
  }

  if (typeof left !== 'object' || typeof right !== 'object') {
    return false;
  }

  const leftRecord = left as Record<string, unknown>;
  const rightRecord = right as Record<string, unknown>;
  const leftKeys = Object.keys(leftRecord);
  const rightKeys = Object.keys(rightRecord);

  if (leftKeys.length !== rightKeys.length) {
    return false;
  }

  return leftKeys.every((key) => deepEqual(leftRecord[key], rightRecord[key]));
};

export const sanitizeProfilePatch = (profile: Partial<AuthUser>): Partial<AuthUser> => {
  const sanitizedProfile: Partial<AuthUser> = {};

  Object.entries(toRecord(profile)).forEach(([key, value]) => {
    if (value !== undefined) {
      (sanitizedProfile as Record<string, unknown>)[key] = value;
    }
  });

  return sanitizedProfile;
};
