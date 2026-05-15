import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, CalendarDays, ChevronDown, Clock3, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ReminderRsvpStatus } from '@/types/enum';
import { Reminder, ReminderParticipant } from '@/types/model';
import { useRespondToReminderMutation } from '@/services/chatRoom/reminder/reminderApi';
import { toast } from 'sonner';
import { formatReminderTime, getDateBlock } from '@/utils/formatDate';
import { useUser } from '@/hooks/useUser';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface ReminderCardProps {
  reminder: Reminder;
  chatRoomId: number;
}

export function ReminderCard({ reminder, chatRoomId }: Readonly<ReminderCardProps>) {
  const { user } = useUser();
  const [respondToReminder, { isLoading: isResponding }] = useRespondToReminderMutation();

  const [isChangingResponse, setIsChangingResponse] = useState(false);
  const [isParticipantDialogOpen, setIsParticipantDialogOpen] = useState(false);
  const [activeParticipantTab, setActiveParticipantTab] = useState<'accepted' | 'rejected'>('accepted');
  const tabsContainerRef = useRef<HTMLDivElement | null>(null);
  const acceptedBtnRef = useRef<HTMLButtonElement | null>(null);
  const rejectedBtnRef = useRef<HTMLButtonElement | null>(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const [userResponse, setUserResponse] = useState<ReminderRsvpStatus>(() => {
    return reminder.participants.find((r) => r.accountId === user?.accountId)?.status || ReminderRsvpStatus.PENDING;
  });

  const [participants, setParticipants] = useState(reminder.participants || []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setParticipants(reminder.participants || []);
    setUserResponse(
      reminder.participants.find((r) => r.accountId === user?.accountId)?.status || ReminderRsvpStatus.PENDING,
    );
  }, [reminder.participants, user?.accountId]);

  const acceptedParticipants = useMemo(
    () => participants.filter((p) => p.status === ReminderRsvpStatus.ACCEPTED),
    [participants],
  );
  const rejectedParticipants = useMemo(
    () => participants.filter((p) => p.status === ReminderRsvpStatus.REJECTED),
    [participants],
  );

  const getRepeatTypeLabel = (repeatType: string) => {
    const labels: Record<string, string> = {
      NONE: 'Không lặp lại',
      DAILY: 'Hàng ngày',
      WEEKLY: 'Hàng tuần',
      MONTHLY: 'Hàng tháng',
      YEARLY: 'Hàng năm',
    };
    return labels[repeatType] || repeatType;
  };

  const getResponseLabel = (status: ReminderRsvpStatus) => {
    switch (status) {
      case ReminderRsvpStatus.ACCEPTED:
        return 'Tham gia';
      case ReminderRsvpStatus.REJECTED:
        return 'Không tham gia';
      default:
        return 'Chưa phản hồi';
    }
  };

  const dateBlock = getDateBlock(reminder.reminderTime);

  useEffect(() => {
    if (!isParticipantDialogOpen) return;

    const updateIndicator = () => {
      const container = tabsContainerRef.current;
      const activeBtn = activeParticipantTab === 'accepted' ? acceptedBtnRef.current : rejectedBtnRef.current;
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
  }, [activeParticipantTab, isParticipantDialogOpen, acceptedParticipants.length, rejectedParticipants.length]);

  const handleChangeResponse = async (status: ReminderRsvpStatus) => {
    try {
      await respondToReminder({
        chatRoomId,
        reminderId: reminder.reminderId,
        status,
      }).unwrap();
      setParticipants((prev) => {
        const idx = prev.findIndex((p) => p.accountId === user?.accountId);
        const updated = [...prev];
        if (idx >= 0) {
          updated[idx] = { ...updated[idx], status } as (typeof updated)[number];
        } else {
          updated.push({
            accountId: user?.accountId || 0,
            username: user?.username || 'Bạn',
            avatar: null,
            status,
          } as ReminderParticipant);
        }
        return updated;
      });
      setUserResponse(status);
      setIsChangingResponse(false);
      toast.success('Đã cập nhật xác nhận nhắc hẹn');
    } catch (error) {
      console.error('Error responding to reminder:', error);
      toast.error('Không thể cập nhật trạng thái');
    }
  };

  return (
    <Card className="w-full overflow-hidden rounded-2xl border border-border bg-card p-0 shadow-sm transition-shadow hover:shadow-md">
      <div className="gap-3 p-3">
        <div className="min-w-0 flex gap-3">
          <div className="flex w-[70px] shrink-0 flex-col overflow-hidden rounded-xl border border-border bg-muted/20 text-center">
            <div className="bg-primary px-2 py-1 text-[11px] font-medium text-primary-foreground">
              {dateBlock.weekday}
            </div>
            <div className="flex flex-1 flex-col items-center justify-center py-2">
              <div className="text-2xl font-bold leading-none text-foreground">{dateBlock.day}</div>
              <div className="mt-1 text-xs font-medium text-muted-foreground">Tháng {dateBlock.month}</div>
            </div>
          </div>

          <div className="space-y-1">
            <h3 className="truncate text-sm font-semibold text-foreground">{reminder.title}</h3>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock3 className="h-3.5 w-3.5 shrink-0" />
              <span>{formatReminderTime(reminder.reminderTime)}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <CalendarDays className="h-3.5 w-3.5 shrink-0" />
              <span>{getRepeatTypeLabel(reminder.repeatType)}</span>
            </div>

            <Button
              type="button"
              variant="ghost"
              className="h-auto p-0 text-xs font-medium text-primary hover:bg-transparent hover:text-primary/80"
              onClick={() => setIsParticipantDialogOpen(true)}
            >
              <span className="inline-flex items-center gap-2">
                <span className="inline-flex items-center gap-1">
                  <span>Tham gia</span>
                  <span className="inline-flex min-w-5 items-center justify-center rounded-xl bg-primary/15 px-1.5 py-0.5 text-[11px] font-semibold text-primary">
                    {acceptedParticipants.length}
                  </span>
                </span>
                <span className="inline-flex items-center gap-1">
                  <span>Từ chối</span>
                  <span className="inline-flex min-w-5 items-center justify-center rounded-xl bg-muted px-1.5 py-0.5 text-[11px] font-semibold text-muted-foreground">
                    {rejectedParticipants.length}
                  </span>
                </span>
              </span>
            </Button>
          </div>
        </div>

        <div className="mt-3 rounded-xl bg-muted/40 px-3 py-2">
          {!isChangingResponse ? (
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2 text-sm">
                <Check className="h-4 w-4 shrink-0 text-primary" />
                <span className="truncate text-muted-foreground font-bold">
                  Bạn xác nhận: {getResponseLabel(userResponse)}.
                </span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-auto shrink-0 px-0 text-sm font-medium text-primary hover:bg-transparent hover:text-primary/80"
                onClick={() => setIsChangingResponse(true)}
                disabled={!reminder.allowResponse || isResponding}
              >
                {reminder.allowResponse ? 'Thay đổi' : 'Bắt buộc'}
              </Button>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                variant={userResponse === ReminderRsvpStatus.ACCEPTED ? 'default' : 'outline'}
                className="rounded-xl"
                disabled={isResponding}
                onClick={() => handleChangeResponse(ReminderRsvpStatus.ACCEPTED)}
              >
                <Check className="mr-1 h-4 w-4" />
                Tham gia
              </Button>
              <Button
                type="button"
                size="sm"
                variant={userResponse === ReminderRsvpStatus.REJECTED ? 'destructive' : 'outline'}
                className="rounded-xl"
                disabled={isResponding}
                onClick={() => handleChangeResponse(ReminderRsvpStatus.REJECTED)}
              >
                <X className="mr-1 h-4 w-4" />
                Không tham gia
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="rounded-xl"
                onClick={() => setIsChangingResponse(false)}
              >
                <ChevronDown className="mr-1 h-4 w-4" />
                Đóng
              </Button>
            </div>
          )}
        </div>
      </div>

      <Dialog open={isParticipantDialogOpen} onOpenChange={setIsParticipantDialogOpen}>
        <DialogContent className="max-w-md rounded-xl p-0 gap-0 overflow-hidden">
          <DialogHeader className="p-4 border-b border-border">
            <DialogTitle className="text-md">Xác nhận</DialogTitle>
          </DialogHeader>

          <div ref={tabsContainerRef} className="relative border-b border-border px-4">
            <div className="flex items-center gap-4 relative z-10">
              <button
                ref={acceptedBtnRef}
                type="button"
                onClick={() => setActiveParticipantTab('accepted')}
                className={`px-2 py-2 cursor-pointer font-bold transition-colors text-sm ${
                  activeParticipantTab === 'accepted' ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                <span className="inline-flex items-center gap-1.5">
                  <span>Tham gia</span>
                  <span
                    className={`inline-flex min-w-5 items-center justify-center rounded-xl px-1.5 py-0.5 text-[11px] font-semibold ${
                      activeParticipantTab === 'accepted'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {acceptedParticipants.length}
                  </span>
                </span>
              </button>
              <button
                ref={rejectedBtnRef}
                type="button"
                onClick={() => setActiveParticipantTab('rejected')}
                className={`px-2 py-2 cursor-pointer font-bold transition-colors text-sm ${
                  activeParticipantTab === 'rejected' ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                <span className="inline-flex items-center gap-1.5">
                  <span>Từ chối</span>
                  <span
                    className={`inline-flex min-w-5 items-center justify-center rounded-xl px-1.5 py-0.5 text-[11px] font-semibold ${
                      activeParticipantTab === 'rejected'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {rejectedParticipants.length}
                  </span>
                </span>
              </button>
            </div>
            <div
              className="absolute bottom-0 h-0.5 bg-primary rounded-full transition-all duration-200"
              style={{ left: indicatorStyle.left + 'px', width: indicatorStyle.width + 'px' }}
            />
          </div>

          {activeParticipantTab === 'accepted' && (
            <div className="m-0 p-4 min-h-40">
              {acceptedParticipants.length === 0 ? (
                <div className="text-sm text-muted-foreground">Chưa có ai xác nhận tham gia.</div>
              ) : (
                <div className="space-y-3">
                  {acceptedParticipants.map((participant) => (
                    <div key={participant.accountId} className="flex items-center gap-3">
                      <Avatar className="h-8 w-8 border border-border">
                        <AvatarImage src={participant.avatar || '/placeholder.svg'} alt={participant.username} />
                        <AvatarFallback>{participant.username?.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">{participant.username}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeParticipantTab === 'rejected' && (
            <div className="m-0 p-4 min-h-40">
              {rejectedParticipants.length === 0 ? (
                <div className="text-sm text-muted-foreground">Chưa có ai từ chối.</div>
              ) : (
                <div className="space-y-3">
                  {rejectedParticipants.map((participant) => (
                    <div key={participant.accountId} className="flex items-center gap-3">
                      <Avatar className="h-8 w-8 border border-border">
                        <AvatarImage src={participant.avatar || '/placeholder.svg'} alt={participant.username} />
                        <AvatarFallback>{participant.username?.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">{participant.username}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}

export default ReminderCard;
