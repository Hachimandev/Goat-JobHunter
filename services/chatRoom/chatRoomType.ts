import { IBackendRes, IModelPaginate } from "@/types/api";
import { ChatRoom, MessageType } from '@/types/model';

export type FetchChatRoomsRequest = {
  page?: number
  size?: number
}

export type FetchMessagesInChatRoomRequest = {
  chatRoomId: number
  page?: number
  size?: number
}

export type FetchChatRoomsResponse = IBackendRes<IModelPaginate<ChatRoom>>

export type FetchMessagesInChatRoomResponse = IBackendRes<MessageType[]>

export type SendMessageToChatRoomRequest = {
  chatRoomId: number
  content?: string
  files?: File[]
}

export type SendMessageToNewChatRoomRequest = {
  accountId: number
  content?: string
  files?: File[]
}