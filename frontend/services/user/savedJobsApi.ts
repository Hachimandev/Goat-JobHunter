import { userApi } from "@/services/user/userApi";
import {
  CheckSavedJobsResponse,
  GetSavedJobsResponse,
  JobIdsRequest,
  SaveJobsResponse
} from "@/services/user/userType";

export const savedJobsApi = userApi.injectEndpoints({
  endpoints: (builder) => ({
    getSavedJobs: builder.query<GetSavedJobsResponse, void>({
      query: () => ({
        url: "/users/me/saved-jobs",
        method: "GET"
      }),
      providesTags: (result) =>
        result?.data
          ? [
            ...result.data.result.map((job) => ({
              type: "SavedJob" as const,
              id: job.jobId
            })),
            { type: "SavedJob", id: "LIST" }
          ]
          : [{ type: "SavedJob", id: "LIST" }]
    }),

    checkSavedJobs: builder.query<CheckSavedJobsResponse, JobIdsRequest>({
      query: (params) => ({
        url: "/users/me/saved-jobs/contains",
        method: "GET",
        params: { jobIds: params.jobIds }
      }),
      providesTags: (_, __, arg) =>
        arg.jobIds
          ? arg.jobIds.map((jobId) => ({
            type: "SavedJob" as const,
            id: jobId
          }))
          : []
    }),

    saveJobs: builder.mutation<SaveJobsResponse, JobIdsRequest>({
      query: (data) => ({
        url: "/users/me/saved-jobs",
        method: "PUT",
        data
      }),
      invalidatesTags: (_, __, arg) => [
        { type: "SavedJob", id: "LIST" },
        ...arg.jobIds.map((jobId) => ({
          type: "SavedJob" as const,
          id: jobId
        }))
      ]
    }),

    unsaveJobs: builder.mutation<SaveJobsResponse, JobIdsRequest>({
      query: (data) => ({
        url: "/users/me/saved-jobs",
        method: "DELETE",
        data
      }),
      invalidatesTags: (_, __, arg) => [
        { type: "SavedJob", id: "LIST" },
        ...arg.jobIds.map((jobId) => ({
          type: "SavedJob" as const,
          id: jobId
        }))
      ]
    })
  })
});

export const { useGetSavedJobsQuery, useCheckSavedJobsQuery, useSaveJobsMutation, useUnsaveJobsMutation } =
  savedJobsApi;
