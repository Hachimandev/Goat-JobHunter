import { createSlice, PayloadAction } from '@reduxjs/toolkit';

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
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },
    clearUser: (state) => {
      state.user = null;
      state.isAuthenticated = false;
    },
  },
});

export const { setUser, clearUser } = authSlice.actions;
export default authSlice.reducer;

