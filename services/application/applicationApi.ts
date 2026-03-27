import { api } from '../api';
import {
  CreateApplicationRequest,
  ApplicationMutationResponse,
  CountApplicationsRequest,
  CountApplicationsResponse,
  FetchApplicationsRequest,
  FetchApplicationsResponse,
} from './applicationType';

export const applicationApi = api.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    createApplication: builder.mutation<ApplicationMutationResponse, CreateApplicationRequest>({
      query: (data) => ({
        url: '/applications',
        method: 'POST',
        data,
      }),
      invalidatesTags: ['Application'],
    }),

    fetchApplicationsByCurrentApplicant: builder.query<FetchApplicationsResponse, FetchApplicationsRequest>({
      query: (params) => ({
        url: '/applications/by-applicant',
        method: 'GET',
        params,
      }),
      providesTags: ['Application'],
    }),

    countApplicationsByJobAndApplicant: builder.query<CountApplicationsResponse, CountApplicationsRequest>({
      query: ({ jobId }) => ({
        url: `/applications/count`,
        method: 'GET',
        params: { jobId },
      }),
      providesTags: ['Application'],
    }),
  }),
});

export const {
  useCreateApplicationMutation,
  useFetchApplicationsByCurrentApplicantQuery,
  useCountApplicationsByJobAndApplicantQuery,
} = applicationApi;
