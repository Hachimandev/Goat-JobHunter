import { api } from '../api';
import type {
  CompanyIdRequest,
  FetchAllCompanyNames,
  FetchCompaniesRequest,
  FetchCompaniesResponse,
  FetchCompanyByIdResponse,
  FetchGroupedAddressesByCompanyResponse,
  FetchJobsByCompanyRequest,
  FetchJobsByCompanyResponse,
  FetchSkillsByCompanyResponse,
} from './companyType';

export const companyApi = api.injectEndpoints({
  endpoints: (builder) => ({
    fetchCompanies: builder.query<FetchCompaniesResponse, FetchCompaniesRequest>({
      query: (params) => {
        const queryParams: any = {
          page: params.page || 1,
          size: params.size || 10,
        };

        if (params.name) {
          queryParams.name = params.name;
        }

        if (params.addresses && params.addresses.length > 0) {
          queryParams.addresses = params.addresses.join(',');
        }

        if (params.verified !== undefined) {
          queryParams.verified = params.verified;
        }

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
        const queryParams: any = {
          page: params.page || 1,
          size: params.size || 10,
        };

        if (params.name) {
          queryParams.name = params.name;
        }

        if (params.addresses && params.addresses.length > 0) {
          queryParams.addresses = params.addresses.join(',');
        }

        if (params.verified !== undefined) {
          queryParams.verified = params.verified;
        }

        return {
          url: '/companies/available',
          method: 'GET',
          params: queryParams,
        };
      },
      providesTags: ['Company'],
    }),

    fetchCompanyById: builder.query<FetchCompanyByIdResponse, CompanyIdRequest>({
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

    fetchGroupedAddressesByCompany: builder.query<
      FetchGroupedAddressesByCompanyResponse,
      CompanyIdRequest
    >({
      query: (companyId) => ({
        url: `/companies/${companyId}/group-addresses`,
        method: 'GET',
      }),
      providesTags: ['Company'],
    }),

    fetchSkillsByCompany: builder.query<FetchSkillsByCompanyResponse, CompanyIdRequest>({
      query: (companyId) => ({
        url: `/companies/${companyId}/jobs/skills`,
        method: 'GET',
      }),
      providesTags: ['Company'],
    }),

    fetchAvailableJobsByCompany: builder.query<FetchJobsByCompanyResponse, FetchJobsByCompanyRequest>({
      query: ({ companyId }) => {
        return {
          url: `/companies/${companyId}/jobs`,
          method: 'GET',
          params: {
            enabled: true,
          },
        };
      },
      providesTags: ['Job'],
    }),

    fetchAllCompanyNames: builder.query<FetchAllCompanyNames, void>({
      query: () => ({
        url: `/companies/name`,
        method: 'GET',
      }),
      providesTags: ['Company'],
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
} = companyApi;

