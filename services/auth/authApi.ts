import { setUser } from '@/lib/features/authSlice';
import { api } from '@/services/api';
import type {
  FetchAccountResponse,
  LogoutResponse,
  ResendCodeRequest,
  ResendCodeResponse,
  SignInRequest,
  VerifyCodeRequest,
  VerifyCodeResponse,
} from './authType';
import { ApplicantResponse, CompanyResponse, RecruiterResponse, UserResponse } from '@/types/dto';
import { IBackendRes } from '@/types/api';

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
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          // Dispatch action to save user data to slice
          dispatch(setUser({ user: data?.data }));
        } catch (error) {
          console.error('Failed to sign in:', error);
        }
      },
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
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          // Dispatch action to save user data to slice
          dispatch(setUser({ user: data?.data as UserResponse | ApplicantResponse | RecruiterResponse | CompanyResponse }));
        } catch (error) {
          console.error('Failed to fetch account:', error);
        }
      },
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
} = authApi;
