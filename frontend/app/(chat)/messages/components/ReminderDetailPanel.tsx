import { Button } from '@/components/ui/button';
import { Plus, X, Bell } from 'lucide-react';
import ReminderCard from './ReminderCard';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia } from '@/components/ui/empty';
import { Reminder } from '@/types/model';
import { useReminderFormState } from '@/app/(chat)/messages/hooks/useReminderFormState';

interface ReminderDetailPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chatRoomId: number;
  reminders: Reminder[];
  reminderFormState: ReturnType<typeof useReminderFormState>;
}

export function ReminderDetailPanel({
  open,
  onOpenChange,
  chatRoomId,
  reminders,
  reminderFormState,
}: Readonly<ReminderDetailPanelProps>) {
  const { openCreateReminder, openEditReminder } = reminderFormState;

  return (
    <div
      className={`absolute inset-0 z-10 flex h-full min-h-0 flex-col border-l border-border bg-card transition-transform duration-300 ${
        open ? 'translate-x-0' : 'translate-x-full'
      }`}
      aria-hidden={!open}
    >
      <div className="flex h-16 flex-none items-center justify-between border-b border-border px-4">
        <h2 className="text-md font-semibold">Danh sách nhắc hẹn</h2>
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => onOpenChange(false)}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col px-2 pt-2">
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

          <div className="flex flex-col items-center">
            <Button
              size="sm"
              className="mb-4 w-[94%] rounded-xl bg-primary text-white hover:bg-primary/90"
              onClick={openCreateReminder}
            >
              <Plus className="h-4 w-4 mr-1" />
              Tạo nhắc hẹn
            </Button>

            {reminders.length === 0 && (
              <Empty className="h-[120px]">
                <EmptyHeader>
                  <EmptyMedia variant="icon" className="rounded-full">
                    <Bell className="h-6 w-6 text-muted-foreground" />
                  </EmptyMedia>
                  <EmptyDescription className="max-w-md text-pretty">
                    Không có nhắc hẹn nào trong cuộc trò chuyện này.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            )}

            {reminders && reminders.length > 0 && (
              <ScrollArea className="w-full h-[calc(100vh-14rem)] pr-1">
                <div className="space-y-2 px-2">
                  {reminders.map((reminder) => (
                    <ReminderCard
                      key={reminder.reminderId}
                      reminder={reminder}
                      chatRoomId={chatRoomId}
                      onEditReminder={openEditReminder}
                    />
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReminderDetailPanel;
