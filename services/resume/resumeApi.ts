import { api } from '../api';
import {
  CreateResumeRequest,
  CreateResumeResponse,
  FetchResumesByUserRequest,
  FetchResumesByUserResponse,
  UpdateResumeTitleRequest,
  UpdateResumeTitleResponse,
  DeleteResumeRequest,
} from './resumeType';

export const resumeApi = api.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    createResume: builder.mutation<CreateResumeResponse, CreateResumeRequest>({
      query: (formData: FormData) => ({
        url: '/resumes',
        method: 'POST',
        data: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }),
      invalidatesTags: ['Resume'],
    }),

    fetchResumesByCurrentUser: builder.query<FetchResumesByUserResponse, FetchResumesByUserRequest>({
      query: (params) => ({
        url: '/resumes/by-current-user',
        method: 'GET',
        params,
      }),
      providesTags: ['Resume'],
    }),

    updateResumeTitle: builder.mutation<UpdateResumeTitleResponse, UpdateResumeTitleRequest>({
      query: ({ resumeId, title }) => ({
        url: `/resumes/${resumeId}/title`,
        method: 'PUT',
        data: { title },
      }),
      invalidatesTags: ['Resume'],
    }),

    deleteResume: builder.mutation<void, DeleteResumeRequest>({
      query: ({ resumeId }) => ({
        url: `/resumes/${resumeId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Resume'],
    }),
  }),
});

export const {
  useCreateResumeMutation,
  useFetchResumesByCurrentUserQuery,
  useUpdateResumeTitleMutation,
  useDeleteResumeMutation,
} = resumeApi;
