import { api } from '@/services/api';
import { AccountIdsRequest, AccountStatusResponse, GetAccountsRequest, GetAccountsResponse } from './adminType';
import { buildSpringQuery } from '@/utils/buildSpringQuery';

export const adminApi = api.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getAllAccounts: builder.query<GetAccountsResponse, GetAccountsRequest>({
      query: (params) => {
        const { params: queryParams } = buildSpringQuery({
          params,
          filterFields: ['email', 'enabled', 'locked'],
          textSearchFields: ['email'],
          nestedArrayFields: {
            role: 'role.name',
          },
          defaultSort: 'createdAt,desc',
          sortableFields: ['createdAt', 'updatedAt'],
        });

        return {
          url: '/admin/accounts',
          method: 'GET',
          params: queryParams,
        };
      },
      providesTags: ['User', 'Recruiter', 'Applicant', 'Company'],
    }),

    lockedAccounts: builder.mutation<AccountStatusResponse, AccountIdsRequest>({
      query: (data) => ({
        url: '/admin/locked',
        method: 'PUT',
        data,
      }),
      invalidatesTags: ['User', 'Recruiter', 'Applicant', 'Company'],
    }),

    unlockedAccounts: builder.mutation<AccountStatusResponse, AccountIdsRequest>({
      query: (data) => ({
        url: '/admin/unlocked',
        method: 'PUT',
        data,
      }),
      invalidatesTags: ['User', 'Recruiter', 'Applicant', 'Company'],
    }),

    activateAccounts: builder.mutation<AccountStatusResponse, AccountIdsRequest>({
      query: (data) => ({
        url: '/admin/activate',
        method: 'PUT',
        data,
      }),
      invalidatesTags: ['User', 'Recruiter', 'Applicant', 'Company'],
    }),

    deactivateAccounts: builder.mutation<AccountStatusResponse, AccountIdsRequest>({
      query: (data) => ({
        url: '/admin/deactivate',
        method: 'PUT',
        data,
      }),
      invalidatesTags: ['User', 'Recruiter', 'Applicant', 'Company'],
    }),
  }),
});

export const {
  useGetAllAccountsQuery,
  useLockedAccountsMutation,
  useUnlockedAccountsMutation,
  useActivateAccountsMutation,
  useDeactivateAccountsMutation,
} = adminApi;
