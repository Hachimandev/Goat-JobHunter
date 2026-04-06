import { api } from "@/services/api";
import {
  BlogIdsRequest,
  CheckReactionBlogResponse,
  ReactionBlogRequest,
} from "@/services/reaction/reactionType";

export const reactionApi = api.injectEndpoints({
  endpoints: (builder) => ({
    reactBlog: builder.mutation<void, ReactionBlogRequest>({
      query: (data) => ({
        url: "/reactions/blogs",
        method: "POST",
        data,
      }),
      invalidatesTags: (_, __, arg) => [
        { type: "Blog", id: `REACTION-${arg.blogId}` },
        { type: "Blog", id: arg.blogId },
      ],
    }),

    unreactBlog: builder.mutation<void, BlogIdsRequest>({
      query: (data) => ({
        url: "/reactions/blogs",
        method: "DELETE",
        data,
      }),
      invalidatesTags: (_, __, arg) =>
        (arg.blogIds ?? []).flatMap((blogId) => [
          { type: "Blog" as const, id: `REACTION-${blogId}` },
          { type: "Blog", id: blogId },
        ]),
    }),

    checkReactBlog: builder.query<CheckReactionBlogResponse, BlogIdsRequest>({
      query: (params) => ({
        url: "/reactions/blogs",
        method: "GET",
        params,
      }),
      providesTags: (_, __, arg) =>
        (arg.blogIds ?? []).map((blogId) => ({
          type: "Blog" as const,
          id: `REACTION-${blogId}`,
        })),
    }),
  }),
});

export const {
  useReactBlogMutation,
  useUnreactBlogMutation,
  useCheckReactBlogQuery,
} = reactionApi;
