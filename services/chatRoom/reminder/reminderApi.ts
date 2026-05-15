import { api } from '@/services/api';
import {
  ReminderResponse,
  FetchRemindersInChatRoomResponse,
  FetchRemindersInChatRoomRequest,
  CreateReminderRequest,
  RespondReminderRequest,
  DeclineReminderRequest,
} from './reminderType';

export const reminderApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getRemindersByChatRoom: builder.query<FetchRemindersInChatRoomResponse, FetchRemindersInChatRoomRequest>({
      query: ({ chatRoomId, page, size }) => ({
        url: `/chatrooms/${chatRoomId}/reminders`,
        method: 'GET',
        params: { page, size },
      }),
      providesTags: (_, __, { chatRoomId }) => [{ type: 'Reminder' as const, id: `REMINDERS_${chatRoomId}` }],
    }),

    createReminder: builder.mutation<ReminderResponse, CreateReminderRequest>(
      {
        query: ({ chatRoomId, ...data }) => ({
          url: `/chatrooms/${chatRoomId}/reminders`,
          method: 'POST',
          data: data,
        }),
        invalidatesTags: (_, __, { chatRoomId }) => [{ type: 'Reminder' as const, id: `REMINDERS_${chatRoomId}` }],
      },
    ),

    respondToReminder: builder.mutation<ReminderResponse, RespondReminderRequest>(
      {
        query: ({ chatRoomId, reminderId, status }) => ({
          url: `/chatrooms/${chatRoomId}/reminders/${reminderId}/rsvp`,
          method: 'PUT',
          data: { status },
        }),
      },
    ),

    declineReminder: builder.mutation<ReminderResponse, DeclineReminderRequest>(
      {
        query: ({ chatRoomId, reminderId }) => ({
          url: `/chatrooms/${chatRoomId}/reminders/${reminderId}/decline`,
          method: 'PUT',
        }),
      },
    ),
  }),
});

export const {
  useGetRemindersByChatRoomQuery,
  useCreateReminderMutation,
  useRespondToReminderMutation,
  useDeclineReminderMutation,
} = reminderApi;
