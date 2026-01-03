import { api } from '../api';
import { buildSpringQuery } from '../../utils/buildSpringQuery';
import type { FetchJobsRequest, FetchJobsResponse, JobIdRequest, FetchJobByIdResponse } from './jobType';

export const jobApi = api.injectEndpoints({
  endpoints: (builder) => ({
    fetchJobsAvailable: builder.query<FetchJobsResponse, Omit<FetchJobsRequest, 'active'>>({
      query: (params) => {
        const { params: queryParams } = buildSpringQuery({
          params: {
            ...params,
            active: true,
            enabled: true,
          },
          filterFields: ['title', 'location', 'salary', 'active', 'level', 'workingType', 'enabled'],
          textSearchFields: ['title', 'location'],
          nestedArrayFields: {
            skills: 'skills.skillId',
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
      providesTags: ['Job'],
    }),

    fetchJobById: builder.query<FetchJobByIdResponse, JobIdRequest>({
      query: (jobId) => ({
        url: `/jobs/${jobId}`,
        method: 'GET',
      }),
      providesTags: ['Job'],
    }),
  }),
});

export const { useFetchJobsAvailableQuery, useFetchJobByIdQuery } = jobApi;


