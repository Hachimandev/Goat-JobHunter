import axiosInstance from './axios';
import { BaseQueryFn, createApi } from '@reduxjs/toolkit/query/react';
import { AxiosError, AxiosRequestConfig } from 'axios';

const axiosBaseQuery =
  (
    { baseUrl }: { baseUrl: string } = {
      baseUrl: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api/v1',
    }
  ): BaseQueryFn<
    {
      url: string;
      method?: AxiosRequestConfig['method'];
      data?: AxiosRequestConfig['data'];
      params?: AxiosRequestConfig['params'];
      headers?: AxiosRequestConfig['headers'];
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
  reducerPath: 'api',
  baseQuery: axiosBaseQuery({
    baseUrl: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api/v1',
  }),
  tagTypes: ['Job', 'User', 'Auth', 'Company', 'Review'],
  endpoints: () => ({}),
});


