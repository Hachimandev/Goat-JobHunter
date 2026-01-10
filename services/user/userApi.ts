import { api } from '../api';
import { ResetPasswordRequest, ResetPasswordResponse } from './userType';

export const userApi = api.injectEndpoints({
  endpoints: (builder) => ({
    resetPassword: builder.mutation<ResetPasswordResponse, ResetPasswordRequest>({
      query: (data) => ({
        url: '/users/reset-password',
        method: 'PUT',
        data,
      }),
    }),
  }),
});

export const {
  useResetPasswordMutation,
} = userApi;

