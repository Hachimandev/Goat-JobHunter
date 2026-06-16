import { userApi } from "@/services/user/userApi";
import {
  CheckSavedBlogsResponse,
  GetSavedBlogsResponse,
  BlogIdsRequest,
  SaveBlogsResponse
} from "@/services/user/userType";

export const savedBlogsApi = userApi.injectEndpoints({
  endpoints: (builder) => ({
    getSavedBlogs: builder.query<GetSavedBlogsResponse, void>({
      query: () => ({
        url: "/users/me/saved-blogs",
        method: "GET"
      }),
      providesTags: (result) =>
        result?.data
          ? [
            ...result.data.result.map((blog) => ({
              type: "SavedBlog" as const,
              id: blog.blogId
            })),
            { type: "SavedBlog", id: "LIST" }
          ]
          : [{ type: "SavedBlog", id: "LIST" }]
    }),

    checkSavedBlogs: builder.query<
      CheckSavedBlogsResponse,
      BlogIdsRequest
    >({
      query: (params) => ({
        url: "/users/me/saved-blogs/contains",
        method: "GET",
        params
      }),
      providesTags: (_, __, arg) =>
        arg.blogIds
          ? arg.blogIds.map((blogId) => ({
            type: "SavedBlog" as const,
            id: blogId
          }))
          : []
    }),

    saveBlogs: builder.mutation<SaveBlogsResponse, BlogIdsRequest>({
      query: (data) => ({
        url: "/users/me/saved-blogs",
        method: "PUT",
        data
      }),
      invalidatesTags: (_, __, arg) => [
        { type: "SavedBlog", id: "LIST" },
        ...arg.blogIds.map((blogId) => ({
          type: "SavedBlog" as const,
          id: blogId
        }))
      ]
    }),

    unsaveBlogs: builder.mutation<SaveBlogsResponse, BlogIdsRequest>({
      query: (data) => ({
        url: "/users/me/saved-blogs",
        method: "DELETE",
        data
      }),
      invalidatesTags: (_, __, arg) => [
        { type: "SavedBlog", id: "LIST" },
        ...arg.blogIds.map((blogId) => ({
          type: "SavedBlog" as const,
          id: blogId
        }))
      ]
    })
  })
})

export const {
  useGetSavedBlogsQuery,
  useCheckSavedBlogsQuery,
  useSaveBlogsMutation,
  useUnsaveBlogsMutation
} = savedBlogsApi;