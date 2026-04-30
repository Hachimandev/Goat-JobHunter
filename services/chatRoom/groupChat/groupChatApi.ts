import { api } from '@/services/api';
import { IBackendRes } from '@/types/api';
import { ChatRoomPrivacy } from '@/types/enum';

interface CreateGroupChatRequest {
  accountIds: number[];
  name: string;
  avatar: string;
}

interface UpdateGroupInfoRequest {
  name?: string;
  avatar?: string;
  privacy?: ChatRoomPrivacy;
}

interface AddMemberRequest {
  accountId: number;
}

interface UpdateMemberRoleRequest {
  role: ChatRole;
}

type ChatRole = 'OWNER' | 'MODERATOR' | 'MEMBER';

interface ChatRoomResponse {
  aiModel: string | null;
  avatar: string;
  createdAt: string;
  createdBy: string;
  deletedAt: string | null;
  deleteBy: string | null;
  name: string;
  roomId: number;
  type: 'GROUP';
  privacy: ChatRoomPrivacy;
  updatedAt: string;
  updatedBy: string;
}

export interface ChatMemberResponse {
  accountId: number;
  avatar: string;
  chatMemberId: number;
  fullName: string;
  email: string;
  joinedAt: string;
  role: ChatRole;
  username: string;
}

export const groupChatApi = api.injectEndpoints({
  endpoints: (builder) => ({
    createGroupChat: builder.mutation<IBackendRes<ChatRoomResponse>, CreateGroupChatRequest>({
      query: (data) => ({
        url: '/chatrooms/group',
        method: 'POST',
        data,
      }),
      invalidatesTags: ['ChatRoom'],
    }),

    updateGroupInfo: builder.mutation<IBackendRes<ChatRoomResponse>, { chatroomId: string } & UpdateGroupInfoRequest>({
      query: ({ chatroomId, ...data }) => ({
        url: `/chatrooms/group/${chatroomId}`,
        method: 'PUT',
        data,
      }),
      invalidatesTags: (result, error, { chatroomId }) => [{ type: 'ChatRoom', id: chatroomId }],
    }),

    leaveGroupChat: builder.mutation<void, string>({
      query: (chatroomId) => ({
        url: `/chatrooms/group/${chatroomId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, chatroomId) => {
        const normalizedChatRoomId = Number(chatroomId);
        const chatRoomTagId = Number.isNaN(normalizedChatRoomId) ? chatroomId : normalizedChatRoomId;

        return [
          { type: 'ChatRoom', id: chatRoomTagId },
          { type: 'ChatRoom', id: 'LIST' },
          { type: 'ChatMember', id: chatRoomTagId },
        ];
      },
    }),

    getMemberInGroupChat: builder.query<IBackendRes<ChatMemberResponse[]>, number>({
      query: (chatroomId) => ({
        url: `/chatrooms/group/${chatroomId}/members`,
        method: 'GET',
      }),
      providesTags: (result, error, chatroomId) => [{ type: 'ChatMember', id: chatroomId }],
    }),

    addMemberToGroup: builder.mutation<IBackendRes<ChatMemberResponse>, { chatroomId: string } & AddMemberRequest>({
      query: ({ chatroomId, ...data }) => ({
        url: `/chatrooms/group/${chatroomId}/member`,
        method: 'POST',
        data,
      }),
      invalidatesTags: (result, error, { chatroomId }) => [
        { type: 'ChatRoom', id: chatroomId },
        { type: 'ChatMember', id: chatroomId },
      ],
    }),

    removeMemberFromGroup: builder.mutation<void, { chatroomId: string; chatMemberId: string }>({
      query: ({ chatroomId, chatMemberId }) => ({
        url: `/chatrooms/group/${chatroomId}/member/${chatMemberId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { chatroomId }) => {
        const normalizedChatRoomId = Number(chatroomId);
        const chatRoomTagId = Number.isNaN(normalizedChatRoomId) ? chatroomId : normalizedChatRoomId;

        return [
          { type: 'ChatRoom', id: chatRoomTagId },
          { type: 'ChatRoom', id: 'LIST' },
          { type: 'ChatMember', id: chatRoomTagId },
        ];
      },
    }),

    updateMemberRole: builder.mutation<
      IBackendRes<ChatMemberResponse>,
      {
        chatroomId: string;
        chatMemberId: string;
      } & UpdateMemberRoleRequest
    >({
      query: ({ chatroomId, chatMemberId, ...data }) => ({
        url: `/chatrooms/group/${chatroomId}/member/${chatMemberId}`,
        method: 'PUT',
        data,
      }),
      invalidatesTags: (result, error, { chatroomId, chatMemberId }) => [
        { type: 'ChatRoom', id: chatroomId },
        { type: 'ChatMember', id: chatMemberId },
      ],
    }),

    dissolveGroupChat: builder.mutation<void, { chatRoomId: number; groupNameConfirmation: string }>({
      query: ({ chatRoomId, groupNameConfirmation }) => ({
        url: `/chatrooms/group/${chatRoomId}/dissolve`,
        method: 'DELETE',
        params: { groupNameConfirmation },
      }),
      invalidatesTags: (result, error, { chatRoomId }) => [{ type: 'ChatRoom', id: chatRoomId }],
    }),
  }),
});

export const {
  useCreateGroupChatMutation,
  useUpdateGroupInfoMutation,
  useLeaveGroupChatMutation,
  useGetMemberInGroupChatQuery,
  useAddMemberToGroupMutation,
  useRemoveMemberFromGroupMutation,
  useUpdateMemberRoleMutation,
  useDissolveGroupChatMutation,
} = groupChatApi;
