import { api } from '@/services/api';
import { buildSpringQuery } from '@/utils/buildSpringQuery';
import {
  CountJobsByCompanyResponse,
  CreateJobRequest,
  FetchJobByIdResponse,
  FetchJobByRecruiterRequest,
  FetchJobsRequest,
  FetchJobsResponse,
  FetchSuitableApplicantsRequest,
  JobApplicationCountResponse,
  JobIdsRequest,
  JobMutationResponse,
  ToggleJobActiveResponse,
  ToggleJobEnabledRequest,
  ToggleJobEnabledResponse,
  UpdateJobRequest,
} from './jobType';
import { FetchResumesResponse } from '../resume/resumeType';

export const jobApi = api.injectEndpoints({
  endpoints: (builder) => ({
    createJob: builder.mutation<JobMutationResponse, CreateJobRequest>({
      query: (job) => ({
        url: '/jobs',
        method: 'POST',
        data: job,
      }),
      invalidatesTags: [
        { type: 'Job', id: 'LIST' },
        { type: 'Job', id: 'AVAILABLE' },
        { type: 'Job', id: 'COMPANY_COUNT' },
      ],
    }),

    updateJob: builder.mutation<JobMutationResponse, UpdateJobRequest>({
      query: ({ jobId, ...job }) => ({
        url: '/jobs',
        method: 'PUT',
        data: { ...job, jobId },
      }),
      invalidatesTags: (_, __, arg) => [
        { type: 'Job', id: arg.jobId },
        { type: 'Job', id: 'LIST' },
        { type: 'Job', id: 'AVAILABLE' },
      ],
    }),

    deleteJob: builder.mutation<JobMutationResponse, number>({
      query: (jobId) => ({
        url: `/jobs/${jobId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_, __, jobId) => [
        { type: 'Job', id: jobId },
        { type: 'Job', id: 'LIST' },
        { type: 'Job', id: 'AVAILABLE' },
        { type: 'Job', id: 'COMPANY_COUNT' },
      ],
    }),

    fetchJobs: builder.query<FetchJobsResponse, FetchJobsRequest>({
      query: (params) => {
        const { params: queryParams } = buildSpringQuery({
          params,
          filterFields: ['title', 'location', 'salary', 'active', 'level', 'workingType', 'enabled'],
          textSearchFields: ['title', 'location'],
          nestedArrayFields: {
            skills: 'skills.name',
          },
          defaultSort: 'createdAt,desc',
          sortableFields: ['title', 'salary', 'createdAt', 'updatedAt'],
        });

        return {
          url: '/jobs',
          method: 'GET',
          params: queryParams,
        };
      },
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.result.map((job) => ({
                type: 'Job' as const,
                id: job.jobId,
              })),
              { type: 'Job', id: 'LIST' },
            ]
          : [{ type: 'Job', id: 'LIST' }],
    }),

    fetchJobById: builder.query<FetchJobByIdResponse, number>({
      query: (jobId) => ({
        url: `/jobs/${jobId}`,
        method: 'GET',
      }),
      providesTags: (_, __, jobId) => [{ type: 'Job', id: jobId }],
    }),

    fetchJobsAvailable: builder.query<FetchJobsResponse, Omit<FetchJobsRequest, 'active'>>({
      query: (params) => {
        const { params: queryParams } = buildSpringQuery({
          params: {
            ...params,
          },
          filterFields: ['title', 'salary', 'active', 'level', 'workingType', 'enabled'],
          textSearchFields: ['title'],
          nestedArrayFields: {
            skills: 'skills.skillId',
          },
          nestedFields: {
            provinces: 'address.province',
            companyId: 'company.accountId',
          },
          defaultSort: 'createdAt,desc',
          sortableFields: ['title', 'salary', 'createdAt', 'updatedAt'],
        });

        return {
          url: '/jobs/available',
          method: 'GET',
          params: queryParams,
        };
      },
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.result.map((job) => ({
                type: 'Job' as const,
                id: job.jobId,
              })),
              { type: 'Job', id: 'AVAILABLE' },
            ]
          : [{ type: 'Job', id: 'AVAILABLE' }],
    }),

    fetchRelatedJobs: builder.query<
      FetchJobsResponse,
      {
        skills: number[];
        page?: number;
        size?: number;
      }
    >({
      query: ({ skills, page = 1, size = 6 }) => {
        const { params: queryParams } = buildSpringQuery({
          params: {
            skills,
            active: true,
            page,
            size,
          },
          filterFields: ['active'],
          nestedArrayFields: {
            skills: 'skills.skillId',
          },
          defaultSort: 'createdAt,desc',
          sortableFields: ['updatedAt', 'createdAt'],
        });

        return {
          url: '/jobs',
          method: 'GET',
          params: queryParams,
        };
      },
      providesTags: (result) =>
        result?.data
          ? result.data.result.map((job) => ({
              type: 'Job' as const,
              id: job.jobId,
            }))
          : [],
    }),

    fetchJobsByRecruiter: builder.query<FetchJobsResponse, FetchJobByRecruiterRequest>({
      query: ({ recruiterId, ...params }) => {
        const { params: queryParams } = buildSpringQuery({
          params,
          filterFields: ['title', 'location', 'salary', 'level', 'workingType', 'active'],
          textSearchFields: ['title', 'location'],
          nestedArrayFields: {
            skills: 'skills.name',
          },
          defaultSort: 'createdAt,desc',
          sortableFields: ['title', 'salary', 'createdAt', 'updatedAt'],
        });
        return {
          url: `/recruiters/${recruiterId}/jobs`,
          method: 'GET',
          params: queryParams,
        };
      },
      providesTags: (result, _, arg) =>
        result?.data
          ? [
              ...result.data.result.map((job) => ({
                type: 'Job' as const,
                id: job.jobId,
              })),
              { type: 'Job', id: `RECRUITER-${arg.recruiterId}` },
            ]
          : [{ type: 'Job', id: `RECRUITER-${arg.recruiterId}` }],
    }),

    fetchJobsByCurrentRecruiter: builder.query<FetchJobsResponse, FetchJobsRequest>({
      query: (params) => {
        const { params: queryParams } = buildSpringQuery({
          params,
          filterFields: ['title', 'location', 'salary', 'level', 'workingType', 'active'],
          textSearchFields: ['title', 'location'],
          nestedArrayFields: {
            skills: 'skills.name',
          },
          defaultSort: 'createdAt,desc',
          sortableFields: ['title', 'salary', 'createdAt', 'updatedAt'],
        });

        return {
          url: `/recruiters/me/jobs`,
          method: 'GET',
          params: queryParams,
        };
      },
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.result.map((job) => ({
                type: 'Job' as const,
                id: job.jobId,
              })),
              { type: 'Job', id: 'MY_JOBS' },
            ]
          : [{ type: 'Job', id: 'MY_JOBS' }],
    }),

    activateJobs: builder.mutation<ToggleJobActiveResponse, JobIdsRequest>({
      query: (data) => ({
        url: '/jobs/activate',
        method: 'PUT',
        data,
      }),
      invalidatesTags: (_, __, arg) => [
        ...arg.jobIds.map((id) => ({ type: 'Job' as const, id })),
        { type: 'Job', id: 'LIST' },
        { type: 'Job', id: 'MY_JOBS' },
        { type: 'Job', id: 'AVAILABLE' },
      ],
    }),

    deactivateJobs: builder.mutation<ToggleJobActiveResponse, JobIdsRequest>({
      query: (data) => ({
        url: '/jobs/deactivate',
        method: 'PUT',
        data,
      }),
      invalidatesTags: (_, __, arg) => [
        ...arg.jobIds.map((id) => ({ type: 'Job' as const, id })),
        { type: 'Job', id: 'LIST' },
        { type: 'Job', id: 'MY_JOBS' },
        { type: 'Job', id: 'AVAILABLE' },
      ],
    }),

    enabledJobs: builder.mutation<ToggleJobEnabledResponse, ToggleJobEnabledRequest>({
      query: (data) => ({
        url: '/jobs/enabled',
        method: 'PUT',
        data,
      }),
      invalidatesTags: (_, __, arg) => [
        ...arg.jobIds.map((id) => ({ type: 'Job' as const, id })),
        { type: 'Job', id: 'LIST' },
        { type: 'Job', id: 'AVAILABLE' },
      ],
    }),

    disabledJobs: builder.mutation<ToggleJobEnabledResponse, ToggleJobEnabledRequest>({
      query: (data) => ({
        url: '/jobs/disabled',
        method: 'PUT',
        data,
      }),
      invalidatesTags: (_, __, arg) => [
        ...arg.jobIds.map((id) => ({ type: 'Job' as const, id })),
        { type: 'Job', id: 'LIST' },
        { type: 'Job', id: 'AVAILABLE' },
      ],
    }),

    countApplications: builder.query<JobApplicationCountResponse, JobIdsRequest>({
      query: ({ jobIds }) => {
        return {
          url: '/jobs/count-applications',
          method: 'GET',
          params: {
            jobIds: jobIds.join(','),
          },
        };
      },
      providesTags: (_, __, arg) => arg.jobIds.map((id) => ({ type: 'Job' as const, id: `COUNT-${id}` })),
    }),

    countAvailableJobsByCompany: builder.query<CountJobsByCompanyResponse, void>({
      query: () => ({
        url: `/jobs/companies/count`,
        method: 'GET',
      }),
      providesTags: [{ type: 'Job', id: 'COMPANY_COUNT' }],
    }),

    fetchSuitableResumesForJob: builder.query<FetchResumesResponse, FetchSuitableApplicantsRequest>({
      query: ({ jobId, ...params }) => {
        const { params: queryParams } = buildSpringQuery({
          params,
          filterFields: [],
          defaultSort: 'createdAt,desc',
        });

        return {
          url: `/jobs/${jobId}/resumes`,
          method: 'GET',
          params: queryParams,
        };
      },
      providesTags: (_, __, arg) => [
        { type: 'Job', id: `RESUMES-${arg.jobId}` },
        { type: 'Resume', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useCreateJobMutation,
  useUpdateJobMutation,
  useDeleteJobMutation,
  useFetchJobsQuery,
  useFetchJobByIdQuery,
  useFetchJobsAvailableQuery,
  useFetchRelatedJobsQuery,
  useFetchJobsByRecruiterQuery,
  useFetchJobsByCurrentRecruiterQuery,
  useActivateJobsMutation,
  useDeactivateJobsMutation,
  useEnabledJobsMutation,
  useDisabledJobsMutation,
  useCountApplicationsQuery,
  useCountAvailableJobsByCompanyQuery,
  useFetchSuitableResumesForJobQuery,
} = jobApi;
