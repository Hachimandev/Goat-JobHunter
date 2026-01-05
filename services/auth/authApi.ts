import { api } from '../api';
import type {
  FetchAccountResponse,
  LogoutResponse,
  SignInRequest,
  SignInResponse,
} from './authType';

export const authApi = api.injectEndpoints({
  endpoints: (builder) => ({
    signin: builder.mutation<SignInResponse, SignInRequest>({
      query: ({ email, password }) => ({
        url: '/auth/login',
        method: 'POST',
        data: { email, password },
      }),
    }),

    logout: builder.mutation<LogoutResponse, void>({
      query: () => ({ url: '/auth/logout', method: 'POST' }),
    }),

    getMyAccount: builder.query<FetchAccountResponse, void>({
      query: () => ({ url: '/auth/account/users', method: 'GET' }),
      providesTags: ['User'],
    }),
  }),
});

export const {
  useSigninMutation,
  useLogoutMutation,
  useGetMyAccountQuery,
  useLazyGetMyAccountQuery,
} = authApi;

