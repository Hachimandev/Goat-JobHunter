import { api } from '@/services/api';
import { IBackendRes } from '@/types/api';
import { CallSession } from '@/types/model';
import {
  AcceptCallRequest,
  CallParticipantsResponse,
  DeclineCallRequest,
  EndCallRequest,
  GetActiveCallRequest,
  GetCallParticipantsRequest,
  InitiateCallRequest,
  InitiateCallResponse,
} from '@/services/chatRoom/call/callType';

export const callApi = api.injectEndpoints({
  endpoints: (builder) => ({
    initiateCall: builder.mutation<InitiateCallResponse, InitiateCallRequest>({
      query: ({ chatRoomId, callType, participantIds }) => ({
        url: `/chatrooms/${chatRoomId}/calls/initiate`,
        method: 'POST',
        data: {
          callType,
          participantIds,
        },
      }),
      invalidatesTags: (_, __, { chatRoomId }) => [{ type: 'ChatRoom', id: chatRoomId }],
    }),

    acceptCall: builder.mutation<IBackendRes<CallSession>, AcceptCallRequest>({
      query: ({ chatRoomId, callId }) => ({
        url: `/chatrooms/${chatRoomId}/calls/${callId}/accept`,
        method: 'POST',
      }),
      invalidatesTags: (_, __, { chatRoomId }) => [{ type: 'ChatRoom', id: chatRoomId }],
    }),

    declineCall: builder.mutation<IBackendRes<null>, DeclineCallRequest>({
      query: ({ chatRoomId, callId }) => ({
        url: `/chatrooms/${chatRoomId}/calls/${callId}/decline`,
        method: 'POST',
      }),
      invalidatesTags: (_, __, { chatRoomId }) => [{ type: 'ChatRoom', id: chatRoomId }],
    }),

    endCall: builder.mutation<IBackendRes<null>, EndCallRequest>({
      query: ({ chatRoomId, callId }) => ({
        url: `/chatrooms/${chatRoomId}/calls/${callId}/end`,
        method: 'POST',
      }),
      invalidatesTags: (_, __, { chatRoomId }) => [{ type: 'ChatRoom', id: chatRoomId }],
    }),

    getActiveCall: builder.query<IBackendRes<CallSession | null>, GetActiveCallRequest>({
      query: ({ chatRoomId }) => ({
        url: `/chatrooms/${chatRoomId}/calls/active`,
        method: 'GET',
      }),
      providesTags: (_, __, { chatRoomId }) => [{ type: 'ChatRoom', id: chatRoomId }],
    }),

    getCallParticipants: builder.query<CallParticipantsResponse, GetCallParticipantsRequest>({
      query: ({ chatRoomId, callId }) => ({
        url: `/chatrooms/${chatRoomId}/calls/${callId}/participants`,
        method: 'GET',
      }),
      providesTags: (_, __, { chatRoomId }) => [{ type: 'ChatRoom', id: chatRoomId }],
    }),
  }),
});

export const {
  useInitiateCallMutation,
  useAcceptCallMutation,
  useDeclineCallMutation,
  useEndCallMutation,
  useGetActiveCallQuery,
  useGetCallParticipantsQuery,
} = callApi;
