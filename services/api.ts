import { BaseQueryFn, createApi } from "@reduxjs/toolkit/query/react";
import { AxiosError, AxiosRequestConfig } from "axios";
import axiosInstance from "./axios";
import { API_BASE_URL } from "./network";

const axiosBaseQuery =
  (
    { baseUrl }: { baseUrl: string } = {
      baseUrl: API_BASE_URL,
    },
  ): BaseQueryFn<
    {
      url: string;
      method?: AxiosRequestConfig["method"];
      data?: AxiosRequestConfig["data"];
      params?: AxiosRequestConfig["params"];
      headers?: AxiosRequestConfig["headers"];
    },
    unknown,
    unknown
  > =>
  async ({ url, method, data, params, headers }) => {
    try {
      const result = await axiosInstance({
        url: baseUrl + url,
        method,
        data,
        params,
        headers,
      });
      return { data: result.data };
    } catch (axiosError) {
      const err = axiosError as AxiosError;
      return {
        error: {
          status: err.response?.status,
          data: err.response?.data || err.message,
        },
      };
    }
  };

export const api = createApi({
  reducerPath: "api",
  baseQuery: axiosBaseQuery({
    baseUrl: API_BASE_URL,
  }),
  tagTypes: [
    "Job",
    "User",
    "Auth",
    "Company",
    "Review",
    "Blog",
    "Comment",
    "SavedJob",
    "Application",
    "Resume",
    "Skill",
    "Applicant",
    "Account",
    "Recruiter",
    "ChatRoom",
    "PinnedMessage",
    "ChatInvite",
    "Tag",
    "Friendship",
    "FriendRequest",
  ],
  endpoints: () => ({}),
});
