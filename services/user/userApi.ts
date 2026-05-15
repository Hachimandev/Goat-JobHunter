import { api } from "../api";
import {
  CheckCompaniesFollowedResponse,
  CheckReviewedCompaniesResponse,
  FetchUsersResponse,
  FetchUserResponse,
  FollowCompaniesRequest,
  ResetPasswordRequest,
  ResetPasswordResponse,
  ReviewedCompanyIdsRequest,
  UpdatePasswordRequest,
  UpdatePasswordResponse,
} from "./userType";

export const userApi = api
  .enhanceEndpoints({
    addTagTypes: ["SavedBlog", "User"],
  })
  .injectEndpoints({
    endpoints: (builder) => ({
      updatePassword: builder.mutation<
        UpdatePasswordResponse,
        UpdatePasswordRequest
      >({
        query: (data) => ({
          url: "/users/update-password",
          method: "PUT",
          data,
        }),
      }),

      resetPassword: builder.mutation<
        ResetPasswordResponse,
        ResetPasswordRequest
      >({
        query: (data) => ({
          url: "/users/reset-password",
          method: "PUT",
          data,
        }),
      }),

      searchUsers: builder.query<FetchUsersResponse, string>({
        query: (params) => {
          return {
            url: "/users/search",
            method: "GET",
            params: { keyword: params },
          };
        },
        providesTags: ["User"],
      }),

      fetchUserById: builder.query<FetchUserResponse, number | string>({
        query: (userId) => ({
          url: `/users/${userId}`,
          method: "GET",
        }),
        providesTags: (_result, _error, userId) => [
          { type: "User", id: userId },
          { type: "Applicant", id: userId },
          { type: "Recruiter", id: userId },
        ],
      }),

      // Follow Company APIs
      checkCompaniesFollowed: builder.query<
        CheckCompaniesFollowedResponse,
        FollowCompaniesRequest
      >({
        query: ({ companyIds }) => ({
          url: "/users/me/followed-companies/contains",
          params: { companyIds },
        }),
        providesTags: ["User"],
      }),

      followCompanies: builder.mutation<void, FollowCompaniesRequest>({
        query: (data) => ({
          url: "/users/me/followed-companies",
          method: "PUT",
          data,
        }),
        invalidatesTags: ["User"],
      }),

      unfollowCompanies: builder.mutation<void, FollowCompaniesRequest>({
        query: (data) => ({
          url: "/users/me/followed-companies",
          method: "DELETE",
          data,
        }),
        invalidatesTags: ["User"],
      }),

      checkReviewedCompanies: builder.query<
        CheckReviewedCompaniesResponse,
        ReviewedCompanyIdsRequest
      >({
        query: ({ companyIds }) => ({
          url: "/users/me/reviewed-companies/contains",
          params: { companyIds },
        }),
        providesTags: ["User"],
      }),
    }),
  });

export const {
  useLazySearchUsersQuery,
  useFetchUserByIdQuery,
  useUpdatePasswordMutation,
  useResetPasswordMutation,
  useCheckCompaniesFollowedQuery,
  useFollowCompaniesMutation,
  useUnfollowCompaniesMutation,
  useCheckReviewedCompaniesQuery,
} = userApi;
