import { api } from '../api';
import { setUser } from '@/lib/authSlice';
import { tokenManager } from '@/lib/tokenManager';
import type {
  FetchAccountResponse,
  LogoutResponse,
  ResendCodeRequest,
  ResendCodeResponse,
  SignInRequest,
  SignInResponse,
  UserSignUpRequest,
  UserSignUpResponse,
  VerifyCodeRequest,
  VerifyCodeResponse,
  CompanySignUpRequest,
  CompanySignUpResponse,
  DeleteAccountRequest,
  DeleteAccountResponse,
} from './authType';

export const authApi = api.injectEndpoints({
  endpoints: (builder) => ({
    userSignUp: builder.mutation<UserSignUpResponse, UserSignUpRequest>({
      query: (args) => ({
        url: '/auth/register/users',
        method: 'POST',
        data: args,
      }),
    }),

    companySignUp: builder.mutation<CompanySignUpResponse, CompanySignUpRequest>({
      query: (args) => ({
        url: '/auth/register/companies',
        method: 'POST',
        data: args,
      }),
    }),

    signin: builder.mutation<SignInResponse, SignInRequest>({
      query: ({ email, password }) => ({
        url: '/auth/login',
        method: 'POST',
        data: { email, password },
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          
          // Tokens are automatically saved via Set-Cookie headers (withCredentials: true)
          // We save tokens to tokenManager as a flag for hasValidToken() checks
          await tokenManager.saveTokens('cookie-authenticated', 'cookie-authenticated');
          
          // Lưu user data vào Redux
          if (data?.data) {
            dispatch(
              setUser({
                user: data.data,
                roles: data.data.role ? [data.data.role.name] : [],
              })
            );
          }
        } catch (error) {
          console.error('Login error:', error);
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
      providesTags: ['User'],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          
          // Dispatch action to save user data to slice
          if (data?.data) {
            dispatch(
              setUser({
                user: data.data,
                roles: data.data.role ? [data.data.role.name] : [],
              })
            );
          }
        } catch (error) {
          console.error('Get my account error:', error);
          // Clear token if fetch failed
          await tokenManager.clearTokens();
        }
      },
    }),

    deleteMyAccount: builder.mutation<DeleteAccountResponse, DeleteAccountRequest>({
      query: (args) => ({
        url: '/auth/account',
        method: 'DELETE',
        data: args,
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          // Clear user data on successful deletion
          dispatch(setUser({ user: undefined, roles: [] }));
          await tokenManager.clearTokens();
        } catch (error) {
          console.error('Delete account error:', error);
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
  useLazyGetMyAccountQuery,
  useDeleteMyAccountMutation,
} = authApi;

