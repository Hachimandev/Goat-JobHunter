import { api } from '@/services/api';
import { buildSpringQuery } from '@/utils/buildSpringQuery';
import {
  CheckCompaniesFollowedResponse,
  CheckRecruitersFollowedResponse,
  CheckReviewedCompaniesResponse,
  CompanyIdsRequest,
  CreateUserRequest,
  FetchUserResponse,
  FetchUsersRequest,
  FetchUsersResponse,
  FollowCompaniesResponse,
  FollowRecruitersResponse,
  GetFollowedCompaniesResponse,
  GetFollowedRecruitersResponse,
  RecruiterIdsRequest,
  ResetPasswordRequest,
  ResetPasswordResponse,
  UpdateMyVisibilityMutationResponse,
  UpdateMyVisibilityRequest,
  UpdatePasswordRequest,
  UpdatePasswordResponse,
  UserMutationResponse,
} from './userType';
import { FetchJobsRequest, FetchJobsResponse } from '../job/jobType';
import { FetchResumesRequest, FetchResumesResponse } from '../resume/resumeType';
import { mergeUserProfileIfNewer } from '@/lib/features/authSlice';
import { AuthUser } from '@/lib/features/authSyncTypes';
import { FetchDevicesRequest, FetchDevicesResponse } from '../device/deviceType';

