import { IBackendRes } from "@/types/api";
import { Reminder } from "@/types/model";
import { ReminderRepeatType, ReminderRsvpStatus } from "@/types/enum";

export type FetchRemindersInChatRoomRequest = {
  chatRoomId: number;
  page?: number;
  size?: number;
};

export type FetchRemindersInChatRoomResponse = IBackendRes<Reminder[]>;

export type CreateReminderRequest = {
  chatRoomId: number;
  title: string;
  content: string;
  reminderTime: string;
  repeatType: ReminderRepeatType;
  allowResponse: boolean;
};

export type ReminderResponse = IBackendRes<Reminder>;

export type UpdateReminderRequest = {
  chatRoomId: number;
  reminderId: number;
  title: string;
  content: string;
  reminderTime: string;
  repeatType: ReminderRepeatType;
  allowResponse: boolean;
};

export type RespondReminderRequest = {
  chatRoomId: number;
  reminderId: number;
  status: ReminderRsvpStatus;
};

export type DeclineReminderRequest = {
  chatRoomId: number;
  reminderId: number;
};
