import { api } from '@/services/api';
import dayjs from 'dayjs';
import {
  ApplicantMutationResponse,
  CreateApplicantRequest,
  FetchApplicantByIdResponse,
  FetchApplicantsResponse,
} from './applicantType';
import { createUserSyncOnQueryStarted } from '@/services/utils/userSyncOnQueryStarted';

export const applicantApi = api.injectEndpoints({
  endpoints: (builder) => ({
    createApplicant: builder.mutation<ApplicantMutationResponse, CreateApplicantRequest>({
      query: (data) => ({
        url: '/applicants',
        method: 'POST',
        data: {
          ...data,
          dob: data.dob ? dayjs(data.dob).format('YYYY-MM-DD') : undefined,
          type: 'applicant',
        },
      }),
      invalidatesTags: ['Applicant'],
    }),

    updateApplicant: builder.mutation({
      query: (formData: FormData) => ({
        url: `/applicants`,
        method: 'PUT',
        data: formData,
      }),
      invalidatesTags: ['Applicant', 'Account', 'User'],
      onQueryStarted: createUserSyncOnQueryStarted({ operation: 'update applicant profile' }),
    }),

    deleteApplicant: builder.mutation<ApplicantMutationResponse, number>({
      query: (applicantId) => ({
        url: `/applicants/${applicantId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Applicant'],
    }),

    fetchApplicant: builder.query<FetchApplicantsResponse, void>({
      query: () => ({ url: `/applicants`, method: 'GET' }),
      providesTags: ['Applicant'],
    }),

    fetchApplicantById: builder.query<FetchApplicantByIdResponse, number>({
      query: (applicantId) => ({
        url: `/applicants/${applicantId}`,
        method: 'GET',
      }),
      providesTags: ['Applicant'],
    }),

    fetchCurrentApplicant: builder.query<FetchApplicantByIdResponse, void>({
      query: () => ({
        url: `/applicants/me`,
        method: 'GET',
      }),
      providesTags: ['Applicant'],
    }),

    toggleAvailableStatus: builder.mutation<ApplicantMutationResponse, void>({
      query: () => ({
        url: `/applicants/availableStatus`,
        method: 'PUT',
      }),
      invalidatesTags: ['Applicant', 'Account', 'User'],
      onQueryStarted: createUserSyncOnQueryStarted({ operation: 'toggle applicant available status' }),
    }),
  }),
});

export const {
  useCreateApplicantMutation,
  useUpdateApplicantMutation,
  useDeleteApplicantMutation,
  useFetchApplicantQuery,
  useFetchApplicantByIdQuery,
  useFetchCurrentApplicantQuery,
  useToggleAvailableStatusMutation,
} = applicantApi;
