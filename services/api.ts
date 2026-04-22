import axiosInstance from '@/services/axios';
import { BaseQueryFn, createApi } from '@reduxjs/toolkit/query/react';
import { AxiosError, AxiosRequestConfig } from 'axios';
import { IBackendRes } from '@/types/api';

const DEFAULT_BASE_QUERY_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1',
};

const axiosBaseQuery =
  ({ baseUrl }: { baseUrl: string } = DEFAULT_BASE_QUERY_CONFIG): BaseQueryFn<
    {
      url: string;
      method?: AxiosRequestConfig['method'];
      data?: AxiosRequestConfig['data'];
      params?: AxiosRequestConfig['params'];
      headers?: AxiosRequestConfig['headers'];
      responseType?: AxiosRequestConfig['responseType'];
    },
    unknown,
    unknown
  > =>
  async ({ url, method, data, params, headers, responseType }) => {
    try {
      const result = await axiosInstance({
        url: baseUrl + url,
        method,
        data,
        params,
        headers,
        responseType: responseType || 'json',
      });
      if (responseType === 'blob' && result.data instanceof Blob) {
        return { data: result.data };
      }
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
  reducerPath: 'api',
  baseQuery: axiosBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1',
  }),
  tagTypes: [
    'User',
    'Job',
    'Application',
    'Blog',
    'Recruiter',
    'Company',
    'Applicant',
    'Account',
    'Contact',
    'Skill',
    'Career',
    'Permission',
    'Role',
    'Subscriber',
    'Notifications',
    'SavedJob',
    'Comment',
    'Conversations',
    'LikedBlog',
    'SavedBlog',
    'Message',
    'PinnedMessage',
    'Review',
    'ChatRoom',
    'ChatMember',
    'Resume',
    'Reaction',
    'Ticket',
    'ResumeEvaluation',
    'Device',
    'FriendRequest',
    'Friendship',
    'AIConversation',
    'AIMessage',
    'Poll',
  ],
  endpoints: (builder) => ({
    ping: builder.query<string, void>({
      query: () => ({
        url: '/ping',
        method: 'GET',
      }),
    }),
    clearCookies: builder.query<unknown, void>({
      query: () => ({
        url: '/clear-cookies',
        method: 'GET',
      }),
    }),

    backup: builder.query({
      query: () => ({
        url: '/admin/backup',
        method: 'GET',
        responseType: 'blob',
      }),
    }),

    generateDescription: builder.mutation<string, string>({
      query: (content: string) => ({
        url: '/ai/generate/blogs/description',
        method: 'POST',
        data: { content },
      }),
    }),

    generateTags: builder.mutation<IBackendRes<string[]>, string>({
      query: (content: string) => ({
        url: '/ai/generate/blogs/tags',
        method: 'POST',
        data: { content },
      }),
    }),

    getUuid: builder.query<string, void>({
      query: () => ({
        url: '/uuid',
        method: 'GET',
      }),
    }),
  }),
});

export const {
  usePingQuery,
  useClearCookiesQuery,
  useLazyBackupQuery,
  useGenerateDescriptionMutation,
  useGenerateTagsMutation,
  useGetUuidQuery,
} = api;
