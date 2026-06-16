import { BaseQueryFn, createApi } from "@reduxjs/toolkit/query/react";
import { AxiosError, AxiosRequestConfig } from "axios";
import axiosInstance from "./axios";
import { API_BASE_URL } from "./network";

const isFormDataPayload = (value: unknown): value is FormData => {
  return (
    typeof FormData !== "undefined" &&
    value instanceof FormData
  ) || Array.isArray((value as any)?._parts);
};

const buildUrlWithParams = (
  baseUrl: string,
  url: string,
  params?: AxiosRequestConfig["params"],
) => {
  const fullUrl = `${baseUrl}${url}`;
  if (!params) return fullUrl;

  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) return;

    if (Array.isArray(value)) {
      value.forEach((item) => searchParams.append(key, String(item)));
      return;
    }

    searchParams.append(key, String(value));
  });

  const queryString = searchParams.toString();
  if (!queryString) return fullUrl;

  return `${fullUrl}${fullUrl.includes("?") ? "&" : "?"}${queryString}`;
};

const parseFetchResponse = async (response: Response) => {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

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
      if (isFormDataPayload(data)) {
        const multipartHeaders = new Headers();
        Object.entries(headers ?? {}).forEach(([key, value]) => {
          if (key.toLowerCase() === "content-type" || value == null) return;
          multipartHeaders.append(key, String(value));
        });

        const response = await fetch(buildUrlWithParams(baseUrl, url, params), {
          method: method ?? "GET",
          body: data as any,
          headers: multipartHeaders,
          credentials: "include",
        });
        const responseData = await parseFetchResponse(response);

        if (!response.ok) {
          return {
            error: {
              status: response.status,
              data: responseData,
            },
          };
        }

        return { data: responseData };
      }

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
    "Reminder",
  ],
  endpoints: () => ({}),
});
