import { useCountUnreadMessagesByCurrentAccountQuery, useFetchChatRoomsQuery } from '@/services/chatRoom/chatRoomApi';
import { ChatRoom } from '@/types/model';

type UseChatRoomsOptions = {
  page?: number;
  size?: number;
  isSignedIn?: boolean;
};

export function useChatRooms(options: UseChatRoomsOptions = {}) {
  const { page = 1, size = 50, isSignedIn } = options;

  const { data, isLoading, isError, refetch } = useFetchChatRoomsQuery(
    {
      page,
      size,
    },
    {
      skip: !isSignedIn,
    },
  );
  const chatRooms: ChatRoom[] = data?.data?.result || [];
  const total = data?.data?.meta?.total || 0;

  const {
    data: unreadMessagesData,
    isLoading: isUnreadMessagesLoading,
    isError: isUnreadMessagesError,
    refetch: refetchUnreadMessages,
  } = useCountUnreadMessagesByCurrentAccountQuery(
    {
      page,
      size,
    },
    {
      skip: !isSignedIn,
    },
  );
  const unreadCountsMap = new Map<number, number>();
  unreadMessagesData?.data?.forEach((item) => {
    unreadCountsMap.set(item.chatRoomId, item.unreadCount);
  });

  return {
    chatRooms,
    total,
    unreadCountsMap,

    isLoading,
    isError,
    refetch,
    isUnreadMessagesLoading,
    isUnreadMessagesError,
    refetchUnreadMessages,
  };
}
