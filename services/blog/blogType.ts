import type { IBackendRes, IModelPaginate } from "@/types/api";
import { BlogActionType } from "@/types/enum";
import { Blog, CommentType } from "@/types/model";

export type BlogIdsRequest = {
  blogIds: number[];
  reason?: string;
  mode: BlogActionType;
};

// Update Blog
export type UpdateBlogRequest = {
  blogId: number;
  formData: FormData;
};

// Fetch with Pagination
export type FetchBlogsRequest = {
  page?: number;
  size?: number;
  sortBy?: string;
  tags?: string[];
  title?: string;
  draft?: boolean;
  enabled?: boolean;
};

export type FetchTagsRequest = {
  keyword?: string;
};

// Response Types
export type BlogMutationResponse = IBackendRes<Blog>;

export type FetchBlogsResponse = IBackendRes<IModelPaginate<Blog>>;

export type FetchBlogByIdResponse = IBackendRes<Blog>;

export type FetchTagsResponse = IBackendRes<[[string, number]]>;

export type BlogStatusResponse = IBackendRes<
  {
    blogId: number;
    enabled: boolean;
  }[]
>;

export type GetCommentsResponse = IBackendRes<CommentType[]>;

export type CreateCommentRequest = {
  blogId: number;
  comment: string;
  replyTo?: number;
};
