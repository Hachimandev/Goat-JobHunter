import { useAppSelector } from '@/lib/hooks';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { LoginResponseDto, MeResponse, UserResponse } from '@/types/dto';

type AuthUser = LoginResponseDto | UserResponse | MeResponse;

type UserSyncPayload = {
  user: AuthUser;
  emittedAt?: string;
  force?: boolean;
};

type MergeUserProfilePayload = {
  userId: number;
  profile: Partial<AuthUser>;
  emittedAt?: string;
};

const toRecord = (value: unknown): Record<string, unknown> => {
  if (value && typeof value === 'object') {
    return value as Record<string, unknown>;
  }

  return {};
};

const parseIsoTime = (value?: string | null): number | null => {
  if (!value) {
    return null;
  }

  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? null : timestamp;
};

const getUserUpdatedAt = (user: unknown): string | undefined => {
  const updatedAt = toRecord(user).updatedAt;
  return typeof updatedAt === 'string' ? updatedAt : undefined;
};

const deepEqual = (left: unknown, right: unknown): boolean => {
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

const sanitizeProfilePatch = (profile: Partial<AuthUser>): Partial<AuthUser> => {
  const sanitizedProfile: Partial<AuthUser> = {};

  Object.entries(toRecord(profile)).forEach(([key, value]) => {
    if (value !== undefined) {
      (sanitizedProfile as Record<string, unknown>)[key] = value;
    }
  });

  return sanitizedProfile;
};

const shouldApplyIncomingByRecency = ({
  currentUser,
  incomingUser,
  currentEmittedAt,
  incomingEmittedAt,
  force = false,
}: {
  currentUser: AuthUser | null;
  incomingUser: unknown;
  currentEmittedAt?: string | null;
  incomingEmittedAt?: string;
  force?: boolean;
}) => {
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

interface AuthState {
  user: AuthUser | null;
  roles: string[];
  isAuthenticated: boolean;
  lastUserSyncEmittedAt: string | null;
}

const initialState: AuthState = {
  user: null,
  roles: [],
  isAuthenticated: false,
  lastUserSyncEmittedAt: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (
      state,
      action: PayloadAction<
        Partial<{
          user: AuthUser;
          roles: string[];
        }>
      >,
    ) => {
      const { user, roles } = action.payload;
      if (user) {
        const currentUserId = typeof state.user?.accountId === 'number' ? state.user.accountId : null;
        if (currentUserId !== user.accountId) {
          state.lastUserSyncEmittedAt = null;
        }
        state.user = user;
      }
      if (roles) {
        state.roles = roles;
      }
      state.isAuthenticated = true;
    },
    setUserIfNewer: (state, action: PayloadAction<UserSyncPayload>) => {
      const { user, emittedAt, force } = action.payload;

      if (!user) {
        return;
      }

      if (
        !shouldApplyIncomingByRecency({
          currentUser: state.user,
          incomingUser: user,
          currentEmittedAt: state.lastUserSyncEmittedAt,
          incomingEmittedAt: emittedAt,
          force,
        })
      ) {
        return;
      }

      if (state.user && deepEqual(state.user, user)) {
        if (emittedAt) {
          state.lastUserSyncEmittedAt = emittedAt;
        }
        state.isAuthenticated = true;
        return;
      }

      state.user = user;
      state.isAuthenticated = true;
      if (emittedAt) {
        state.lastUserSyncEmittedAt = emittedAt;
      }
    },
    mergeUserProfileIfNewer: (state, action: PayloadAction<MergeUserProfilePayload>) => {
      const { userId, profile, emittedAt } = action.payload;

      if (!state.user) {
        return;
      }

      const currentUserRecord = toRecord(state.user);
      const currentUserId = currentUserRecord.accountId;

      if (typeof currentUserId !== 'number' || currentUserId !== userId) {
        return;
      }

      const incomingProfileRecord = toRecord(sanitizeProfilePatch(profile));

      if (Object.keys(incomingProfileRecord).length === 0) {
        return;
      }

      if (typeof incomingProfileRecord.accountId !== 'number') {
        incomingProfileRecord.accountId = userId;
      }

      if (
        !shouldApplyIncomingByRecency({
          currentUser: state.user,
          incomingUser: incomingProfileRecord,
          currentEmittedAt: state.lastUserSyncEmittedAt,
          incomingEmittedAt: emittedAt,
        })
      ) {
        return;
      }

      const mergedUser = {
        ...currentUserRecord,
        ...incomingProfileRecord,
      } as AuthUser;

      if (deepEqual(state.user, mergedUser)) {
        if (emittedAt) {
          state.lastUserSyncEmittedAt = emittedAt;
        }
        return;
      }

      state.user = mergedUser;
      state.isAuthenticated = true;

      if (emittedAt) {
        state.lastUserSyncEmittedAt = emittedAt;
      }
    },
    clearUser: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.roles = [];
      state.lastUserSyncEmittedAt = null;
    },
    setIsAuthenticated: (state, action: PayloadAction<boolean>) => {
      state.isAuthenticated = action.payload;
      if (!action.payload) {
        state.user = null;
        state.roles = [];
        state.lastUserSyncEmittedAt = null;
      }
    },
    setRoles: (state, action: PayloadAction<string[]>) => {
      state.roles = action.payload;
    },
  },
});

export const { setUser, setUserIfNewer, mergeUserProfileIfNewer, clearUser, setIsAuthenticated, setRoles } =
  authSlice.actions;

export const useAuthSlice = () => useAppSelector((state) => state.auth);

export default authSlice.reducer;
