import { AuthUser } from '@/lib/features/authSyncTypes';
import { getUserUpdatedAt, parseIsoTime } from '@/lib/features/authSyncUtils';

type ShouldApplyUserSyncByRecencyInput = {
  currentUser: AuthUser | null;
  incomingUser: unknown;
  currentEmittedAt?: string | null;
  incomingEmittedAt?: string;
  force?: boolean;
};

export const shouldApplyUserSyncByRecency = ({
  currentUser,
  incomingUser,
  currentEmittedAt,
  incomingEmittedAt,
  force = false,
}: ShouldApplyUserSyncByRecencyInput) => {
  if (force || !currentUser) {
    return true;
  }

  const currentUpdatedAt = parseIsoTime(getUserUpdatedAt(currentUser));
  const incomingUpdatedAt = parseIsoTime(getUserUpdatedAt(incomingUser));

  if (incomingUpdatedAt !== null && currentUpdatedAt !== null) {
    if (incomingUpdatedAt > currentUpdatedAt) {
      return true;
    }

    if (incomingUpdatedAt < currentUpdatedAt) {
      return false;
    }
  }

  if (incomingUpdatedAt !== null && currentUpdatedAt === null) {
    return true;
  }

  const currentEmittedTimestamp = parseIsoTime(currentEmittedAt);
  const incomingEmittedTimestamp = parseIsoTime(incomingEmittedAt);

  if (incomingEmittedTimestamp !== null && currentEmittedTimestamp !== null) {
    return incomingEmittedTimestamp > currentEmittedTimestamp;
  }

  if (incomingEmittedTimestamp !== null && currentEmittedTimestamp === null) {
    return true;
  }

  return false;
};
