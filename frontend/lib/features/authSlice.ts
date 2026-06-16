import { useAppSelector } from '@/lib/hooks';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { shouldApplyUserSyncByRecency } from '@/lib/features/authSyncRecency';
import { AuthUser, MergeUserProfilePayload, UserSyncPayload } from '@/lib/features/authSyncTypes';
import { deepEqual, sanitizeProfilePatch, toRecord } from '@/lib/features/authSyncUtils';

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

const setLastUserSyncEmittedAt = (state: AuthState, emittedAt?: string) => {
  if (emittedAt) {
    state.lastUserSyncEmittedAt = emittedAt;
  }
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
      // Apply full user snapshot only when it is newer than current state.
      const { user, emittedAt, force } = action.payload;

      if (!user) {
        return;
      }

      if (
        !shouldApplyUserSyncByRecency({
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
        setLastUserSyncEmittedAt(state, emittedAt);
        state.isAuthenticated = true;
        return;
      }

      state.user = user;
      state.isAuthenticated = true;
      setLastUserSyncEmittedAt(state, emittedAt);
    },
    mergeUserProfileIfNewer: (state, action: PayloadAction<MergeUserProfilePayload>) => {
      // Merge partial realtime profile updates after user and recency guards pass.
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
        !shouldApplyUserSyncByRecency({
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
        setLastUserSyncEmittedAt(state, emittedAt);
        return;
      }

      state.user = mergedUser;
      state.isAuthenticated = true;
      setLastUserSyncEmittedAt(state, emittedAt);
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
