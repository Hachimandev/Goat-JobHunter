import { api } from '@/services/api';
import {
  EndCallRequest,
  EndCallResponse,
  DeclineCallRequest,
  DeclineCallResponse,
  GetCurrentCallRequest,
  GetCurrentCallResponse,
  IssueCallTokenRequest,
  IssueCallTokenResponse,
  JoinCallRequest,
  JoinCallResponse,
  LeaveCallRequest,
  LeaveCallResponse,
  StartCallRequest,
  StartCallResponse,
} from '@/services/chatRoom/call/callType';

export const callApi = api.injectEndpoints({
  endpoints: (builder) => ({
    startCall: builder.mutation<StartCallResponse, StartCallRequest>({
      query: ({ chatRoomId, publisher = true }) => ({
        url: `/chatrooms/${chatRoomId}/calls`,
        method: 'POST',
        data: {
          publisher,
        },
      }),
      invalidatesTags: (_, __, { chatRoomId }) => [{ type: 'ChatRoom', id: chatRoomId }],
    }),

    joinCall: builder.mutation<JoinCallResponse, JoinCallRequest>({
      query: ({ chatRoomId, sessionId, publisher = true }) => ({
        url: `/chatrooms/${chatRoomId}/calls/${sessionId}/join`,
        method: 'POST',
        data: {
          publisher,
        },
      }),
      invalidatesTags: (_, __, { chatRoomId }) => [{ type: 'ChatRoom', id: chatRoomId }],
    }),

    leaveCall: builder.mutation<LeaveCallResponse, LeaveCallRequest>({
      query: ({ chatRoomId, sessionId }) => ({
        url: `/chatrooms/${chatRoomId}/calls/${sessionId}/leave`,
        method: 'POST',
      }),
      invalidatesTags: (_, __, { chatRoomId }) => [{ type: 'ChatRoom', id: chatRoomId }],
    }),

    declineCall: builder.mutation<DeclineCallResponse, DeclineCallRequest>({
      query: ({ chatRoomId, sessionId }) => ({
        url: `/chatrooms/${chatRoomId}/calls/${sessionId}/decline`,
        method: 'POST',
      }),
      invalidatesTags: (_, __, { chatRoomId }) => [{ type: 'ChatRoom', id: chatRoomId }],
    }),

    endCall: builder.mutation<EndCallResponse, EndCallRequest>({
      query: ({ chatRoomId, sessionId, reason }) => ({
        url: `/chatrooms/${chatRoomId}/calls/${sessionId}/end`,
        method: 'POST',
        data: {
          reason,
        },
      }),
      invalidatesTags: (_, __, { chatRoomId }) => [{ type: 'ChatRoom', id: chatRoomId }],
    }),

    getCurrentCall: builder.query<GetCurrentCallResponse, GetCurrentCallRequest>({
      query: ({ chatRoomId }) => ({
        url: `/chatrooms/${chatRoomId}/calls/current`,
        method: 'GET',
      }),
      providesTags: (_, __, { chatRoomId }) => [{ type: 'ChatRoom', id: chatRoomId }],
    }),

    issueCallToken: builder.mutation<IssueCallTokenResponse, IssueCallTokenRequest>({
      query: ({ chatRoomId, publisher = true, sessionId }) => ({
        url: `/chatrooms/${chatRoomId}/calls/token`,
        method: 'POST',
        data: {
          publisher,
          sessionId,
        },
      }),
      invalidatesTags: (_, __, { chatRoomId }) => [{ type: 'ChatRoom', id: chatRoomId }],
    }),
  }),
});

export const {
  useStartCallMutation,
  useJoinCallMutation,
  useLeaveCallMutation,
  useDeclineCallMutation,
  useEndCallMutation,
  useGetCurrentCallQuery,
  useIssueCallTokenMutation,
} = callApi;
