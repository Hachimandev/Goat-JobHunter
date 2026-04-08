import { useFetchChatRoomsQuery } from '@/services/chatRoom/chatRoomApi';
import { ChatRoom } from '@/types/model';

type UseChatRoomsOptions = {
  page?: number;
  size?: number;
};

export function useChatRooms(options: UseChatRoomsOptions = {}) {
  const { page = 1, size = 50 } = options;

  const { data, isLoading, isError, refetch } = useFetchChatRoomsQuery({
    page,
    size,
  });

  const chatRooms: ChatRoom[] = data?.data?.result || [];
  const total = data?.data?.meta?.total || 0;

  return {
    chatRooms,
    total,
    isLoading,
    isError,
    refetch,
  };
}
