'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Tag } from 'lucide-react';
import { ChatRoomItem } from '@/app/(chat)/messages/components/ChatRoomItem';
import { SearchUsersModal } from '@/app/(chat)/messages/components/SearchUsersModal';
import { TagManagementModal } from '@/app/(chat)/messages/components/TagManagementModal';
import { useUser } from '@/hooks/useUser';
import { useChatRooms } from '@/app/(chat)/messages/hooks/useChatRooms';
import { useAppSelector } from '@/lib/hooks';
import { useRouter, useParams } from 'next/navigation';
import ErrorMessage from '@/components/common/ErrorMessage';
import { useEffect, useState, useRef, useMemo } from 'react';
import { CreateChatTriggerButton } from '@/app/(chat)/messages/components/CreateChatTriggerButton';
import { isCompanyResponse } from '@/utils/slug';
import { MeResponse, CompanyResponse, ApplicantResponse, RecruiterResponse } from '@/types/dto';
import { subscribeToChatRoom } from '@/services/chatRoom/message/messageApi';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useFetchTagAssignmentsQuery, useFetchTagsQuery } from '@/services/tag/tagApi';
import { Tag as TagType } from '@/types/model';
import { ChatRoomType } from '@/types/enum';

export function Sidebar() {
  const { user: currentUser } = useUser();
  const { data: tagsResponse } = useFetchTagsQuery({ page: 1, size: 50 }, { skip: !currentUser });
  const { chatRooms, isLoading, isError, refetch, unreadCountsMap, refetchUnreadMessages } = useChatRooms({
    isSignedIn: !!currentUser,
  });
  const { data: tagAssignmentsResponse } = useFetchTagAssignmentsQuery(undefined, { skip: !currentUser });

  const router = useRouter();
  const params = useParams();
  const activeChatRoomId = params?.id as string | undefined;

  const [directChatModalOpen, setDirectChatModalOpen] = useState(false);
  const [groupChatModalOpen, setGroupChatModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');
  const [tagPopoverOpen, setTagPopoverOpen] = useState(false);
  const [tagManagementModalOpen, setTagManagementModalOpen] = useState(false);
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);

  const allChatRooms = useMemo(() => chatRooms ?? [], [chatRooms]);
  const unreadChatRoomsList = useMemo(() => {
    if (!allChatRooms || allChatRooms.length === 0) return [];
    return allChatRooms.filter((cr) => (unreadCountsMap.get(cr.roomId) || 0) !== 0);
  }, [allChatRooms, unreadCountsMap]);

  const tabsContainerRef = useRef<HTMLDivElement | null>(null);
  const allBtnRef = useRef<HTMLButtonElement | null>(null);
  const unreadBtnRef = useRef<HTMLButtonElement | null>(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const friendshipPairs = useAppSelector((state) => state.friendship.pairs);
  const tags = useMemo(() => tagsResponse?.data?.result ?? [], [tagsResponse]);
  const tagOptions = useMemo(() => [...tags], [tags]);
  const strangerTagIds = useMemo(() => tags.filter((tag) => tag.name === 'Người lạ').map((tag) => tag.tagId), [tags]);
  const friendAccountIds = useMemo(() => {
    return new Set(
      Object.values(friendshipPairs)
        .filter((pair) => pair.relationshipState === 'FRIEND')
        .map((pair) => pair.targetAccountId),
    );
  }, [friendshipPairs]);
  const assignedTagsByRoomId = useMemo(() => {
    const assignments = tagAssignmentsResponse?.data ?? [];
    const tagById = new Map(tags.map((tag) => [tag.tagId, tag]));
    const roomTagsMap = new Map<number, TagType>();

    assignments.forEach((assignment) => {
      const matchedTag = tagById.get(assignment.tagId);
      const normalizedTag = matchedTag ?? {
        tagId: assignment.tagId,
        name: assignment.tagName,
        color: assignment.tagColor,
        systemTag: assignment.systemTag,
      };

      roomTagsMap.set(assignment.roomId, normalizedTag);
    });

    return roomTagsMap;
  }, [tags, tagAssignmentsResponse]);

  const roomsToShow = useMemo(() => {
    const baseRooms = activeTab === 'all' ? allChatRooms : unreadChatRoomsList;

    if (selectedTagIds.length === 0) {
      return baseRooms;
    }

    const isStrangerTagSelected = selectedTagIds.some((tagId) => strangerTagIds.includes(tagId));

    return baseRooms.filter((chatRoom) => {
      const roomTags = assignedTagsByRoomId.get(chatRoom.roomId) ?? null;
      const matchesAssignedTag = roomTags && selectedTagIds.includes(roomTags.tagId);

      const isStrangerRoom =
        chatRoom.type === ChatRoomType.DIRECT && !friendAccountIds.has(chatRoom.counterpartAccountId);

      return matchesAssignedTag || (isStrangerTagSelected && isStrangerRoom);
    });
  }, [
    activeTab,
    allChatRooms,
    assignedTagsByRoomId,
    friendAccountIds,
    unreadChatRoomsList,
    selectedTagIds,
    strangerTagIds,
  ]);

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

  const handleToggleTag = (tagId: number) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((currentTagId) => currentTagId !== tagId) : [...prev, tagId],
    );
  };

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

      <div className="px-3 pt-2 pb-1 flex items-center justify-between gap-3">
        <div ref={tabsContainerRef} className="relative min-w-0">
          <div className="flex items-center gap-2 relative z-10">
            <button
              ref={allBtnRef}
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1 cursor-pointer font-bold transition-colors ${activeTab === 'all' ? 'text-primary' : 'text-muted-foreground'}`}
            >
              Tất cả
            </button>
            <button
              ref={unreadBtnRef}
              onClick={() => setActiveTab('unread')}
              className={`px-3 py-1 cursor-pointer font-bold transition-colors ${activeTab === 'unread' ? 'text-primary' : 'text-muted-foreground'}`}
            >
              Chưa đọc
            </button>
          </div>
          <div
            className="absolute bottom-0 h-0.5 bg-primary rounded-full transition-all duration-200"
            style={{ left: indicatorStyle.left + 'px', width: indicatorStyle.width + 'px' }}
          />
        </div>

        <Popover open={tagPopoverOpen} onOpenChange={setTagPopoverOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 rounded-full px-3 gap-2 shrink-0 hover:bg-primary/50">
              <Tag className="h-4 w-4 text-primary" />
            </Button>
          </PopoverTrigger>

          <PopoverContent
            align="start"
            side="right"
            sideOffset={10}
            className="w-[320px] p-0 overflow-hidden rounded-2xl"
          >
            <div className="flex items-center justify-between p-2">
              <div className="text-sm font-semibold">Thẻ phân loại</div>
            </div>

            <Separator />

            <div className="max-h-72 overflow-y-auto px-2">
              {tagOptions.length > 0 ? (
                tagOptions.map((tag) => {
                  const isSelected = selectedTagIds.includes(tag.tagId);

                  return (
                    <div
                      key={tag.tagId}
                      onClick={() => handleToggleTag(tag.tagId)}
                      className="flex w-full items-center gap-3 rounded-xl p-2 text-left transition-colors hover:bg-accent cursor-pointer my-2"
                    >
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => handleToggleTag(tag.tagId)}
                        onClick={(event) => event.stopPropagation()}
                        className="shrink-0 cursor-pointer"
                      />
                      <Tag className={`h-4 w-4 shrink-0 stroke-4`} style={{ color: `${tag.color}` }} />
                      <span className="flex-1 text-sm font-semibold">{tag.name}</span>
                    </div>
                  );
                })
              ) : (
                <div className="px-3 py-6 text-center text-sm text-muted-foreground">Chưa có thẻ phân loại nào</div>
              )}
            </div>

            <Separator />

            <button
              type="button"
              onClick={() => {
                setTagPopoverOpen(false);
                setTagManagementModalOpen(true);
              }}
              className="w-full px-4 py-3 text-left text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground cursor-pointer"
            >
              Quản lý thẻ phân loại
            </button>
          </PopoverContent>
        </Popover>
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
                assignedTag={assignedTagsByRoomId.get(chatRoom.roomId) ?? null}
                tags={tags}
              />
            ))}
        </div>
      </ScrollArea>

      <SearchUsersModal open={directChatModalOpen} onOpenChange={setDirectChatModalOpen} mode="single" />
      <SearchUsersModal open={groupChatModalOpen} onOpenChange={setGroupChatModalOpen} mode="multi" />
      <TagManagementModal
        open={tagManagementModalOpen}
        onOpenChange={setTagManagementModalOpen}
        chatRooms={roomsToShow}
      />
    </div>
  );
}
