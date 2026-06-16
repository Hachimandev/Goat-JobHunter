import { api } from "@/services/api";
import { buildSpringQuery } from "@/utils/buildSpringQuery";
import {
  CareerMutationResponse,
  CareerNameRequest,
  FetchCareersRequest,
  FetchCareersResponse,
  UpdateCareerRequest
} from "./careerType";

export const careerApi = api.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    createCareer: builder.mutation<CareerMutationResponse, CareerNameRequest>({
      query: ({ name }) => ({
        url: "/careers",
        method: "POST",
        data: { name }
      }),
      invalidatesTags: [{ type: "Career", id: "LIST" }]
    }),

    updateCareer: builder.mutation<CareerMutationResponse, UpdateCareerRequest>({
      query: ({ careerId, name }) => ({
        url: "/careers",
        method: "PUT",
        data: { careerId, name }
      }),
      invalidatesTags: (_, __, arg) => [
        { type: "Career", id: arg.careerId },
        { type: "Career", id: "LIST" }
      ]
    }),

    deleteCareer: builder.mutation<CareerMutationResponse, number>({
      query: (careerId) => ({
        url: `/careers/${careerId}`,
        method: "DELETE"
      }),
      invalidatesTags: (_, __, arg) => [
        { type: "Career", id: arg },
        { type: "Career", id: "LIST" }
      ]
    }),

    fetchCareers: builder.query<FetchCareersResponse, FetchCareersRequest>({
      query: (params) => {
        const { params: queryParams } = buildSpringQuery({
          params,
          filterFields: ["name"],
          textSearchFields: ["name"],
          defaultSort: "name,asc",
          sortableFields: ["createdAt", "updatedAt"]
        });

        return {
          url: "/careers",
          method: "GET",
          params: queryParams
        };
      },
      providesTags: (result) =>
        result?.data
          ? [
            ...result.data.result.map((career) => ({
              type: "Career" as const,
              id: career.careerId
            })),
            { type: "Career", id: "LIST" }
          ]
          : [{ type: "Career", id: "LIST" }]
    })
  })
});

export const {
  useCreateCareerMutation,
  useUpdateCareerMutation,
  useDeleteCareerMutation,
  useFetchCareersQuery
} = careerApi;