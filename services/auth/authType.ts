import { IBackendRes } from "../../types/api";

// Sign Up
export type UserSignUpRequest = {
  email: string;
  fullName: string;
  username: string;
  phone: string;
  password: string;
  confirmPassword: string;
  type: "applicant" | "recruiter";
  gender: "MALE" | "FEMALE" | "OTHER";
};

export type UserSignUpResponse = IBackendRes<unknown>;

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

// Verify Code
export type VerifyCodeRequest = {
  email: string;
  verificationCode: string;
};

export type VerifyCodeResponse = IBackendRes<unknown>;

// Resend Code
export type ResendCodeRequest = {
  email: string;
};

export type ResendCodeResponse = IBackendRes<unknown>;

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

// Company Sign Up
export type CompanySignUpRequest = {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  description: string;
  logo: string;
  coverPhoto: string;
  website?: string;
  phone: string;
  size: "STARTUP" | "SMALL" | "MEDIUM" | "LARGE" | "ENTERPRISE";
  country: string;
  industry: string;
  workingDays: string;
  overtimePolicy: string;
  addresses: {
    province: string;
    fullAddress: string;
  }[];
};

export type CompanySignUpResponse = IBackendRes<unknown>;
