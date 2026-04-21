'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
// using simple div-based tabs here instead of Radix Tabs
import { X } from 'lucide-react';
import CreatePollDialog from './CreatePollDialog';

interface GroupNewsPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chatRoomId?: number;
}

export function GroupNewsPanel({ open, onOpenChange, chatRoomId }: Readonly<GroupNewsPanelProps>) {
  const [createPollOpen, setCreatePollOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('pinned');
  const tabsContainerRef = useRef<HTMLDivElement | null>(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

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

      <div className="px-2 pt-2">
        <div className="w-full">
          <div ref={tabsContainerRef} className="relative">
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
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Bình chọn</h3>
                  <Button size="sm" variant="outline" onClick={() => setCreatePollOpen(true)}>
                    Tạo bình chọn
                  </Button>
                </div>
                <div className="text-sm text-muted-foreground">Chưa có bình chọn.</div>
              </div>
            )}
          </div>
        </div>
      </div>
      <CreatePollDialog open={createPollOpen} onOpenChange={setCreatePollOpen} chatRoomId={chatRoomId} />
    </div>
  );
}

export default GroupNewsPanel;
