import { api } from '@/services/api';
import { buildSpringQuery } from '@/utils/buildSpringQuery';
import {
  CreateRecruiterRequest,
  FetchCurrentRecruiterResponse,
  FetchRecruiterByIdResponse,
  FetchRecruitersRequest,
  FetchRecruitersResponse,
  RecruiterMutationResponse,
} from './recruiterType';
import { setUser } from '@/lib/features/authSlice';

export const recruiterApi = api.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    createRecruiter: builder.mutation<RecruiterMutationResponse, CreateRecruiterRequest>({
      query: (data) => ({
        url: '/recruiters',
        method: 'POST',
        data: { ...data, type: 'recruiter' },
      }),
      invalidatesTags: ['Recruiter'],
    }),

    updateRecruiter: builder.mutation({
      query: (formData: FormData) => ({
        url: `/recruiters`,
        method: 'PUT',
        data: formData,
      }),
      invalidatesTags: ['Recruiter', 'Account', 'User'],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          // Dispatch action to save user data to slice
          dispatch(setUser({ user: data?.data }));
        } catch (error) {
          console.error('Failed to fetch account:', error);
        }
      },
    }),

    deleteRecruiter: builder.mutation<RecruiterMutationResponse, number>({
      query: (recruiterId) => ({
        url: `/recruiters/${recruiterId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Recruiter'],
    }),

    fetchRecruiters: builder.query<FetchRecruitersResponse, FetchRecruitersRequest>({
      query: (params) => {
        const { params: queryParams } = buildSpringQuery({
          params,
          filterFields: ['fullName', 'address', 'enabled'],
          textSearchFields: ['fullName', 'address'],
          defaultSort: 'createdAt,desc',
          sortableFields: ['fullName', 'createdAt', 'updatedAt'],
        });

        return {
          url: '/recruiters',
          method: 'GET',
          params: queryParams,
        };
      },
      providesTags: ['Recruiter'],
    }),

    fetchAvailableRecruiters: builder.query<FetchRecruitersResponse, Omit<FetchRecruitersRequest, 'enabled'>>({
      query: (params) => {
        const { params: queryParams } = buildSpringQuery({
          params: {
            ...params,
            enabled: true,
          },
          filterFields: ['fullName', 'address', 'enabled'],
          textSearchFields: ['fullName', 'address'],
          defaultSort: 'createdAt,desc',
          sortableFields: ['fullName', 'createdAt', 'updatedAt'],
        });

        return {
          url: '/recruiters',
          method: 'GET',
          params: queryParams,
        };
      },
      providesTags: ['Recruiter'],
    }),

    fetchRecruiterById: builder.query<FetchRecruiterByIdResponse, number>({
      query: (recruiterId) => ({
        url: `/recruiters/${recruiterId}`,
        method: 'GET',
      }),
      providesTags: ['Recruiter'],
    }),

    fetchCurrentRecruiter: builder.query<FetchCurrentRecruiterResponse, void>({
      query: () => ({
        url: `/recruiters/me`,
        method: 'GET',
      }),
      providesTags: ['Recruiter'],
    }),
  }),
});

export const {
  useCreateRecruiterMutation,
  useUpdateRecruiterMutation,
  useDeleteRecruiterMutation,
  useFetchRecruitersQuery,
  useFetchAvailableRecruitersQuery,
  useFetchRecruiterByIdQuery,
  useFetchCurrentRecruiterQuery,
} = recruiterApi;
