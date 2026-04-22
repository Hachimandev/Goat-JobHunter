'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
// using simple div-based tabs here instead of Radix Tabs
import { X } from 'lucide-react';
import CreatePollDialog from './CreatePollDialog';
import { useFetchPollsInChatRoomQuery } from '@/services/poll/pollApi';
import PollCard from './PollCard';

interface GroupNewsPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chatRoomId: number;
}

export function GroupNewsPanel({ open, onOpenChange, chatRoomId }: Readonly<GroupNewsPanelProps>) {
  const [createPollOpen, setCreatePollOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('pinned');
  const tabsContainerRef = useRef<HTMLDivElement | null>(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const {
    data: polls,
    isLoading: isPollsLoading,
    isError: isPollsError,
  } = useFetchPollsInChatRoomQuery({ chatRoomId }, { skip: !chatRoomId });

  console.log(polls);

  useEffect(() => {
    const updateIndicator = () => {
      const container = tabsContainerRef.current;
      if (!container) return;
      const activeEl = container.querySelector(`[data-tab="${activeTab}"]`) as HTMLElement | null;
      if (!activeEl) {
        setIndicatorStyle({ left: 0, width: 0 });
        return;
      }
      const containerRect = container.getBoundingClientRect();
      const activeRect = activeEl.getBoundingClientRect();
      setIndicatorStyle({
        left: activeRect.left - containerRect.left + container.scrollLeft,
        width: activeRect.width,
      });
    };

    const rafId = requestAnimationFrame(updateIndicator);
    window.addEventListener('resize', updateIndicator);
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', updateIndicator);
    };
  }, [activeTab, open]);

  return (
    <div
      className={`absolute inset-0 border-l border-border bg-card flex flex-col h-full min-h-0 transform transition-transform duration-300 z-10 ${
        open ? 'translate-x-0' : 'translate-x-full'
      }`}
      aria-hidden={!open}
    >
      <div className="h-16 border-b border-border flex items-center justify-between px-4 flex-none">
        <h2 className="font-semibold text-sm">Bảng tin nhóm</h2>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onOpenChange(false)}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      <div className="px-2 pt-2 flex flex-col flex-1 overflow-hidden">
        <div className="w-full flex-none">
          <div ref={tabsContainerRef} className="relative sticky top-0 bg-card z-10 -mx-2 px-2">
            <div className="grid w-full grid-cols-3">
              <div
                data-tab="pinned"
                role="tab"
                onClick={() => setActiveTab('pinned')}
                className={`cursor-pointer px-3 py-2 text-sm text-center font-bold ${
                  activeTab === 'pinned' ? 'text-primary' : ''
                }`}
              >
                Tin ghim
              </div>

              <div
                data-tab="notes"
                role="tab"
                onClick={() => setActiveTab('notes')}
                className={`cursor-pointer px-3 py-2 text-sm text-center font-bold ${
                  activeTab === 'notes' ? 'text-primary' : ''
                }`}
              >
                Ghi chú
              </div>

              <div
                data-tab="polls"
                role="tab"
                onClick={() => setActiveTab('polls')}
                className={`cursor-pointer px-3 py-2 text-sm text-center font-bold ${
                  activeTab === 'polls' ? 'text-primary' : ''
                }`}
              >
                Bình chọn
              </div>
            </div>

            <div
              className="absolute bottom-0 h-0.5 bg-primary rounded-full transition-all duration-200"
              style={{ left: indicatorStyle.left + 'px', width: indicatorStyle.width + 'px' }}
            />
          </div>
        </div>

        <div
          className="flex-1 overflow-y-auto pb-4 -mx-2"
          data-scrollbar-hidden
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
          suppressHydrationWarning
        >
          <style>{`
            [data-scrollbar-hidden]::-webkit-scrollbar {
              display: none;
            }
          `}</style>
          <div className="mt-4">
            {activeTab === 'pinned' && <div className="text-sm text-muted-foreground">Không có tin ghim.</div>}

            {activeTab === 'notes' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Ghi chú</h3>
                  <Button size="sm" variant="outline">
                    Tạo ghi chú
                  </Button>
                </div>
                <div className="text-sm text-muted-foreground">Chưa có ghi chú nào.</div>
              </div>
            )}

            {activeTab === 'polls' && (
              <div className="flex flex-col items-center justify-between">
                {isPollsLoading ? (
                  <div className="text-sm text-muted-foreground">Đang tải bình chọn...</div>
                ) : isPollsError ? (
                  <div className="text-sm text-muted-foreground">Đã xảy ra lỗi khi tải bình chọn.</div>
                ) : (
                  polls?.data &&
                  polls?.data?.length === 0 && (
                    <div className="text-sm text-muted-foreground">Chưa có bình chọn nào.</div>
                  )
                )}
                {!isPollsLoading &&
                  !isPollsError &&
                  polls &&
                  polls?.data &&
                  polls?.data?.length > 0 &&
                  polls?.data?.map((poll) => <PollCard key={poll.pollId} poll={poll} />)}
                <Button
                  size="sm"
                  variant="outline"
                  className="w-100 bg-primary text-white hover:bg-primary/90 hover:text-white rounded-xl mt-2 items-center"
                  onClick={() => setCreatePollOpen(true)}
                >
                  Tạo bình chọn
                </Button>
              </div>
            )}
          </div>
        </div>
        <CreatePollDialog open={createPollOpen} onOpenChange={setCreatePollOpen} chatRoomId={chatRoomId} />
      </div>
    </div>
  );
}
export default GroupNewsPanel;
