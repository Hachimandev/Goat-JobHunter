import { api } from '@/services/api';
import { ResumeMutationResponse, ResumeStatusResponse, UpdateResumeRequest } from './resumeType';

export const resumeApi = api.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    createResume: builder.mutation({
      query: (formData: FormData) => ({
        url: '/resumes',
        method: 'POST',
        data: formData,
      }),
      invalidatesTags: ['Resume'],
    }),

    deleteResume: builder.mutation<void, { resumeId: string }>({
      query: (params) => ({
        url: `/resumes`,
        method: 'DELETE',
        params: params,
      }),
      invalidatesTags: ['Resume'],
    }),

    defaultResume: builder.mutation<ResumeStatusResponse, { resumeId: string }>({
      query: (params) => ({
        url: `/resumes/default`,
        method: 'PUT',
        params: params,
      }),
      invalidatesTags: ['Resume'],
    }),

    unDefaultResume: builder.mutation<ResumeStatusResponse, { resumeId: string }>({
      query: (params) => ({
        url: `/resumes/default`,
        method: 'DELETE',
        params: params,
      }),
      invalidatesTags: ['Resume'],
    }),

    publicResume: builder.mutation<ResumeStatusResponse, { resumeId: string }>({
      query: (params) => ({
        url: `/resumes/public`,
        method: 'PUT',
        params: params,
      }),
      invalidatesTags: ['Resume'],
    }),

    privateResume: builder.mutation<ResumeStatusResponse, { resumeId: string }>({
      query: (params) => ({
        url: `/resumes/public`,
        method: 'DELETE',
        params: params,
      }),
      invalidatesTags: ['Resume'],
    }),

    updateTitle: builder.mutation<ResumeMutationResponse, UpdateResumeRequest>({
      query: (data) => ({
        url: '/resumes/title',
        method: 'PUT',
        data,
      }),
      invalidatesTags: ['Resume'],
    }),

    downloadResume: builder.mutation<Blob, string>({
      query: (resumeId) => ({
        url: `/resumes/${resumeId}/file`,
        method: 'GET',
        responseType: 'blob',
      }),
      transformResponse: (response: Blob) => response,
    }),
  }),
});

export const {
  useCreateResumeMutation,
  useDeleteResumeMutation,
  useDefaultResumeMutation,
  useUnDefaultResumeMutation,
  usePublicResumeMutation,
  usePrivateResumeMutation,
  useUpdateTitleMutation,
  useDownloadResumeMutation,
} = resumeApi;
