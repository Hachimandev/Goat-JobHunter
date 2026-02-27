import { api } from '@/services/api';
import { EvaluateResumeResponse } from './evaluationType';

export const evaluationApi = api.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    evaluateResume: builder.mutation<EvaluateResumeResponse, string>({
      query: (resumeUrl) => ({
        url: `/evaluations/resume`,
        method: 'POST',
        params: { resumeUrl }
      }),
      invalidatesTags: ['ResumeEvaluation'],
    }),
  }),
});

export const { useEvaluateResumeMutation } = evaluationApi;
