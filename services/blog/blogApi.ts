import { api } from "@/services/api";
import { buildSpringQuery } from "@/utils/buildSpringQuery";
import {
  CreateCommentRequest,
  FetchBlogByIdResponse,
  FetchBlogsRequest,
  FetchBlogsResponse,
  FetchTagsRequest,
  FetchTagsResponse,
  GetCommentsResponse,
} from "./blogType";

export const blogApi = api.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    // ================= BLOG =================

    fetchBlogs: builder.query<FetchBlogsResponse, FetchBlogsRequest>({
      query: (params) => {
        const { params: queryParams } = buildSpringQuery({
          params,
          filterFields: ["title", "draft"],
          textSearchFields: ["title"],
          defaultSort: "createdAt,desc",
        });

        return {
          url: "/blogs",
          method: "GET",
          params: queryParams,
        };
      },
      providesTags: ["Blog"],
    }),

    fetchAvailableBlogs: builder.query<FetchBlogsResponse, FetchBlogsRequest>({
      query: (params) => {
        const { params: queryParams } = buildSpringQuery({
          params,
          filterFields: ["title", "content", "tags"],
          textSearchFields: ["title", "content"],
          sortableFields: ["tags"],
          defaultSort: "createdAt,desc",
        });

        return {
          url: "/blogs/available",
          method: "GET",
          params: queryParams,
        };
      },
      providesTags: ["Blog"],
    }),

    fetchPopularBlogs: builder.query<FetchBlogsResponse, FetchBlogsRequest>({
      query: (params) => {
        const modifiedParams = {
          ...params,
          sort: "activity.totalReads,desc",
        };

        const { params: queryParams } = buildSpringQuery({
          params: modifiedParams,
          filterFields: ["title", "content", "authorId"],
          textSearchFields: ["title", "content"],
          sortableFields: ["tags"],
          defaultSort: "activity.totalReads,desc",
        });

        return {
          url: "/blogs",
          method: "GET",
          params: queryParams,
        };
      },
      providesTags: ["Blog"],
    }),

    fetchBlogById: builder.query<FetchBlogByIdResponse, number>({
      query: (blogId) => ({
        url: `/blogs/${blogId}`,
        method: "GET",
      }),
      providesTags: ["Blog"],
    }),

    fetchBlogByIdRead: builder.query<FetchBlogByIdResponse, number>({
      query: (blogId) => ({
        url: `/blogs/${blogId}`,
        method: "GET",
        params: { read: true },
      }),
      providesTags: ["Blog"],
    }),

    // ================= TAG =================

    fetchTags: builder.query<FetchTagsResponse, FetchTagsRequest>({
      query: (params) => ({
        url: "/blogs/tags",
        method: "GET",
        params,
      }),
    }),

    // ================= COMMENT =================

    getCommentsByBlogId: builder.query<GetCommentsResponse, number>({
      query: (blogId) => {
        const { params } = buildSpringQuery({
          params: {},
          filterFields: [],
          sortableFields: ["createdAt"],
          defaultSort: "createdAt,desc",
        });

        return {
          url: `/comments/blog/${blogId}`,
          method: "GET",
          params,
        };
      },
      providesTags: ["Comment"],
    }),

    createComment: builder.mutation<unknown, CreateCommentRequest>({
      query: (data) => ({
        url: "/comments",
        method: "POST",
        data,
      }),
      invalidatesTags: ["Comment", "Blog"],
    }),

    deleteComment: builder.mutation<unknown, number>({
      query: (commentId) => ({
        url: `/comments/${commentId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Comment", "Blog"],
    }),

    createBlog: builder.mutation<any, FormData>({
      query: (formData) => ({
        url: "/blogs",
        method: "POST",
        data: formData,
      }),
      invalidatesTags: ["Blog"],
    }),

    updateBlog: builder.mutation<any, { blogId: number; formData: FormData }>({
      query: ({ blogId, formData }) => ({
        url: `/blogs/${blogId}`,
        method: "PUT",
        data: formData,
      }),
      invalidatesTags: ["Blog"],
    }),

    deleteBlog: builder.mutation<any, { blogIds: number[]; mode?: string }>({
      query: ({ blogIds, mode = "DELETE" }) => ({
        url: "/blogs",
        method: "DELETE",
        data: {
          blogIds,
          mode,
        },
      }),
      invalidatesTags: ["Blog"],
    }),
  }),
});

export const {
  useFetchBlogsQuery,
  useFetchAvailableBlogsQuery,
  useFetchPopularBlogsQuery,
  useFetchBlogByIdQuery,
  useFetchBlogByIdReadQuery,

  useFetchTagsQuery,

  useGetCommentsByBlogIdQuery,
  useCreateCommentMutation,
  useDeleteCommentMutation,
  useCreateBlogMutation,
  useUpdateBlogMutation,
  useDeleteBlogMutation,
} = blogApi;
