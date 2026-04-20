'use client';

import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { CHAT_ROOM_SIDEBAR_SCROLL_BOTTOM_THRESHOLD } from '@/constants/constant';
import { Loader2, Search } from 'lucide-react';
import { ChatRoomItem } from '@/app/(chat)/messages/components/ChatRoomItem';
import { SearchUsersModal } from '@/app/(chat)/messages/components/SearchUsersModal';
import { useUser } from '@/hooks/useUser';
import { useInfiniteChatRoomsSidebar } from '@/app/(chat)/messages/hooks/useInfiniteChatRoomsSidebar';
import { useRouter, useParams } from 'next/navigation';
import ErrorMessage from '@/components/common/ErrorMessage';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CreateChatTriggerButton } from '@/app/(chat)/messages/components/CreateChatTriggerButton';
import { subscribeToChatRoom } from '@/services/chatRoom/message/messageApi';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserPopup } from '@/app/(main)/components';

export function Sidebar() {
  const { user: currentUser } = useUser();
  const {
    chatRooms,
    isLoading,
    isError,
    refetch,
    unreadCountsMap,
    refetchUnreadMessages,
    hasMore,
    isFetchingNext,
    loadMoreChatRooms,
  } = useInfiniteChatRoomsSidebar({
    isSignedIn: !!currentUser,
    accountId: currentUser?.accountId ?? null,
  });
  const router = useRouter();
  const params = useParams();
  const activeChatRoomId = params?.id as string | undefined;
  const scrollAreaContainerRef = useRef<HTMLDivElement | null>(null);
  const scrollViewportRef = useRef<HTMLDivElement | null>(null);
  const subscribedRoomIdsRef = useRef<Set<number>>(new Set());

  const [directChatModalOpen, setDirectChatModalOpen] = useState(false);
  const [groupChatModalOpen, setGroupChatModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');

  const handleSidebarScroll = useCallback(() => {
    const viewport = scrollViewportRef.current;

    if (!viewport || !hasMore || isFetchingNext) {
      return;
    }

    const distanceToBottom = viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight;

    if (distanceToBottom > CHAT_ROOM_SIDEBAR_SCROLL_BOTTOM_THRESHOLD) {
      return;
    }

    void loadMoreChatRooms();
  }, [hasMore, isFetchingNext, loadMoreChatRooms]);

  const allChatRooms = useMemo(() => chatRooms ?? [], [chatRooms]);
  const unreadChatRoomsList = useMemo(() => {
    if (!allChatRooms || allChatRooms.length === 0) return [];
    return allChatRooms.filter((cr) => (unreadCountsMap.get(cr.roomId) || 0) !== 0);
  }, [allChatRooms, unreadCountsMap]);
  const roomsToShow = useMemo(
    () => (activeTab === 'all' ? allChatRooms : unreadChatRoomsList),
    [activeTab, allChatRooms, unreadChatRoomsList],
  );

  useEffect(() => {
    const viewport = scrollAreaContainerRef.current?.querySelector(
      '[data-slot="scroll-area-viewport"]',
    ) as HTMLDivElement | null;

    if (!viewport) {
      return;
    }

    scrollViewportRef.current = viewport;
    viewport.addEventListener('scroll', handleSidebarScroll, { passive: true });

    return () => {
      viewport.removeEventListener('scroll', handleSidebarScroll);
    };
  }, [handleSidebarScroll]);

  useEffect(() => {
    subscribedRoomIdsRef.current = new Set();
  }, [currentUser?.accountId]);

  useEffect(() => {
    if (!currentUser || !chatRooms) {
      return;
    }

    chatRooms.forEach((chatRoom) => {
      if (!subscribedRoomIdsRef.current.has(chatRoom.roomId)) {
        subscribeToChatRoom(chatRoom.roomId);
        subscribedRoomIdsRef.current.add(chatRoom.roomId);
      }
    });
  }, [currentUser, chatRooms]);

  if (!currentUser) return null;

  const handleSelectConversation = async (id: number) => {
    router.push(`/messages/${id}`);

    if (refetch) await refetch();
    if (refetchUnreadMessages) await refetchUnreadMessages();
  };

  return (
    <div className="h-full flex flex-col bg-card overflow-hidden">
      <div className="px-3 h-16 flex items-center justify-between border-b shrink-0 gap-2">
        <UserPopup />
        <div className="relative cursor-pointer sm:hidden lg:block" onClick={() => setDirectChatModalOpen(true)}>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Tìm người dùng..."
            className="pl-9 bg-accent/50 border-0 focus-visible:ring-1 rounded-full cursor-pointer w-72"
            readOnly
          />
        </div>
        <div className="flex items-center gap-2">
          <CreateChatTriggerButton mode="direct" onClick={() => setDirectChatModalOpen(true)} />
          <CreateChatTriggerButton mode="group" onClick={() => setGroupChatModalOpen(true)} />
        </div>
      </div>

      <div className="px-3 my-3 w-full">
        <Tabs defaultValue={activeTab} className="">
          <TabsList className="w-full rounded-xl">
            <TabsTrigger value="all" onClick={() => setActiveTab('all')} className="cursor-pointer rounded-xl">
              Tất cả
            </TabsTrigger>
            <TabsTrigger value="unread" onClick={() => setActiveTab('unread')} className="cursor-pointer rounded-xl">
              Chưa đọc
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex-1 min-h-0 px-2" ref={scrollAreaContainerRef}>
        <ScrollArea className="h-full">
          <div className="space-y-1 pb-4">
            {isLoading && (
              <>
                {Array.from({ length: 5 }, () => crypto.randomUUID()).map((value) => (
                  <div key={value} className="flex items-center gap-3 p-3">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))}
              </>
            )}

            {isError && <ErrorMessage message={'Có lỗi xảy ra khi tải các đoạn chat. Vui lòng thử lại sau.'} />}

            {!isLoading && !isError && roomsToShow.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                {
                  <p>
                    {activeTab === 'unread'
                      ? 'Không có cuộc trò chuyện nào chưa đọc'
                      : 'Bạn chưa có cuộc trò chuyện nào'}
                  </p>
                }
                {activeTab === 'all' && <p className="text-sm mt-1">Nhấn nút + để bắt đầu</p>}
              </div>
            )}

            {!isLoading &&
              !isError &&
              roomsToShow.map((chatRoom) => (
                <ChatRoomItem
                  key={chatRoom.roomId}
                  chatRoom={chatRoom}
                  unreadMessagesCount={unreadCountsMap.get(chatRoom.roomId) || 0}
                  active={activeChatRoomId === String(chatRoom.roomId)}
                  onClick={() => handleSelectConversation(chatRoom.roomId)}
                />
              ))}

            {isFetchingNext && (
              <div className="flex justify-center py-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      <SearchUsersModal open={directChatModalOpen} onOpenChange={setDirectChatModalOpen} mode="single" />
      <SearchUsersModal open={groupChatModalOpen} onOpenChange={setGroupChatModalOpen} mode="multi" />
    </div>
  );
}
