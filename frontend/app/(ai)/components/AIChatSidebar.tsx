'use client';

import { Loader2, Menu, SquarePen } from 'lucide-react';
import { useCallback, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  useSidebar,
} from '@/components/ui/sidebar';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader } from '@/components/ui/empty';
import LoaderSpin from '@/components/common/LoaderSpin';
import ErrorMessage from '@/components/common/ErrorMessage';
import { AI_CONVERSATION_PAGE_SIZE } from '@/constants/constant';
import { useGetConversationsQuery } from '@/services/ai/conversationApi';
import { useConversationActions } from '@/hooks/useConversationActions';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { useUser } from '@/hooks/useUser';
import ConversationList from '@/app/(ai)/components/ConversationList';

export function AIChatSidebar() {
  const { open, setOpen } = useSidebar();
  const { user, isSignedIn } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const [page, setPage] = useState(1);
  const requestedPagesRef = useRef<Set<number>>(new Set([1]));

  const shouldSkipConversationQuery = !user || !isSignedIn || !open;

  const { data, isLoading, isFetching, isError } = useGetConversationsQuery(
    {
      page,
      size: AI_CONVERSATION_PAGE_SIZE,
    },
    {
      skip: shouldSkipConversationQuery,
    },
  );

  const {
    isPinning,
    isDeleting,
    isUpdating,
    handleCreateConversation,
    handleTogglePin,
    handleDeleteConversation,
    handleUpdateConversation,
  } = useConversationActions();

  const resetPagination = useCallback(() => {
    requestedPagesRef.current = new Set([1]);
    setPage(1);
  }, []);

  const activeConversationId = useMemo(() => {
    const conversationPath = pathname.match(/\/chat\/conversation\/(\d+)/);
    if (!conversationPath?.[1]) {
      return null;
    }

    const parsedId = Number(conversationPath[1]);
    return Number.isNaN(parsedId) ? null : parsedId;
  }, [pathname]);

  const conversations = useMemo(() => data?.data?.result || [], [data]);
  const hasMore = useMemo(() => {
    const totalPages = data?.data?.meta?.pages ?? 1;
    return page < totalPages;
  }, [data, page]);

  const createConversation = async () => {
    try {
      const result = await handleCreateConversation();

      if (result?.data?.conversationId) {
        resetPagination();
        router.push(`/chat/conversation/${result.data.conversationId}`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleRenameConversation = async (conversationId: number, newTitle: string) => {
    const response = await handleUpdateConversation(conversationId, newTitle);
    if (response?.data) {
      resetPagination();
    }
  };

  const handleTogglePinConversation = async (conversationId: number, isPinned: boolean) => {
    const response = await handleTogglePin(conversationId, isPinned);
    if (response?.data) {
      resetPagination();
    }
  };

  const handleDeleteConversationAndRefresh = async (conversationId: number) => {
    const deleted = await handleDeleteConversation(conversationId);
    if (!deleted) {
      return;
    }

    resetPagination();

    if (activeConversationId === conversationId) {
      router.push('/chat');
    }
  };

  const loadMoreConversations = useCallback(() => {
    if (shouldSkipConversationQuery || isFetching || !hasMore) {
      return;
    }

    setPage((prevPage) => {
      const nextPage = prevPage + 1;
      if (requestedPagesRef.current.has(nextPage)) {
        return prevPage;
      }

      requestedPagesRef.current.add(nextPage);
      return nextPage;
    });
  }, [hasMore, isFetching, shouldSkipConversationQuery]);

  const { targetRef } = useInfiniteScroll({
    onLoadMore: loadMoreConversations,
    hasMore,
    isLoading: isFetching,
    rootMargin: '160px',
  });

  const pinnedConversations = conversations.filter((conversation) => conversation.pinned);
  const unpinnedConversations = conversations.filter((conversation) => !conversation.pinned);

  const messageError: string = useMemo(() => {
    if (!user || !isSignedIn) {
      return 'Vui lòng đăng nhập để xem các cuộc trò chuyện của bạn.';
    }

    return 'Đã có lỗi xảy ra khi tải các cuộc trò chuyện. Vui lòng thử lại sau.';
  }, [isSignedIn, user]);

  return (
    <Sidebar collapsible="icon" className="border-sidebar-border">
      <SidebarHeader className="p-2">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => setOpen(!open)} className="rounded-full">
            <Menu className="w-5 h-5" />
          </Button>
          {open && user && isSignedIn && (
            <Button
              variant="ghost"
              size="icon"
              onClick={createConversation}
              className="rounded-full ml-auto"
              title={'Tạo cuộc trò chuyện mới'}
            >
              <SquarePen className="w-5 h-5" />
            </Button>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarGroup>
          {open && (
            <div className="space-y-2">
              {isLoading && page === 1 && <LoaderSpin />}

              {isError && (
                <ErrorMessage message={messageError} variant={'compact'} className={'rounded-xl'} showIcon={false} />
              )}

              {pinnedConversations.length > 0 && (
                <>
                  <ConversationList
                    conversations={pinnedConversations}
                    activeConversationId={activeConversationId}
                    isLoading={isPinning || isDeleting || isUpdating}
                    handleTogglePin={handleTogglePinConversation}
                    handleDelete={handleDeleteConversationAndRefresh}
                    handleRename={handleRenameConversation}
                  />
                  <Separator />
                </>
              )}

              <ConversationList
                conversations={unpinnedConversations}
                activeConversationId={activeConversationId}
                isLoading={isPinning || isDeleting || isUpdating}
                handleTogglePin={handleTogglePinConversation}
                handleDelete={handleDeleteConversationAndRefresh}
                handleRename={handleRenameConversation}
              />

              {isFetching && page > 1 && (
                <div className="flex justify-center py-2">
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                </div>
              )}

              {hasMore && !isFetching && user && isSignedIn && <div ref={targetRef} className="h-4 w-full" />}
            </div>
          )}

          {user && isSignedIn && !open && (
            <div className="flex flex-col items-center gap-2">
              <Button variant="ghost" size="icon" onClick={createConversation} className="rounded-lg">
                <SquarePen className="w-5 h-5" />
              </Button>
            </div>
          )}
        </SidebarGroup>

        {open && (!user || !isSignedIn) && (
          <Empty>
            <EmptyHeader>
              <EmptyDescription>Vui lòng đăng nhập để xem lịch sử trò chuyện</EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Link href={'/signin'}>
                <Button variant={'default'} className={'rounded-xl text-xs'} size={'sm'}>
                  Đăng nhập
                </Button>
              </Link>
            </EmptyContent>
          </Empty>
        )}
      </SidebarContent>

      <SidebarFooter />
    </Sidebar>
  );
}
