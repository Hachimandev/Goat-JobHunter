import { api } from '@/services/api';
import type {
  DeleteAccountRequest,
  FetchAccountResponse,
  LogoutResponse,
  ResendCodeRequest,
  ResendCodeResponse,
  SignInRequest,
  VerifyCodeRequest,
  VerifyCodeResponse,
} from './authType';
import { ApplicantResponse, CompanyResponse, RecruiterResponse } from '@/types/dto';
import { IBackendRes } from '@/types/api';
import { createUserSyncOnQueryStarted } from '@/services/utils/userSyncOnQueryStarted';

export const authApi = api.injectEndpoints({
  endpoints: (builder) => ({
    userSignUp: builder.mutation({
      query: (args) => ({
        url: '/auth/register/users',
        method: 'POST',
        data: args,
      }),
    }),

    companySignUp: builder.mutation({
      query: (formData: FormData) => ({
        url: '/auth/register/companies',
        method: 'POST',
        data: formData,
      }),
    }),

    signin: builder.mutation<IBackendRes<ApplicantResponse | RecruiterResponse | CompanyResponse>, SignInRequest>({
      query: ({ email, password }) => ({
        url: '/auth/login',
        method: 'POST',
        data: { email, password },
      }),
      onQueryStarted: createUserSyncOnQueryStarted({ operation: 'sign in', force: true }),
    }),

    logout: builder.mutation<LogoutResponse, void>({
      query: () => ({ url: '/auth/logout', method: 'POST' }),
    }),

    verifyCode: builder.mutation<VerifyCodeResponse, VerifyCodeRequest>({
      query: ({ email, verificationCode }) => ({
        url: '/auth/verify',
        method: 'POST',
        data: { email, verificationCode },
      }),
    }),

    resendCode: builder.mutation<ResendCodeResponse, ResendCodeRequest>({
      query: ({ email }) => ({
        url: `/auth/resend?email=${email}`,
        method: 'POST',
      }),
    }),

    getMyAccount: builder.query<FetchAccountResponse, void>({
      query: () => ({ url: '/auth/account/users', method: 'GET' }),
      providesTags: ['User', 'Applicant', 'Recruiter', 'Company'],
      onQueryStarted: createUserSyncOnQueryStarted({ operation: 'fetch account' }),
    }),

    deleteMyAccount: builder.mutation<IBackendRes<void>, DeleteAccountRequest>({
      query: (deleteAccountRequest) => ({
        url: '/auth/account',
        method: 'DELETE',
        data: deleteAccountRequest,
      }),
      invalidatesTags: ['User', 'Applicant', 'Recruiter', 'Company'],
    }),
  }),
});

export const {
  useUserSignUpMutation,
  useCompanySignUpMutation,
  useSigninMutation,
  useLogoutMutation,
  useVerifyCodeMutation,
  useResendCodeMutation,
  useGetMyAccountQuery,
  useDeleteMyAccountMutation,
} = authApi;
