import { api } from "../api";
import {
  AverageRatingsByCompanyResponse,
  CalculateRecommendedPercentageByCompanyResponse,
  CountAllReviewsResponse,
  CountReviewsByCompanyResponse,
  CreateReviewRequest,
  CreateReviewResponse,
  LatestReviewsResponse,
  RatingSummaryByCompanyResponse,
  ReviewsByCompanyRequest,
  ReviewsByCompanyResponse
} from "./reviewType";
import { buildSpringQuery } from "@/utils/buildSpringQuery";

export const reviewApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getAllReviewsByCompany: builder.query<ReviewsByCompanyResponse, ReviewsByCompanyRequest>({
      query: (params) => {
        const { params: queryParams } = buildSpringQuery({
          params,
          filterFields: ["name", "verified"],
          textSearchFields: ["name"],
          defaultSort: "createdAt,desc",
          sortableFields: ["name", "createdAt", "updatedAt"]
        });

        return {
          url: `/reviews/companies/${params.companyName}`,
          method: "GET",
          params: queryParams
        };
      },
      providesTags: ["Review"]
    }),

    latestReviews: builder.query<LatestReviewsResponse, void>({
      query: () => ({
        url: `/reviews/latest`,
        method: "GET"
      }),
      providesTags: ["Review"]
    }),

    countReviewsByCompany: builder.query<CountReviewsByCompanyResponse, void>({
      query: () => ({
        url: `/reviews/companies/count`,
        method: "GET"
      }),
      providesTags: ["Review"]
    }),

    averageRatingsByCompany: builder.query<AverageRatingsByCompanyResponse, void>({
      query: () => ({
        url: `/reviews/companies/ratings/average`,
        method: "GET"
      }),
      providesTags: ["Review"]
    }),

    countAllReviews: builder.query<CountAllReviewsResponse, void>({
      query: () => ({
        url: `/reviews/count`,
        method: "GET"
      }),
      providesTags: ["Review"]
    }),

    getRatingByCompany: builder.query<RatingSummaryByCompanyResponse, number>({
      query: (companyId) => ({
        url: `/reviews/companies/${companyId}/ratings/summary`,
        method: "GET"
      }),
      providesTags: ["Review"]
    }),

    calculateRecommendedPercentageByCompany: builder.query<
      CalculateRecommendedPercentageByCompanyResponse,
      number
    >({
      query: (companyId) => ({
        url: `/reviews/companies/${companyId}/recommendation-rate`,
        method: "GET"
      }),
      providesTags: ["Review"]
    }),

    createReview: builder.mutation<CreateReviewResponse, CreateReviewRequest>({
      query: (body) => ({
        url: `/reviews`,
        method: "POST",
        data: body
      }),
      invalidatesTags: ["User", "Review", "Company"]
    })
  })
});

export const {
  useGetAllReviewsByCompanyQuery,
  useLatestReviewsQuery,
  useCountReviewsByCompanyQuery,
  useAverageRatingsByCompanyQuery,
  useCountAllReviewsQuery,
  useGetRatingByCompanyQuery,
  useCalculateRecommendedPercentageByCompanyQuery,
  useCreateReviewMutation
} = reviewApi;
