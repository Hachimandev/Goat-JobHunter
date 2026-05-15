import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Plus, X } from 'lucide-react';
import CreatePollDialog from './CreatePollDialog';
import { useFetchPollsInChatRoomQuery } from '@/services/poll/pollApi';
import PollCard from './PollCard';
import ErrorMessage from '@/components/common/ErrorMessage';
import { PinnedMessage } from '@/types/model';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia } from '@/components/ui/empty';
import { PinOff } from 'lucide-react';
import { PinnedMessageItem } from './PinnedMessageItem';

interface GroupNewsPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chatRoomId: number;
  disableCreatePoll?: boolean;
  createPollDisabledReason?: string;
  onNavigateToMessage?: (messageId: string) => void;
  pinnedMessages: PinnedMessage[];
}

type TabValue = 'pins' | 'polls';

export function GroupNewsPanel({
  open,
  onOpenChange,
  chatRoomId,
  disableCreatePoll = false,
  createPollDisabledReason,
  onNavigateToMessage,
  pinnedMessages,
}: Readonly<GroupNewsPanelProps>) {
  const [tab, setTab] = useState<TabValue>('polls');
  const [createPollOpen, setCreatePollOpen] = useState(false);
  const tabsContainerRef = useRef<HTMLDivElement | null>(null);
  const pinsBtnRef = useRef<HTMLButtonElement | null>(null);
  const pollsBtnRef = useRef<HTMLButtonElement | null>(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

  const {
    data: polls,
    isLoading: isPollsLoading,
    isError: isPollsError,
  } = useFetchPollsInChatRoomQuery({ chatRoomId }, { skip: !chatRoomId });

  useEffect(() => {
    const updateIndicator = () => {
      const container = tabsContainerRef.current;
      const activeBtn = tab === 'pins' ? pinsBtnRef.current : pollsBtnRef.current;
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
  }, [tab]);

  return (
    <div
      className={`absolute inset-0 z-10 flex h-full min-h-0 flex-col border-l border-border bg-card transition-transform duration-300 ${
        open ? 'translate-x-0' : 'translate-x-full'
      }`}
      aria-hidden={!open}
    >
      <div className="flex h-16 flex-none items-center justify-between border-b border-border px-4">
        <h2 className="text-md font-semibold">Danh sách ghim và bình chọn</h2>
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => onOpenChange(false)}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col px-2 pt-2">
        <div ref={tabsContainerRef} className="relative min-w-0">
          <div className="flex items-center gap-2 relative z-10">
            <Button
              ref={pinsBtnRef}
              onClick={() => setTab('pins')}
              className={`px-3 py-1 cursor-pointer font-bold transition-colors bg-transparent hover:bg-transparent text-sm ${tab === 'pins' ? 'text-primary' : 'text-muted-foreground'}`}
            >
              Ghim
            </Button>
            <Button
              ref={pollsBtnRef}
              onClick={() => setTab('polls')}
              className={`px-3 py-1 cursor-pointer font-bold transition-colors bg-transparent hover:bg-transparent text-sm ${tab === 'polls' ? 'text-primary' : 'text-muted-foreground'}`}
            >
              Bình chọn
            </Button>
          </div>
          <div
            className="absolute bottom-0 h-0.5 bg-primary rounded-full transition-all duration-200"
            style={{ left: indicatorStyle.left + 'px', width: indicatorStyle.width + 'px' }}
          />
        </div>

        <div
          className="flex-1 overflow-y-auto pb-4 pt-4"
          data-scrollbar-hidden
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <style>{`
            [data-scrollbar-hidden]::-webkit-scrollbar {
              display: none;
            }
          `}</style>

          {tab === 'pins' && (
            <div className="space-y-2">
              {pinnedMessages.length === 0 ? (
                <Empty className="h-[120px]">
                  <EmptyHeader>
                    <EmptyMedia variant="icon" className="rounded-full">
                      <PinOff className="h-6 w-6 text-muted-foreground" />
                    </EmptyMedia>
                    <EmptyDescription className="max-w-md text-pretty">
                      Không có tin nhắn nào được ghim trong cuộc trò chuyện này.
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              ) : (
                <ScrollArea className="w-full h-[calc(100vh-14rem)] pr-1">
                  <div className="space-y-2 pr-2">
                    {pinnedMessages.map((message) => (
                      <PinnedMessageItem
                        key={message.messageId}
                        message={message}
                        className="p-2 hover:bg-accent/30 rounded-xl"
                        onNavigateToMessage={onNavigateToMessage ?? (() => {})}
                        readOnly={true}
                        isExpanded={true}
                        setIsExpanded={() => {}}
                      />
                    ))}
                  </div>
                </ScrollArea>
              )}
            </div>
          )}

          {tab === 'polls' && (
            <div className="flex flex-col items-center">
              {!disableCreatePoll && (
                <Button
                  size="sm"
                  className="mb-2 w-[94%] rounded-xl bg-primary text-white hover:bg-primary/90"
                  onClick={() => setCreatePollOpen(true)}
                  title={createPollDisabledReason}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Tạo bình chọn
                </Button>
              )}

              {isPollsError && (
                <ErrorMessage message="Đã xảy ra lỗi khi tải bình chọn." severity="error" variant="compact" />
              )}

              {isPollsLoading && <Loader2 className="animate-spin" />}

              {!isPollsLoading && !isPollsError && polls?.data?.length === 0 && (
                <div className="text-sm text-muted-foreground">Chưa có bình chọn nào.</div>
              )}

              {polls && polls.data && polls.data.map((poll) => <PollCard key={poll.pollId} poll={poll} />)}
            </div>
          )}
        </div>

        <CreatePollDialog
          open={createPollOpen}
          onOpenChange={setCreatePollOpen}
          chatRoomId={chatRoomId}
          disabled={disableCreatePoll}
          disabledReason={createPollDisabledReason}
        />
      </div>
    </div>
  );
}

export default GroupNewsPanel;
