import { api } from '@/services/api';
import {
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
      invalidatesTags: (_, __, { roomIds }) => [
        ...roomIds.map((id) => ({ type: 'ChatRoom' as const, id: String(id) })),
        { type: 'ChatRoom', id: 'LIST' },
      ],
    }),

    removeTag: builder.mutation<void, number>({
      query: (roomId) => ({
        url: `/tags/${roomId}/assign`,
        method: 'DELETE',
      }),
      invalidatesTags: (_, __, roomId) => [
        { type: 'ChatRoom' as const, id: String(roomId) },
        { type: 'ChatRoom', id: 'LIST' },
      ],
    }),

    fetchRoomIdsByTag: builder.query<FetchRoomIdsByTagResponse, number>({
      query: (tagId) => ({
        url: `/tags/${tagId}/rooms`,
        method: 'GET',
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map((id) => ({ type: 'ChatRoom' as const, id: String(id) })),
              { type: 'ChatRoom', id: 'LIST' },
            ]
          : [{ type: 'ChatRoom', id: 'LIST' }],
    }),
  }),
});

export const {
  useCreateTagMutation,
  useUpdateTagMutation,
  useDeleteTagMutation,
  useFetchTagsQuery,
  useAssignTagMutation,
  useRemoveTagMutation,
  useFetchRoomIdsByTagQuery,
} = tagApi;
