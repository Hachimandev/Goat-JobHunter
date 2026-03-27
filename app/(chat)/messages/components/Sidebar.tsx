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
import { useState } from 'react';
import { CreateChatTriggerButton } from '@/app/(chat)/messages/components/CreateChatTriggerButton';
import { isCompanyResponse } from '@/utils/slug';
import { MeResponse, CompanyResponse, ApplicantResponse, RecruiterResponse } from '@/types/dto';

export function Sidebar() {
  const { user: currentUser } = useUser();
  const { chatRooms, isLoading, isError } = useChatRooms();
  const router = useRouter();
  const params = useParams();
  const activeChatRoomId = params?.id as string | undefined;

  const [directChatModalOpen, setDirectChatModalOpen] = useState(false);
  const [groupChatModalOpen, setGroupChatModalOpen] = useState(false);

  if (!currentUser) return null;

  const handleSelectConversation = (id: number) => {
    router.push(`/messages/${id}`);
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
      <div className="px-4 h-16 flex items-center justify-between border-b shrink-0">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border">
            <AvatarImage src={displayImage || '/placeholder.svg'} alt={displayName} />
            <AvatarFallback>{displayName.charAt(0)}</AvatarFallback>
          </Avatar>
          <span className="font-semibold text-lg">Chats</span>
        </div>

        <div className="flex items-center gap-2">
          <CreateChatTriggerButton mode="direct" onClick={() => setDirectChatModalOpen(true)} />
          <CreateChatTriggerButton mode="group" onClick={() => setGroupChatModalOpen(true)} />
        </div>
      </div>

      <div className="p-2 shrink-0">
        <div className="relative cursor-pointer" onClick={() => setDirectChatModalOpen(true)}>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Tìm người dùng..."
            className="pl-9 bg-accent/50 border-0 focus-visible:ring-1 rounded-full cursor-pointer"
            readOnly
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

          {!isLoading && !isError && chatRooms.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p>Chưa có cuộc trò chuyện nào</p>
              <p className="text-sm mt-1">Nhấn nút + để bắt đầu</p>
            </div>
          )}

          {!isLoading &&
            !isError &&
            chatRooms.map((chatRoom) => (
              <ChatRoomItem
                key={chatRoom.roomId}
                chatRoom={chatRoom}
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
