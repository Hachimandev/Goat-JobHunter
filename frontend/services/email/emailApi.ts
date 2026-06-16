import { api } from "@/services/api";

export const emailApi = api.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    sendInvitationEmail: builder.mutation<void,
      {
        applicantIds: number[],
        jobId: number
      }
    >({
      query: (data) => ({
        url: "/email/jobs",
        method: "POST",
        data
      })
    })
  })
});

export const {
  useSendInvitationEmailMutation
} = emailApi;