import { api } from '@/services/api';
import {
  AssignmentTagByRoomRequest,
  AssignmentTagByRoomResponse,
  AssignmentTagRequest,
  AssignmentTagResponse,
  FetchRoomIdsByTagResponse,
  GetTagRequest,
  GetTagResponse,
  TagRequest,
  TagResponse,
  UpdateTagRequest,
} from './tagType';

export const tagApi = api.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    createTag: builder.mutation<TagResponse, TagRequest>({
      query: (data) => ({
        url: '/tags',
        method: 'POST',
        data,
      }),
      invalidatesTags: [{ type: 'Tag', id: 'LIST' }],
    }),

    updateTag: builder.mutation<TagResponse, UpdateTagRequest>({
      query: ({ tagId, ...data }) => ({
        url: `/tags/${tagId}`,
        method: 'PUT',
        data,
      }),
      invalidatesTags: (_, __, { tagId }) => [
        { type: 'Tag', id: tagId },
        { type: 'Tag', id: 'LIST' },
      ],
    }),

    deleteTag: builder.mutation<void, number>({
      query: (tagId) => ({
        url: `/tags/${tagId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_, __, tagId) => [
        { type: 'Tag', id: tagId },
        { type: 'Tag', id: 'LIST' },
      ],
    }),

    fetchTags: builder.query<GetTagResponse, GetTagRequest>({
      query: (params) => ({
        url: '/tags',
        method: 'GET',
        params,
      }),
      providesTags: (result) =>
        result?.data
          ? [...result.data.result.map((tag) => ({ type: 'Tag' as const, id: tag.tagId })), { type: 'Tag', id: 'LIST' }]
          : [{ type: 'Tag', id: 'LIST' }],
    }),

    assignTag: builder.mutation<AssignmentTagResponse, AssignmentTagRequest>({
      query: (data) => ({
        url: `/tags/assign`,
        method: 'PUT',
        data,
      }),
      invalidatesTags: (_, __, { tagId }) => [
        { type: 'Tag' as const, id: String(tagId) },
        { type: 'Tag', id: 'LIST' },
      ],
    }),

    assignTagByRoom: builder.mutation<AssignmentTagByRoomResponse, AssignmentTagByRoomRequest>({
      query: ({ roomId, tagId }) => ({
        url: `/tags/${roomId}/assign`,
        method: 'PUT',
        params: { tagId },
      }),
      invalidatesTags: (_, __, tagId) => [
        { type: 'Tag' as const, id: String(tagId) },
        { type: 'Tag', id: 'LIST' },
      ],
    }),

    removeTag: builder.mutation<void, { roomId: number }>({
      query: ({ roomId }) => ({
        url: `/tags/${roomId}/assign`,
        method: 'DELETE',
      }),
      invalidatesTags: (_, __, tagId) => [
        { type: 'Tag' as const, id: String(tagId) },
        { type: 'Tag', id: 'LIST' },
      ],
    }),

    fetchRoomIdsByTag: builder.query<FetchRoomIdsByTagResponse, number>({
      query: (tagId) => ({
        url: `/tags/${tagId}/rooms`,
        method: 'GET',
      }),
      providesTags: (_, __, tagId) => [
        { type: 'Tag' as const, id: String(tagId) },
        { type: 'Tag', id: 'LIST' },
      ],
    }),

    fetchTagAssignments: builder.query<AssignmentTagResponse, void>({
      query: () => ({
        url: `/tags/me`,
        method: 'GET',
      }),
      providesTags: (result) =>
        result?.data
          ? [...result.data.map((tag) => ({ type: 'Tag' as const, id: tag.tagId })), { type: 'Tag', id: 'LIST' }]
          : [{ type: 'Tag', id: 'LIST' }],
    }),
  }),
});

export const {
  useCreateTagMutation,
  useUpdateTagMutation,
  useDeleteTagMutation,
  useFetchTagsQuery,
  useAssignTagMutation,
  useAssignTagByRoomMutation,
  useRemoveTagMutation,
  useFetchRoomIdsByTagQuery,
  useFetchTagAssignmentsQuery,
} = tagApi;
