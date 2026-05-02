import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Loader2, Plus, X } from 'lucide-react';
import CreatePollDialog from './CreatePollDialog';
import { useFetchPollsInChatRoomQuery } from '@/services/poll/pollApi';
import PollCard from './PollCard';
import ErrorMessage from '@/components/common/ErrorMessage';

interface GroupNewsPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chatRoomId: number;
  disableCreatePoll?: boolean;
  createPollDisabledReason?: string;
}

type TabValue = 'notes' | 'polls';

export function GroupNewsPanel({
  open,
  onOpenChange,
  chatRoomId,
  disableCreatePoll = false,
  createPollDisabledReason,
}: Readonly<GroupNewsPanelProps>) {
  const [tab, setTab] = useState<TabValue>('polls');
  const [createPollOpen, setCreatePollOpen] = useState(false);

  const {
    data: polls,
    isLoading: isPollsLoading,
    isError: isPollsError,
  } = useFetchPollsInChatRoomQuery({ chatRoomId }, { skip: !chatRoomId });

  return (
    <div
      className={`absolute inset-0 z-10 flex h-full min-h-0 flex-col border-l border-border bg-card transition-transform duration-300 ${
        open ? 'translate-x-0' : 'translate-x-full'
      }`}
      aria-hidden={!open}
    >
      <div className="flex h-16 flex-none items-center justify-between border-b border-border px-4">
        <h2 className="text-sm font-semibold">Bảng tin nhóm</h2>
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => onOpenChange(false)}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col px-2 pt-2">
        <Tabs
          defaultValue={tab}
          onValueChange={(value) => setTab(value as TabValue)}
          className="flex min-h-0 flex-1 flex-col"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="notes">Ghi chú</TabsTrigger>
            <TabsTrigger value="polls">Bình chọn</TabsTrigger>
          </TabsList>

          <div
            className="flex-1 overflow-y-auto pb-4"
            data-scrollbar-hidden
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            <style>{`
              [data-scrollbar-hidden]::-webkit-scrollbar {
                display: none;
              }
            `}</style>

            <TabsContent value="notes" className="mt-4 space-y-2">
              <ErrorMessage message="Tính năng ghi chú đang được phát triển." severity="info" variant="compact" />
            </TabsContent>

            <TabsContent value="polls" className="mt-4 flex flex-col items-center">
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
            </TabsContent>
          </div>
        </Tabs>

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