export const userApi = api.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    fetchUsers: builder.query<FetchUsersResponse, FetchUsersRequest>({
      query: (params) => {
        const { params: queryParams } = buildSpringQuery({
          params,
          filterFields: ['email', 'phone', 'role', 'enabled'],
          textSearchFields: ['email', 'phone'],
          defaultSort: 'createdAt,desc',
          sortableFields: ['createdAt', 'updatedAt'],
        });

        return {
          url: '/users',
          method: 'GET',
          params: queryParams,
        };
      },
      providesTags: ['User'],
    }),

    searchUsers: builder.query<FetchUsersResponse, string>({
      query: (params) => {
        return {
          url: '/users/search',
          method: 'GET',
          params: { keyword: params },
        };
      },
      providesTags: ['User'],
    }),

    fetchUserById: builder.query<FetchUserResponse, string>({
      query: (userId: string) => ({
        url: `/users/${userId}`,
        method: 'GET',
      }),
      providesTags: (result, error, userId) => [
        { type: 'User', id: userId },
        { type: 'Recruiter', id: userId },
        { type: 'Applicant', id: userId },
      ],
    }),

    createUser: builder.mutation<UserMutationResponse, CreateUserRequest>({
      query: (data) => ({
        url: '/users',
        method: 'POST',
        data,
      }),
      invalidatesTags: ['User'],
    }),

    updatePassword: builder.mutation<UpdatePasswordResponse, UpdatePasswordRequest>({
      query: (data) => ({
        url: '/users/update-password',
        method: 'PUT',
        data,
      }),
    }),

    resetPassword: builder.mutation<ResetPasswordResponse, ResetPasswordRequest>({
      query: (data) => ({
        url: '/users/reset-password',
        method: 'PUT',
        data,
      }),
    }),

    // Follow Recruiters APIs
    getFollowedRecruiters: builder.query<GetFollowedRecruitersResponse, void>({
      query: () => ({
        url: '/users/me/followed-recruiters',
        method: 'GET',
      }),
      providesTags: ['User'],
    }),

    checkRecruitersFollowed: builder.query<CheckRecruitersFollowedResponse, RecruiterIdsRequest>({
      query: ({ recruiterIds }) => ({
        url: '/users/me/followed-recruiters/contains',
        params: { recruiterIds },
      }),
      providesTags: ['User'],
    }),

    followRecruiters: builder.mutation<FollowRecruitersResponse, RecruiterIdsRequest>({
      query: (data) => ({
        url: '/users/me/followed-recruiters',
        method: 'PUT',
        data,
      }),
      invalidatesTags: ['User'],
    }),

    unfollowRecruiters: builder.mutation<FollowRecruitersResponse, RecruiterIdsRequest>({
      query: (data) => ({
        url: '/users/me/followed-recruiters',
        method: 'DELETE',
        data,
      }),
      invalidatesTags: ['User'],
    }),

    // Follow Company APIs
    getFollowedCompanies: builder.query<GetFollowedCompaniesResponse, void>({
      query: () => ({
        url: '/users/me/followed-companies',
        method: 'GET',
      }),
      providesTags: ['User', 'Company'],
    }),

    checkCompaniesFollowed: builder.query<CheckCompaniesFollowedResponse, CompanyIdsRequest>({
      query: ({ companyIds }) => ({
        url: '/users/me/followed-companies/contains',
        params: { companyIds },
      }),
      providesTags: ['User'],
    }),

    followCompanies: builder.mutation<FollowCompaniesResponse, CompanyIdsRequest>({
      query: (data) => ({
        url: '/users/me/followed-companies',
        method: 'PUT',
        data,
      }),
      invalidatesTags: ['User'],
    }),

    unfollowCompanies: builder.mutation<FollowCompaniesResponse, CompanyIdsRequest>({
      query: (data) => ({
        url: '/users/me/followed-companies',
        method: 'DELETE',
        data,
      }),
      invalidatesTags: ['User'],
    }),

    checkReviewedCompanies: builder.query<CheckReviewedCompaniesResponse, CompanyIdsRequest>({
      query: ({ companyIds }) => ({
        url: '/users/me/reviewed-companies/contains',
        params: { companyIds },
      }),
      providesTags: ['User'],
    }),

    updateMyVisibility: builder.mutation<UpdateMyVisibilityMutationResponse, UpdateMyVisibilityRequest>({
      query: (data) => ({
        url: '/users/me/visibility',
        method: 'PUT',
        data,
      }),
      invalidatesTags: ['User', 'Recruiter', 'Applicant', 'Company', 'Account'],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          const visibilityPayload = data?.data;

          if (visibilityPayload?.accountId) {
            dispatch(
              mergeUserProfileIfNewer({
                userId: visibilityPayload.accountId,
                profile: visibilityPayload as Partial<AuthUser>,
                emittedAt: new Date().toISOString(),
              }),
            );
          }
        } catch (error) {
          console.error('Failed to update account visibility:', error);
        }
      },
    }),

    // Current jobs
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
          },
          nestedFields: {
            provinces: 'address.province',
          },
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

    // Resume APIs
    fetchResumesByCurrentUser: builder.query<FetchResumesResponse, FetchResumesRequest>({
      query: (params) => {
        const { params: queryParams } = buildSpringQuery({
          params: {
            ...params,
          },
          filterFields: [],
          defaultSort: 'isDefault,updatedAt,desc',
        });

        return {
          url: '/users/me/resumes',
          method: 'GET',
          params: queryParams,
        };
      },
      providesTags: ['Resume'],
    }),

    fetchDevicesByCurrentUser: builder.query<FetchDevicesResponse, FetchDevicesRequest>({
      query: (params) => {
        const { params: queryParams } = buildSpringQuery({
          params: {
            ...params,
          },
          filterFields: [],
          defaultSort: 'updatedAt,desc',
        });

        return {
          url: '/users/me/devices',
          method: 'GET',
          params: queryParams,
        };
      },
      providesTags: ['Device'],
    }),
  }),
});

export const {
  useLazySearchUsersQuery,
  useFetchUsersQuery,
  useLazyFetchUsersQuery,
  useFetchUserByIdQuery,
  useLazyFetchUserByIdQuery,

  useCreateUserMutation,
  useUpdatePasswordMutation,
  useResetPasswordMutation,

  useGetFollowedRecruitersQuery,
  useCheckRecruitersFollowedQuery,
  useFollowRecruitersMutation,
  useUnfollowRecruitersMutation,

  useGetFollowedCompaniesQuery,
  useCheckCompaniesFollowedQuery,
  useFollowCompaniesMutation,
  useUnfollowCompaniesMutation,

  useCheckReviewedCompaniesQuery,

  useUpdateMyVisibilityMutation,

  useFetchJobSubscribersByCurrentUserQuery,
  useFetchRelatedJobsByCurrentUserQuery,

  useFetchResumesByCurrentUserQuery,

  useFetchDevicesByCurrentUserQuery,
} = userApi;
