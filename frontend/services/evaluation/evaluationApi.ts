import { api } from '@/services/api';
import { EvaluateResumeResponse, FetchEvaluateResumeResponse, FetchEvaluationRequest } from './evaluationType';
import { buildSpringQuery } from '@/utils/buildSpringQuery';

export const evaluationApi = api.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    evaluateResume: builder.mutation<EvaluateResumeResponse, string>({
      query: (resumeUrl) => ({
        url: `/evaluations/resume`,
        method: 'POST',
        params: { resumeUrl },
      }),
      invalidatesTags: ['ResumeEvaluation'],
    }),

    fetchEvaluationResumes: builder.query<FetchEvaluateResumeResponse, FetchEvaluationRequest>({
      query: ({ resumeId, ...params }) => {
        const { params: queryParams } = buildSpringQuery({
          params,
          filterFields: [],
          textSearchFields: [],
          defaultSort: 'createdAt,desc',
        });

        return {
          url: `/evaluations/resumes/${resumeId}`,
          method: 'GET',
          params: queryParams,
        };
      },
      providesTags: ['ResumeEvaluation'],
    }),
  }),
});

export const { useEvaluateResumeMutation, useFetchEvaluationResumesQuery } = evaluationApi;
