import { api } from '@/services/api';
import {
  FetchAllCompanyNames,
  FetchCompaniesRequest,
  FetchCompaniesResponse,
  FetchCompanyByIdResponse,
  FetchGroupedAddressesByCompanyResponse,
  FetchJobsByCompanyRequest,
  FetchJobsByCompanyResponse,
  FetchSkillsByCompanyResponse,
} from './companyType';
import { buildSpringQuery } from '@/utils/buildSpringQuery';
import { setUser } from '@/lib/features/authSlice';

export const companyApi = api.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    fetchCompanies: builder.query<FetchCompaniesResponse, FetchCompaniesRequest>({
      query: (params) => {
        const { params: queryParams } = buildSpringQuery({
          params,
          filterFields: ['name'],
          textSearchFields: ['name'],
          defaultSort: 'createdAt,desc',
          sortableFields: ['name', 'createdAt', 'updatedAt'],
        });

        return {
          url: '/companies',
          method: 'GET',
          params: queryParams,
        };
      },
      providesTags: ['Company'],
    }),

    fetchAvailableCompanies: builder.query<FetchCompaniesResponse, FetchCompaniesRequest>({
      query: (params) => {
        const { params: queryParams } = buildSpringQuery({
          params,
          filterFields: ['name', 'verified'],
          textSearchFields: ['name'],
          nestedArrayFields: {
            addresses: 'addresses.province',
          },
          defaultSort: 'createdAt,desc',
          sortableFields: ['name', 'createdAt', 'updatedAt'],
        });

        return {
          url: '/companies/available',
          method: 'GET',
          params: queryParams,
        };
      },
      providesTags: ['Company'],
    }),

    fetchCompanyById: builder.query<FetchCompanyByIdResponse, number>({
      query: (companyId) => ({
        url: `/companies/${companyId}`,
        method: 'GET',
      }),
      providesTags: ['Company'],
    }),

    fetchCompanyByName: builder.query<FetchCompanyByIdResponse, string>({
      query: (name) => ({
        url: `/companies/slug/${name}`,
        method: 'GET',
      }),
      providesTags: ['Company'],
    }),

    fetchGroupedAddressesByCompany: builder.query<FetchGroupedAddressesByCompanyResponse, number>({
      query: (companyId) => ({
        url: `/companies/${companyId}/group-addresses`,
        method: 'GET',
      }),
      providesTags: ['Company'],
    }),

    fetchSkillsByCompany: builder.query<FetchSkillsByCompanyResponse, number>({
      query: (companyId) => ({
        url: `/companies/${companyId}/jobs/skills`,
        method: 'GET',
      }),
      providesTags: ['Company'],
    }),

    fetchAvailableJobsByCompany: builder.query<FetchJobsByCompanyResponse, FetchJobsByCompanyRequest>({
      query: ({ companyId }) => {
        const { params: queryParams } = buildSpringQuery({
          params: {
            enabled: true,
          },
          filterFields: ['title', 'location', 'salary', 'level', 'workingType', 'active', 'enabled'],
          textSearchFields: ['title', 'location'],
          nestedArrayFields: {
            skills: 'skills.name',
          },
          defaultSort: 'createdAt,desc',
          sortableFields: ['title', 'salary', 'createdAt', 'updatedAt'],
        });
        return {
          url: `/companies/${companyId}/jobs`,
          method: 'GET',
          params: queryParams,
        };
      },
      providesTags: ['Job'],
    }),

    fetchAllCompanyNames: builder.query<FetchAllCompanyNames, void>({
      query: () => {
        return {
          url: `/companies/name`,
          method: 'GET',
        };
      },
      providesTags: ['Company'],
    }),

    updateCompany: builder.mutation({
      query: (formData: FormData) => ({
        url: `/companies`,
        method: 'PUT',
        data: formData,
      }),
      invalidatesTags: ['Company', 'Account'],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          // Dispatch action to save user data to slice
          dispatch(setUser({ user: data?.data }));
        } catch (error) {
          console.error('Failed to fetch account:', error);
        }
      },
    }),
  }),
});

export const {
  useFetchCompaniesQuery,
  useFetchAvailableCompaniesQuery,
  useFetchCompanyByIdQuery,
  useFetchCompanyByNameQuery,
  useFetchGroupedAddressesByCompanyQuery,
  useFetchSkillsByCompanyQuery,
  useFetchAvailableJobsByCompanyQuery,
  useFetchAllCompanyNamesQuery,
  useUpdateCompanyMutation,
} = companyApi;
