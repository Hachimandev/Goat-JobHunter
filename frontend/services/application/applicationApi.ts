import { api } from '@/services/api';
import { buildSpringQuery } from '@/utils/buildSpringQuery';
import {
  AcceptApplicationStatusRequest,
  ApplicationMutationResponse,
  CountApplicationsRequest,
  CountApplicationsResponse,
  CreateApplicationRequest,
  FetchApplicationByIdResponse,
  FetchApplicationsByApplicantRequest,
  FetchApplicationsRequest,
  FetchApplicationsResponse,
  RejectApplicationStatusRequest,
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

    acceptApplicationStatus: builder.mutation<ApplicationMutationResponse, AcceptApplicationStatusRequest>({
      query: (data) => ({
        url: '/applications/accepted',
        method: 'PUT',
        data,
      }),
      invalidatesTags: ['Application'],
    }),

    rejectApplicationStatus: builder.mutation<ApplicationMutationResponse, RejectApplicationStatusRequest>({
      query: (data) => ({
        url: '/applications/rejected',
        method: 'PUT',
        data,
      }),
      invalidatesTags: ['Application'],
    }),

    deleteApplication: builder.mutation<ApplicationMutationResponse, string>({
      query: (applicationId) => ({
        url: `/applications/${applicationId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Application'],
    }),

    fetchApplicationById: builder.query<FetchApplicationByIdResponse, string>({
      query: (applicationId) => ({
        url: `/applications/${applicationId}`,
        method: 'GET',
      }),
      providesTags: ['Application'],
    }),

    fetchApplications: builder.query<FetchApplicationsResponse, FetchApplicationsRequest>({
      query: (params) => {
        const { params: queryParams } = buildSpringQuery({
          params,
          filterFields: ['jobTitle', 'status'],
          textSearchFields: ['jobTitle'],
          nestedFields: {
            jobTitle: 'job.title',
          },
          defaultSort: 'createdAt,desc',
          sortableFields: ['createdAt', 'status'],
        });

        return {
          url: '/all-applications',
          method: 'GET',
          params: queryParams,
        };
      },
      providesTags: ['Application'],
    }),

    fetchApplicationsByRecruiter: builder.query<FetchApplicationsResponse, FetchApplicationsRequest>({
      query: (params) => {
        const { params: queryParams } = buildSpringQuery({
          params,
          filterFields: ['jobTitle', 'status'],
          textSearchFields: ['jobTitle'],
          nestedFields: {
            jobTitle: 'job.title',
          },
          defaultSort: 'createdAt,desc',
          sortableFields: ['createdAt', 'status'],
        });

        return {
          url: '/applications',
          method: 'GET',
          params: queryParams,
        };
      },
      providesTags: ['Application'],
    }),

    fetchApplicationsByCurrentApplicant: builder.query<FetchApplicationsResponse, FetchApplicationsByApplicantRequest>({
      query: (params) => {
        const { params: queryParams } = buildSpringQuery({
          params,
          filterFields: [],
          defaultSort: 'updatedAt,desc',
        });

        return {
          url: '/applications/by-applicant',
          method: 'GET',
          params: queryParams,
        };
      },
      providesTags: ['Application'],
    }),

    fetchApplicationsByApplicant: builder.query<FetchApplicationsResponse, FetchApplicationsByApplicantRequest>({
      query: ({ applicantId, ...params }) => {
        const { params: queryParams } = buildSpringQuery({
          params,
          filterFields: [],
          defaultSort: 'updatedAt,desc',
        });

        return {
          url: `/applications/by-applicant/${applicantId}`,
          method: 'GET',
          params: queryParams,
        };
      },
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
  useAcceptApplicationStatusMutation,
  useRejectApplicationStatusMutation,
  useDeleteApplicationMutation,
  useFetchApplicationByIdQuery,
  useFetchApplicationsQuery,
  useFetchApplicationsByRecruiterQuery,
  useFetchApplicationsByCurrentApplicantQuery,
  useFetchApplicationsByApplicantQuery,
  useCountApplicationsByJobAndApplicantQuery,
} = applicationApi;
