'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Search } from 'lucide-react';
import { ChatRoomItem } from '@/app/(chat)/messages/components/ChatRoomItem';
import { SearchUsersModal } from '@/app/(chat)/messages/components/SearchUsersModal';
import { useUser } from '@/hooks/useUser';
import { useChatRooms } from '@/app/(chat)/messages/hooks/useChatRooms';
import { useRouter, useParams } from 'next/navigation';
import ErrorMessage from '@/components/common/ErrorMessage';
import { useEffect, useState, useRef, useMemo } from 'react';
import { CreateChatTriggerButton } from '@/app/(chat)/messages/components/CreateChatTriggerButton';
import { isCompanyResponse } from '@/utils/slug';
import { MeResponse, CompanyResponse, ApplicantResponse, RecruiterResponse } from '@/types/dto';
import { subscribeToChatRoom } from '@/services/chatRoom/message/messageApi';

export function Sidebar() {
  const { user: currentUser } = useUser();
  const { chatRooms, isLoading, isError, refetch, unreadCountsMap, refetchUnreadMessages } = useChatRooms({
    isSignedIn: !!currentUser,
  });
  const router = useRouter();
  const params = useParams();
  const activeChatRoomId = params?.id as string | undefined;

  const [directChatModalOpen, setDirectChatModalOpen] = useState(false);
  const [groupChatModalOpen, setGroupChatModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');

  const allChatRooms = useMemo(() => chatRooms ?? [], [chatRooms]);
  const unreadChatRoomsList = useMemo(() => {
    if (!allChatRooms || allChatRooms.length === 0) return [];
    return allChatRooms.filter((cr) => (unreadCountsMap.get(cr.roomId) || 0) !== 0);
  }, [allChatRooms, unreadCountsMap]);
  const roomsToShow = useMemo(
    () => (activeTab === 'all' ? allChatRooms : unreadChatRoomsList),
    [activeTab, allChatRooms, unreadChatRoomsList],
  );

  const tabsContainerRef = useRef<HTMLDivElement | null>(null);
  const allBtnRef = useRef<HTMLDivElement | null>(null);
  const unreadBtnRef = useRef<HTMLDivElement | null>(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

  useEffect(() => {
    const updateIndicator = () => {
      const container = tabsContainerRef.current;
      const activeBtn = activeTab === 'all' ? allBtnRef.current : unreadBtnRef.current;
      if (!container || !activeBtn) return;
      const containerRect = container.getBoundingClientRect();
      const btnRect = activeBtn.getBoundingClientRect();
      setIndicatorStyle({
        left: btnRect.left - containerRect.left + container.scrollLeft,
        width: btnRect.width,
      });
    };

    requestAnimationFrame(updateIndicator);
    window.addEventListener('resize', updateIndicator);
    return () => window.removeEventListener('resize', updateIndicator);
  }, [activeTab, allChatRooms.length, unreadChatRoomsList.length]);

  useEffect(() => {
    if (currentUser && chatRooms) {
      chatRooms.forEach((chatRoom) => {
        subscribeToChatRoom(chatRoom.roomId);
      });
    }
  }, [currentUser, chatRooms]);

  if (!currentUser) return null;

  const handleSelectConversation = async (id: number) => {
    router.push(`/messages/${id}`);

    if (refetch) await refetch();
    if (refetchUnreadMessages) await refetchUnreadMessages();
  };

  const displayName =
    currentUser && isCompanyResponse(currentUser as MeResponse)
      ? (currentUser as CompanyResponse).name
      : (currentUser as ApplicantResponse | RecruiterResponse)?.fullName || 'User';
  const displayImage =
    currentUser && isCompanyResponse(currentUser as MeResponse)
      ? (currentUser as CompanyResponse).logo
      : (currentUser as ApplicantResponse | RecruiterResponse)?.avatar;

  return (
    <div className="h-full flex flex-col bg-card overflow-hidden">
      <div className="px-3 h-16 flex items-center justify-between border-b shrink-0 gap-2">
        <Avatar className="h-10 w-10 border">
          <AvatarImage src={displayImage || '/placeholder.svg'} alt={displayName} />
          <AvatarFallback>{displayName.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="relative cursor-pointer" onClick={() => setDirectChatModalOpen(true)}>
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

      <div className="px-3">
        <div ref={tabsContainerRef} className="relative">
          <div className="flex items-center gap-2 relative z-10">
            <div
              ref={allBtnRef}
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1 cursor-pointer font-bold ${activeTab === 'all' ? 'text-primary' : ''}`}
            >
              Tất cả
            </div>
            <div
              ref={unreadBtnRef}
              onClick={() => setActiveTab('unread')}
              className={`px-3 py-1 cursor-pointer font-bold ${activeTab === 'unread' ? 'text-primary' : ''}`}
            >
              Chưa đọc
            </div>
          </div>
          <div
            className="absolute bottom-0 h-0.5 bg-primary rounded-full transition-all duration-200"
            style={{ left: indicatorStyle.left + 'px', width: indicatorStyle.width + 'px' }}
          />
        </div>
      </div>

      <ScrollArea className="flex-1 min-h-0 px-2">
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
                  {activeTab === 'unread' ? 'Không có cuộc trò chuyện nào chưa đọc' : 'Bạn chưa có cuộc trò chuyện nào'}
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
        </div>
      </ScrollArea>

      <SearchUsersModal open={directChatModalOpen} onOpenChange={setDirectChatModalOpen} mode="single" />
      <SearchUsersModal open={groupChatModalOpen} onOpenChange={setGroupChatModalOpen} mode="multi" />
    </div>
  );
}
