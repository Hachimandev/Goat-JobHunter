import { api } from '../api';
import { buildSpringQuery } from '../../utils/buildSpringQuery';
import type {
  FetchJobsRequest,
  FetchJobsResponse,
  JobIdRequest,
  FetchJobByIdResponse,
  CountJobsByCompanyResponse,
} from './jobType';

export const jobApi = api.injectEndpoints({
  endpoints: (builder) => ({
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
            provinces: 'address.province',
          },
          nestedFields: {
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
      providesTags: ['Job'],
    }),

    fetchJobById: builder.query<FetchJobByIdResponse, JobIdRequest>({
      query: (jobId) => ({
        url: `/jobs/${jobId}`,
        method: 'GET',
      }),
      providesTags: ['Job'],
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
          url: '/jobs/related',
          method: 'GET',
          params: queryParams,
        };
      },
      providesTags: ['Job'],
    }),

    countAvailableJobsByCompany: builder.query<CountJobsByCompanyResponse, void>({
      query: () => ({
        url: `/jobs/companies/count`,
        method: 'GET',
      }),
      providesTags: ['Job'],
    }),

    fetchJobSubscribersByCurrentUser: builder.query<FetchJobsResponse, Omit<FetchJobsRequest, 'active'>>({
      query: (params) => {
        const { params: queryParams } = buildSpringQuery({
          params: {
            ...params,
          },
          filterFields: ['title', 'salary', 'active', 'level', 'workingType', 'enabled'],
          textSearchFields: ['title'],
          nestedArrayFields: {
            skills: 'skills.skillId',
            provinces: 'address.province',
          },
          nestedFields: {},
          defaultSort: 'createdAt,desc',
          sortableFields: ['title', 'salary', 'createdAt', 'updatedAt'],
        });

        return {
          url: '/users/me/jobs/subscribers',
          method: 'GET',
          params: queryParams,
        };
      },
      providesTags: ['Job'],
    }),

    fetchRelatedJobsByCurrentUser: builder.query<FetchJobsResponse, Omit<FetchJobsRequest, 'active'>>({
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
          },
          defaultSort: 'createdAt,desc',
          sortableFields: ['title', 'salary', 'createdAt', 'updatedAt'],
        });

        return {
          url: '/users/me/jobs/related',
          method: 'GET',
          params: queryParams,
        };
      },
      providesTags: ['Job'],
    }),
  }),
});

export const {
  useFetchJobsAvailableQuery,
  useFetchJobByIdQuery,
  useFetchRelatedJobsQuery,
  useFetchJobSubscribersByCurrentUserQuery,
  useFetchRelatedJobsByCurrentUserQuery,
  useCountAvailableJobsByCompanyQuery,
} = jobApi;


