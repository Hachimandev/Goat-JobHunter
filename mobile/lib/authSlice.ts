import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { useAppSelector } from '@/lib/hooks';

interface User {
  accountId: number;
  username: string;
  email: string;
  avatar?: string;
  fullName?: string;
  phone?: string;
  dob?: string;
  gender?: string;
  address?: string;
  role: {
    roleId: number;
    name: string;
  };
}

interface AuthState {
  user: User | null;
  roles: string[];
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: null,
  roles: [],
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (
      state,
      action: PayloadAction<Partial<{ user: User; roles: string[] }>>
    ) => {
      const { user, roles } = action.payload;
      if (user) {
        state.user = user;
      }
      if (roles) {
        state.roles = roles;
      }
      state.isAuthenticated = true;
    },
    clearUser: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.roles = [];
    },
    setIsAuthenticated: (state, action: PayloadAction<boolean>) => {
      state.isAuthenticated = action.payload;
      if (!action.payload) {
        state.user = null;
        state.roles = [];
      }
    },
    setRoles: (state, action: PayloadAction<string[]>) => {
      state.roles = action.payload;
    },
  },
});

export const { setUser, clearUser, setIsAuthenticated, setRoles } = authSlice.actions;

export const useAuthSlice = () => useAppSelector((state) => state.auth);

export default authSlice.reducer;

