import { api } from "../api";
import {
  CheckCompaniesFollowedResponse,
  CheckReviewedCompaniesResponse,
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
  useUpdatePasswordMutation,
  useResetPasswordMutation,
  useCheckCompaniesFollowedQuery,
  useFollowCompaniesMutation,
  useUnfollowCompaniesMutation,
  useCheckReviewedCompaniesQuery,
} = userApi;
