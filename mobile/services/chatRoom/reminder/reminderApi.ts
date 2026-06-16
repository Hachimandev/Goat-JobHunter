import { api } from "@/services/api";
import {
  FetchRemindersInChatRoomRequest,
  FetchRemindersInChatRoomResponse,
  CreateReminderRequest,
  ReminderResponse,
  UpdateReminderRequest,
  RespondReminderRequest,
  DeclineReminderRequest,
} from "./reminderType";

export const reminderApi = api
  .enhanceEndpoints({ addTagTypes: ["Reminder"] })
  .injectEndpoints({
    endpoints: (builder) => ({
      getRemindersByChatRoom: builder.query<
        FetchRemindersInChatRoomResponse,
        FetchRemindersInChatRoomRequest
      >({
        query: ({ chatRoomId, page = 1, size = 20 }) => ({
          url: `/chatrooms/${chatRoomId}/reminders`,
          method: "GET",
          params: { page, size },
        }),
        providesTags: (result, _error, { chatRoomId }) => {
          const reminderTags =
            result?.data?.map((reminder) => ({
              type: "Reminder" as const,
              id: `REMINDER_${reminder.reminderId}`,
            })) ?? [];

          return [
            { type: "Reminder" as const, id: `REMINDERS_${chatRoomId}` },
            ...reminderTags,
          ];
        },
      }),

      createReminder: builder.mutation<ReminderResponse, CreateReminderRequest>(
        {
          query: ({ chatRoomId, ...data }) => ({
            url: `/chatrooms/${chatRoomId}/reminders`,
            method: "POST",
            data,
          }),
          invalidatesTags: (_, __, { chatRoomId }) => [
            { type: "Reminder" as const, id: `REMINDERS_${chatRoomId}` },
          ],
        },
      ),

      updateReminder: builder.mutation<ReminderResponse, UpdateReminderRequest>(
        {
          query: ({ chatRoomId, reminderId, ...data }) => ({
            url: `/chatrooms/${chatRoomId}/reminders/${reminderId}`,
            method: "PUT",
            data,
          }),
          invalidatesTags: (_, __, { chatRoomId, reminderId }) => [
            { type: "Reminder" as const, id: `REMINDER_${reminderId}` },
            { type: "Reminder" as const, id: `REMINDERS_${chatRoomId}` },
          ],
        },
      ),

      respondToReminder: builder.mutation<
        ReminderResponse,
        RespondReminderRequest
      >({
        query: ({ chatRoomId, reminderId, status }) => ({
          url: `/chatrooms/${chatRoomId}/reminders/${reminderId}/rsvp`,
          method: "PUT",
          data: { status },
        }),
        invalidatesTags: (_, __, { chatRoomId, reminderId }) => [
          { type: "Reminder" as const, id: `REMINDER_${reminderId}` },
          { type: "Reminder" as const, id: `REMINDERS_${chatRoomId}` },
        ],
      }),

      declineReminder: builder.mutation<
        ReminderResponse,
        DeclineReminderRequest
      >({
        query: ({ chatRoomId, reminderId }) => ({
          url: `/chatrooms/${chatRoomId}/reminders/${reminderId}/decline`,
          method: "PUT",
        }),
        invalidatesTags: (_, __, { chatRoomId, reminderId }) => [
          { type: "Reminder" as const, id: `REMINDER_${reminderId}` },
          { type: "Reminder" as const, id: `REMINDERS_${chatRoomId}` },
        ],
      }),
    }),
  });

export const {
  useGetRemindersByChatRoomQuery,
  useCreateReminderMutation,
  useUpdateReminderMutation,
  useRespondToReminderMutation,
  useDeclineReminderMutation,
} = reminderApi;
