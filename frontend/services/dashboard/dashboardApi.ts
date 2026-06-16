import { api } from "@/services/api";
import {
  ApplicationsByStatusResponse,
  DateRangeRequest,
  StatisticsApplicationByYearRequest,
  StatisticsApplicationByYearResponse,
  StatisticsApplicationResponse,
  StatisticsJobResponse,
  StatisticsUserResponse,
  TopBlogsResponse,
  TotalStatisticsResponse, YearMonthRequest, YearRequest
} from "./dashboardType";

export const dashboardApi = api.injectEndpoints({
  endpoints: (builder) => ({
    statisticsUser: builder.query<StatisticsUserResponse, void>({
      query: () => ({
        url: "/dashboard/users",
        method: "GET"
      })
    }),

    statisticsJob: builder.query<StatisticsJobResponse, DateRangeRequest>({
      query: (params) => ({
        url: "/dashboard/jobs",
        method: "GET",
        params
      })
    }),

    statisticsApplication: builder.query<
      StatisticsApplicationResponse,
      DateRangeRequest
    >({
      query: (params) => ({
        url: "/dashboard/applications",
        method: "GET",
        params
      })
    }),

    statisticsApplicationByYear: builder.query<
      StatisticsApplicationByYearResponse,
      StatisticsApplicationByYearRequest
    >({
      query: ({ year, ...params }) => ({
        url: "/dashboard/applications-year",
        method: "GET",
        params: { year, ...params }
      })
    }),

    getTotalStatistics: builder.query<TotalStatisticsResponse, void>({
      query: () => ({
        url: "/dashboard/total",
        method: "GET"
      })
    }),

    getApplicationsByYear: builder.query<
      ApplicationsByStatusResponse,
      YearRequest
    >({
      query: ({ year }) => ({
        url: "/dashboard/applications/year",
        method: "GET",
        params: { year }
      })
    }),

    getTop10Blogs: builder.query<TopBlogsResponse, YearMonthRequest>({
      query: ({ year, month }) => ({
        url: "/dashboard/blogs/top10",
        method: "GET",
        params: { year, month }
      })
    })
  })
});

export const {
  useStatisticsUserQuery,
  useStatisticsJobQuery,
  useStatisticsApplicationQuery,
  useStatisticsApplicationByYearQuery,
  useGetTotalStatisticsQuery,
  useGetTop10BlogsQuery,
  useGetApplicationsByYearQuery
} = dashboardApi;