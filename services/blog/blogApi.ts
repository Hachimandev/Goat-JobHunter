import { api } from '@/services/api';
import { buildSpringQuery } from '@/utils/buildSpringQuery';
import {
  BlogIdsRequest,
  BlogMutationResponse,
  BlogStatusResponse,
  CreateCommentRequest,
  FetchBlogByIdResponse,
  FetchBlogsRequest,
  FetchBlogsResponse,
  FetchTagsRequest,
  FetchTagsResponse,
  GetCommentsResponse,
  UpdateBlogRequest,
} from './blogType';

export const blogApi = api.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    createBlog: builder.mutation<BlogMutationResponse, FormData>({
      query: (data) => ({
        url: '/blogs',
        method: 'POST',
        data,
      }),
      invalidatesTags: ['Blog'],
    }),

    updateBlog: builder.mutation<BlogMutationResponse, UpdateBlogRequest>({
      query: (data) => ({
        url: '/blogs',
        method: 'PUT',
        data,
      }),
      invalidatesTags: (_, __, arg) => [
        { type: 'Blog', id: arg.blogId },
        { type: 'Blog', id: 'LIST' },
      ],
    }),

    deleteBlog: builder.mutation<BlogMutationResponse, BlogIdsRequest>({
      query: (data) => ({
        url: `/blogs`,
        method: 'DELETE',
        data,
      }),
      invalidatesTags: (_, __, arg) => [
        ...arg.blogIds.map((id) => ({ type: 'Blog' as const, id })),
        { type: 'Blog', id: 'LIST' },
      ],
    }),

    fetchBlogs: builder.query<FetchBlogsResponse, FetchBlogsRequest>({
      query: (params) => {
        const { params: queryParams } = buildSpringQuery({
          params,
          filterFields: ['content', 'enabled'],
          textSearchFields: ['content'],
          defaultSort: 'createdAt,desc',
        });

        return {
          url: '/blogs',
          method: 'GET',
          params: queryParams,
        };
      },
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.result.map((blog) => ({ type: 'Blog' as const, id: blog.blogId })),
              { type: 'Blog', id: 'LIST' },
            ]
          : [{ type: 'Blog', id: 'LIST' }],
    }),

    fetchAvailableBlogs: builder.query<FetchBlogsResponse, FetchBlogsRequest>({
      query: (params) => {
        const { params: queryParams } = buildSpringQuery({
          params,
          filterFields: ['content'],
          textSearchFields: ['content'],
          arrayFields: ['tags'],
          defaultSort: 'createdAt,desc',
        });

        return {
          url: '/blogs/available',
          method: 'GET',
          params: queryParams,
        };
      },
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.result.map((blog) => ({ type: 'Blog' as const, id: blog.blogId })),
              { type: 'Blog', id: 'LIST' },
            ]
          : [{ type: 'Blog', id: 'LIST' }],
    }),

    fetchPopularBlogs: builder.query<FetchBlogsResponse, FetchBlogsRequest>({
      query: (params) => {
        const { params: queryParams } = buildSpringQuery({
          params,
          filterFields: ['content'],
          textSearchFields: ['content'],
          nestedFields: {
            authorId: 'author.accountId',
          },
          arrayFields: ['tags'],
          defaultSort: 'activity.totalReads,desc',
          sortableFields: [
            'createdAt',
            'updatedAt',
            'activity.totalReads',
            'activity.totalLikes',
            'activity.totalComments',
          ],
        });

        return {
          url: '/blogs',
          method: 'GET',
          params: queryParams,
        };
      },
      providesTags: ['Blog'],
    }),

    fetchBlogById: builder.query<FetchBlogByIdResponse, number>({
      query: (blogId) => ({
        url: `/blogs/${blogId}`,
        method: 'GET',
      }),
      providesTags: ['Blog'],
    }),

    fetchBlogByIdRead: builder.query<FetchBlogByIdResponse, number>({
      query: (blogId) => ({
        url: `/blogs/${blogId}`,
        method: 'GET',
        params: { read: true },
      }),
      providesTags: ['Blog'],
    }),

    fetchTags: builder.query<FetchTagsResponse, FetchTagsRequest>({
      query: (params) => ({
        url: '/blogs/tags',
        method: 'GET',
        params,
      }),
    }),

    fetchBlogsByCurrentUser: builder.query<FetchBlogsResponse, FetchBlogsRequest>({
      query: (params) => {
        const { params: queryParams } = buildSpringQuery({
          params,
          filterFields: ['content', 'enabled'],
          textSearchFields: ['content'],
          arrayFields: ['tags'],
          defaultSort: 'createdAt,updatedAt,desc',
        });

        return {
          url: '/blogs/me',
          method: 'GET',
          params: queryParams,
        };
      },
      providesTags: ['Blog'],
    }),

    fetchBlogsByAuthor: builder.query<FetchBlogsResponse, FetchBlogsRequest>({
      query: (params) => {
        const { params: queryParams } = buildSpringQuery({
          params,
          filterFields: ['content', 'enabled'],
          textSearchFields: ['content'],
          nestedFields: {
            authorId: 'author.accountId',
          },
          arrayFields: ['tags'],
          defaultSort: 'createdAt,desc',
        });

        return {
          url: '/blogs/available',
          method: 'GET',
          params: queryParams,
        };
      },
      providesTags: ['Blog'],
    }),

    enableBlogs: builder.mutation<BlogStatusResponse, BlogIdsRequest>({
      query: (blogIds) => ({
        url: '/blogs/enabled',
        method: 'PUT',
        data: blogIds,
      }),
      invalidatesTags: (_, __, arg) => [
        ...arg.blogIds.map((id) => ({ type: 'Blog' as const, id })),
        { type: 'Blog', id: 'LIST' },
      ],
    }),

    disableBlogs: builder.mutation<BlogStatusResponse, BlogIdsRequest>({
      query: (blogIds) => ({
        url: '/blogs/disabled',
        method: 'PUT',
        data: blogIds,
      }),
      invalidatesTags: (_, __, arg) => [
        ...arg.blogIds.map((id) => ({ type: 'Blog' as const, id })),
        { type: 'Blog', id: 'LIST' },
      ],
    }),

    // comments endpoints
    getCommentsByBlogId: builder.query<GetCommentsResponse, number>({
      query: (blogId: number) => {
        const { params } = buildSpringQuery({
          params: {},
          filterFields: [],
          sortableFields: ['createdAt'],
          defaultSort: 'createdAt,desc',
        });

        return {
          url: `/comments/blog/${blogId}`,
          method: 'GET',
          params,
        };
      },
      providesTags: (_, __, blogId) => [{ type: 'Comment', id: blogId }],
    }),

    createComment: builder.mutation<unknown, CreateCommentRequest>({
      query: (data) => ({
        url: `/comments`,
        method: 'POST',
        data,
      }),
      invalidatesTags: (_, __, arg) => [
        { type: 'Comment', id: arg.blogId },
        { type: 'Blog', id: arg.blogId }, // Chỉ update blog cụ thể
      ],
    }),

    deleteComment: builder.mutation<unknown, { commentId: number; blogId: number }>({
      query: ({ commentId }) => ({
        url: `/comments/${commentId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_, __, arg) => [
        { type: 'Comment', id: arg.commentId },
        { type: 'Blog', id: arg.blogId },
        { type: 'Comment', id: arg.blogId },
      ],
    }),
  }),
});

export const {
  useCreateBlogMutation,
  useUpdateBlogMutation,
  useDeleteBlogMutation,

  useFetchBlogsQuery,
  useFetchAvailableBlogsQuery,
  useFetchPopularBlogsQuery,
  useFetchBlogByIdQuery,
  useFetchBlogByIdReadQuery,

  useFetchTagsQuery,
  useFetchBlogsByCurrentUserQuery,
  useFetchBlogsByAuthorQuery,

  useEnableBlogsMutation,
  useDisableBlogsMutation,

  // comments hooks
  useGetCommentsByBlogIdQuery,
  useCreateCommentMutation,
  useDeleteCommentMutation,
} = blogApi;
