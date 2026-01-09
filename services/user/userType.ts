import { IBackendRes } from "../../types/api";

// Reset Password
export type ResetPasswordRequest = {
  email: string;
  newPassword: string;
};

export type ResetPasswordResponse = IBackendRes<unknown>;

