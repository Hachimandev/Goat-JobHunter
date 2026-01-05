import { IBackendRes } from '../../types/api';

// Sign In
export type SignInRequest = {
  email: string;
  password: string;
};

export type SignInResponse = IBackendRes<{
  accountId: number;
  username: string;
  email: string;
  avatar?: string;
  fullName?: string;
  role: {
    roleId: number;
    name: string;
  };
}>;

// Logout
export type LogoutResponse = IBackendRes<string>;

// Get Account
export type FetchAccountResponse = IBackendRes<{
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
}>;

