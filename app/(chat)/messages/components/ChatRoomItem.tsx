import { ChatRoom, Tag as TagType } from '@/types/model';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, X, Brain, Loader2, MoreHorizontal, ChevronRight, Tag, Check } from 'lucide-react';
import { useLazyGetUnreadMessagesSummaryQuery } from '@/services/ai/conversationApi';
import { useAssignTagByRoomMutation, useRemoveTagMutation } from '@/services/tag/tagApi';
import { ChatRoomType } from '@/types/enum';
import { formatActivityTime, formatLastMessageTime } from '@/utils/formatDate';
import { cn } from '@/lib/utils';
import { useMemo, useState, useEffect } from 'react';
import { truncate } from 'lodash';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toast } from 'sonner';
import { usePresenceStatus } from '@/hooks/usePresenceStatus';

interface ConversationItemProps {
  chatRoom: ChatRoom;
  active: boolean;
  onClick: () => void;
  unreadMessagesCount: number;
  tags: TagType[];
  assignedTag: TagType | null;
}

export function ChatRoomItem({
  chatRoom,
  active,
  onClick,
  unreadMessagesCount,
  tags,
  assignedTag,
}: Readonly<ConversationItemProps>) {
  const isGroup = chatRoom.type === ChatRoomType.GROUP;
  const isDissolved = Boolean(chatRoom.deletedAt && chatRoom.type === ChatRoomType.GROUP);
  const presence = usePresenceStatus(!isGroup ? chatRoom.counterpartAccountId : null);

  const chatRoomTitle = chatRoom.name;
  const avatarFallback = chatRoomTitle.charAt(0).toUpperCase();
  const formattedTime = formatLastMessageTime(chatRoom.lastMessageTime);
  const activityTime = formatActivityTime(presence?.lastHeartbeatAt);
  const isOnline = presence?.online;
  const hasActivity = activityTime?.length > 0;


  const unreadBadgeText = useMemo(() => {
    if (unreadMessagesCount <= 0) return null;
    if (unreadMessagesCount < 10) return `${unreadMessagesCount}`;
    return '9+';
  }, [unreadMessagesCount]);

  const [assignTagByRoom, { isLoading: isAssigningTag }] = useAssignTagByRoomMutation();
  const [removeTag, { isLoading: isRemovingTag }] = useRemoveTagMutation();
  const [triggerUnreadSummary, { data: unreadSummaryData, isLoading: isSummaryLoading }] =
    useLazyGetUnreadMessagesSummaryQuery();

  const [aiSummaryOpen, setAiSummaryOpen] = useState(false);
  const [aiSummaryText, setAiSummaryText] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState<string | null>(null);
  const [isSummarized, setIsSummarized] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [isTagsPopoverOpen, setIsTagsPopoverOpen] = useState(false);

  /* Khi có summary trả về */
  useEffect(() => {
    const summary = unreadSummaryData?.data?.summary;

    if (!isSummaryLoading && summary) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAiSummaryText(summary);
      setLoadingMessage(null);
      setAiSummaryOpen(true);
      setIsSummarized(true);
    }
  }, [isSummaryLoading, unreadSummaryData]);

  /* Loading message theo thời gian */
  useEffect(() => {
    let t1: number | undefined;
    let t2: number | undefined;
    let t3: number | undefined;

    if (aiSummaryOpen && isSummaryLoading) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoadingMessage(null);

      t1 = window.setTimeout(() => setLoadingMessage('AI đang tóm tắt...'), 1000);

      t2 = window.setTimeout(() => setLoadingMessage('Sắp xong rồi...'), 3000);

      t3 = window.setTimeout(() => setLoadingMessage('Chà, bạn đã bỏ lỡ nhiều điều...'), 6000);
    }

    return () => {
      if (t1) clearTimeout(t1);
      if (t2) clearTimeout(t2);
      if (t3) clearTimeout(t3);
    };
  }, [aiSummaryOpen, isSummaryLoading]);

  const chatRoomPreview = useMemo(() => {
    if (!chatRoom.lastMessagePreview) {
      return 'Chưa có tin nhắn nào';
    }

    if (isGroup) {
      return `${chatRoom.name}: ${chatRoom.lastMessagePreview}`;
    }

    if (chatRoom.currentUserSentLastMessage) {
      return `Bạn: ${chatRoom.lastMessagePreview}`;
    }

    return `${chatRoomTitle}: ${chatRoom.lastMessagePreview}`;
  }, [chatRoom.currentUserSentLastMessage, chatRoom.lastMessagePreview, chatRoom.name, chatRoomTitle, isGroup]);

  const resetSummaryState = () => {
    setAiSummaryOpen(false);
    setAiSummaryText(null);
    setLoadingMessage(null);
  };

  const handleAssignTagByRoom = async (tag: TagType) => {
    try {
      await assignTagByRoom({ tagId: tag.tagId, roomId: chatRoom.roomId }).unwrap();
      toast.success(`Gán thẻ "${tag.name}" thành công`);
      setIsTagsPopoverOpen(false);
      setIsPopoverOpen(false);
    } catch {
      toast.error('Không thể gán thẻ');
    }
  };

  const handleUnassignTagByRoom = async () => {
    try {
      await removeTag({ roomId: chatRoom.roomId }).unwrap();
      toast.success(`Gỡ thẻ "${assignedTag?.name}" thành công`);
      setIsTagsPopoverOpen(false);
      setIsPopoverOpen(false);
    } catch {
      toast.error('Không thể gỡ thẻ');
    }
  };

  return (
    <>
      <button
        onClick={onClick}
        className={cn(
          'relative flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors w-full group',
          active && 'bg-accent/50',
          !active && 'hover:bg-accent/50',
        )}
      >
        <div className="relative">
          <Avatar className={cn('h-12 w-12 border', active && 'border-gray-300')}>
            <AvatarImage src={chatRoom.avatar || undefined} alt={chatRoomTitle} />
            <AvatarFallback>{avatarFallback}</AvatarFallback>
          </Avatar>

          {!isGroup  && (
            <div
              className={cn(
                'absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white',
                isOnline ? 'bg-emerald-500' : 'bg-slate-400'
              )}
              title={isOnline ? 'Đang hoạt động' : 'Chưa hoạt động'}
            />
          )}

          {!isGroup && !isOnline && hasActivity && (
            <div className="mt-1 text-xs text-muted-foreground truncate">
              {activityTime}
            </div>)
          }

          {isGroup && !isDissolved && (
            <div className="absolute -bottom-1 -right-1 bg-primary rounded-full p-1">
              <Users className="h-3 w-3 text-primary-foreground" />
            </div>
          )}

          {isDissolved && (
            <div className="absolute -bottom-1 -right-1 bg-rose-600 rounded-full p-1" title="Nhóm đã giải tán">
              <X className="h-3 w-3 text-white" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <div className="flex items-center min-w-0 gap-2">
              <span className="font-medium truncate">{chatRoomTitle}</span>

              {isDissolved && (
                <span className="text-xs text-rose-600 font-medium whitespace-nowrap">Nhóm đã giải tán</span>
              )}
            </div>

            <div className="flex items-center gap-2 relative group">
              {formattedTime && (
                <span className="text-xs text-muted-foreground transition-opacity duration-200 group-hover:opacity-0">
                  {formattedTime}
                </span>
              )}

              <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                <PopoverTrigger asChild>
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="p-1 opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer absolute top-0 right-1"
                    title="Tùy chọn"
                  >
                    <MoreHorizontal className="h-4 w-4 text-primary" />
                  </div>
                </PopoverTrigger>

                <PopoverContent align="end" className="w-40 p-0 overflow-hidden rounded-2xl">
                  <Popover open={isTagsPopoverOpen} onOpenChange={setIsTagsPopoverOpen}>
                    <PopoverTrigger asChild>
                      <div
                        className="flex gap-1 justify-between cursor-pointer items-center hover:bg-accent transition p-2"
                        onMouseEnter={() => setIsTagsPopoverOpen(true)}
                        onMouseLeave={() => setIsTagsPopoverOpen(false)}
                      >
                        <div className="text-sm text-start font-semibold rounded-xl flex-1">Phân loại</div>
                        <ChevronRight className="h-4 w-4 text-sm font-semibold" />
                      </div>
                    </PopoverTrigger>
                    <PopoverContent
                      side="right"
                      align="start"
                      className="w-48 p-0 max-h-60 overflow-y-auto rounded-2xl"
                      onMouseEnter={() => setIsTagsPopoverOpen(true)}
                      onMouseLeave={() => setIsTagsPopoverOpen(false)}
                    >
                      {tags && tags.length - 1 > 0 ? (
                        <div className="flex flex-col gap-1">
                          {tags.map(
                            (tag) =>
                              tag.name !== 'Người lạ' && (
                                <button
                                  key={tag.tagId}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (assignedTag?.tagId === tag.tagId) {
                                      handleUnassignTagByRoom();
                                    } else {
                                      handleAssignTagByRoom(tag);
                                    }
                                  }}
                                  disabled={isAssigningTag || isRemovingTag}
                                  className="flex items-center gap-2 p-2 text-sm rounded-xl hover:bg-accent transition text-start w-full disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer justify-between"
                                >
                                  <div className="flex items-center gap-2">
                                    <Tag className={`h-4 w-4 shrink-0 stroke-4`} style={{ color: `${tag.color}` }} />
                                    <span className="truncate font-semibold">{tag.name}</span>
                                  </div>
                                  {assignedTag?.tagId === tag.tagId && (
                                    <Check className="h-4 w-4 shrink-0 stroke-4 text-primary" />
                                  )}
                                  {(isAssigningTag || isRemovingTag) && (
                                    <Loader2 className="h-3 w-3 animate-spin ml-auto shrink-0" />
                                  )}
                                </button>
                              ),
                          )}
                        </div>
                      ) : (
                        <div className="px-3 py-2 text-sm text-muted-foreground text-center">Không có thẻ nào</div>
                      )}
                    </PopoverContent>
                  </Popover>
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <div className="flex justify-between items-center gap-2">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <p
                className={cn(
                  'text-sm truncate text-start min-w-0',
                  isDissolved && 'text-muted-foreground italic',
                  unreadBadgeText && 'text-muted-foreground font-bold',
                )}
              >
                {truncate(chatRoomPreview, { length: 30 })}
              </p>

              {assignedTag && (
                <div className="flex flex-wrap items-center gap-1 min-w-0">
                  <span
                    className="inline-flex items-center rounded-full px-2 py-0.5 text-[12px] font-semibold text-white shrink-0"
                    style={{ backgroundColor: assignedTag?.color || '#999' }}
                    title={assignedTag?.name}
                  >
                    <span className="max-w-20 truncate">{assignedTag?.name}</span>
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              {unreadBadgeText && <Badge>{unreadBadgeText}</Badge>}

              {unreadMessagesCount >= 10 && !isSummarized && (
                <span
                  role="button"
                  title="AI tóm tắt"
                  onClick={(e) => {
                    e.stopPropagation();

                    if (!isSummaryLoading) {
                      setAiSummaryOpen(true);
                      setAiSummaryText(null);
                      setLoadingMessage('AI đang phân tích tin nhắn...');

                      triggerUnreadSummary({
                        id: chatRoom.roomId,
                      });
                    }
                  }}
                  className={cn(
                    'p-1 rounded-full',
                    isSummaryLoading ? 'bg-primary/20 cursor-not-allowed' : 'hover:bg-primary/70 cursor-pointer',
                  )}
                >
                  {isSummaryLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  ) : (
                    <Brain className="h-5 w-5 text-primary" />
                  )}
                </span>
              )}
            </div>
          </div>
        </div>
      </button>

      {aiSummaryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={resetSummaryState}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

          <div
            onClick={(e) => e.stopPropagation()}
            className="relative z-50 w-[min(92%,42rem)] max-w-xl rounded-2xl bg-popover border shadow-xl overflow-hidden animate-in fade-in zoom-in-95"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Brain className="h-5 w-5 text-primary" />
                </div>

                <div className="font-semibold text-sm">AI Tóm tắt tin nhắn chưa đọc</div>
              </div>

              <button
                onClick={resetSummaryState}
                className="p-1.5 rounded-lg hover:bg-accent transition cursor-pointer"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>

            {/* Body */}
            <div className="px-5 py-4 max-h-[60vh] overflow-y-auto">
              {isSummaryLoading || loadingMessage ? (
                <div className="flex flex-col items-center justify-center gap-3 py-6">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />

                  <div className="text-sm text-muted-foreground text-center">
                    {loadingMessage || 'AI đang phân tích tin nhắn...'}
                  </div>
                </div>
              ) : (
                <div className="text-sm whitespace-pre-line leading-relaxed bg-muted/40 p-4 rounded-xl border">
                  {aiSummaryText ?? 'Không có nội dung tóm tắt'}
                </div>
              )}
            </div>

            {/* Footer */}
            {!isSummaryLoading && (
              <div className="flex justify-end px-5 py-3 border-t bg-muted/30">
                <button
                  onClick={resetSummaryState}
                  className="px-3 py-1.5 text-sm rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition cursor-pointer"
                >
                  Đóng
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
