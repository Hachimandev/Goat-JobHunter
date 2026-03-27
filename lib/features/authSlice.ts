import { useAppSelector } from '@/lib/hooks';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ApplicantResponse, CompanyResponse, LoginResponseDto, RecruiterResponse, UserResponse } from '@/types/dto';

interface AuthState {
  user: LoginResponseDto | UserResponse | ApplicantResponse | RecruiterResponse | CompanyResponse | null;
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
      action: PayloadAction<
        Partial<{
          user: UserResponse | ApplicantResponse | RecruiterResponse | CompanyResponse | LoginResponseDto;
          roles: string[];
        }>
      >,
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
