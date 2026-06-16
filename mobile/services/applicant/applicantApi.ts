import { setUser } from "@/lib/authSlice";
import { api } from "@/services/api";
import dayjs from "dayjs";
import {
  ApplicantMutationResponse,
  CreateApplicantRequest,
  FetchApplicantByIdResponse,
  FetchApplicantsResponse,
} from "./applicantType";

export const applicantApi = api.injectEndpoints({
  endpoints: (builder) => ({
    createApplicant: builder.mutation<
      ApplicantMutationResponse,
      CreateApplicantRequest
    >({
      query: (data) => ({
        url: "/applicants",
        method: "POST",
        data: {
          ...data,
          dob: data.dob ? dayjs(data.dob).format("YYYY-MM-DD") : undefined,
          type: "applicant",
        },
      }),
      invalidatesTags: ["Applicant"],
    }),

    updateApplicant: builder.mutation({
      query: (formData: FormData) => ({
        url: `/applicants`,
        method: "PUT",
        data: formData,
      }),
      invalidatesTags: ["Applicant", "Account", "User"],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          // Dispatch action to save user data to slice
          dispatch(setUser({ user: data?.data }));
        } catch (error) {
          console.error("Failed to fetch account:", error);
        }
      },
    }),

    deleteApplicant: builder.mutation<ApplicantMutationResponse, number>({
      query: (applicantId) => ({
        url: `/applicants/${applicantId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Applicant"],
    }),

    fetchApplicant: builder.query<FetchApplicantsResponse, void>({
      query: () => ({ url: `/applicants`, method: "GET" }),
      providesTags: ["Applicant"],
    }),

    fetchApplicantById: builder.query<FetchApplicantByIdResponse, number>({
      query: (applicantId) => ({
        url: `/applicants/${applicantId}`,
        method: "GET",
      }),
      providesTags: ["Applicant"],
    }),

    fetchCurrentApplicant: builder.query<FetchApplicantByIdResponse, void>({
      query: () => ({
        url: `/applicants/me`,
        method: "GET",
      }),
      providesTags: ["Applicant"],
    }),

    toggleAvailableStatus: builder.mutation<ApplicantMutationResponse, void>({
      query: () => ({
        url: `/applicants/availableStatus`,
        method: "PUT",
      }),
      invalidatesTags: ["Applicant", "Account", "User"],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          // Dispatch action to save user data to slice
          dispatch(setUser({ user: data?.data }));
        } catch (error) {
          console.error("Failed to fetch account:", error);
        }
      },
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
