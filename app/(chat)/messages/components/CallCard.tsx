import { cn } from '@/lib/utils';
import { CallEndReasonEnum } from '@/types/enum';
import type { MessageCallContext } from '@/types/model';
import { formatDateTime } from '@/utils/formatDate';
import { Clock3, Phone, PhoneMissed, PhoneOff, UserMinus, WifiOff } from 'lucide-react';

interface CallCardProps {
  callContext?: MessageCallContext | null;
  isOwn: boolean;
}

const formatDuration = (durationSeconds?: number | null, endReason?: CallEndReasonEnum | null): string => {
  const safeDuration = Math.max(0, durationSeconds ?? 0);

  if (safeDuration === 0 && (endReason === CallEndReasonEnum.NO_ANSWER || endReason === CallEndReasonEnum.TIMEOUT)) {
    return 'Chưa kết nối';
  }

  const hours = Math.floor(safeDuration / 3600);
  const minutes = Math.floor((safeDuration % 3600) / 60);
  const seconds = safeDuration % 60;

  if (hours > 0) {
    return `${hours} giờ ${minutes} phút ${seconds} giây`;
  }

  if (minutes > 0) {
    return `${minutes} phút ${seconds} giây`;
  }

  return `${seconds} giây`;
};

const getReasonMeta = (endReason?: CallEndReasonEnum | null) => {
  switch (endReason) {
    case CallEndReasonEnum.NO_ANSWER:
      return {
        icon: PhoneMissed,
        title: 'Cuộc gọi nhỡ',
        description: 'Không có người trả lời',
      };
    case CallEndReasonEnum.TIMEOUT:
      return {
        icon: Clock3,
        title: 'Cuộc gọi hết thời gian chờ',
        description: 'Kết nối không phản hồi',
      };
    case CallEndReasonEnum.REMOVED:
      return {
        icon: UserMinus,
        title: 'Cuộc gọi đã kết thúc',
        description: 'Phiên gọi dừng do thay đổi thành viên',
      };
    case CallEndReasonEnum.NETWORK_ERROR:
      return {
        icon: WifiOff,
        title: 'Cuộc gọi bị gián đoạn',
        description: 'Kết thúc do lỗi mạng',
      };
    case CallEndReasonEnum.HANGUP:
      return {
        icon: PhoneOff,
        title: 'Cuộc gọi đã kết thúc',
        description: 'Một thành viên đã ngắt máy',
      };
    default:
      return {
        icon: Phone,
        title: 'Thông tin cuộc gọi',
        description: 'Phiên gọi đã hoàn tất',
      };
  }
};

export default function CallCard({ callContext, isOwn }: Readonly<CallCardProps>) {
  const reasonMeta = getReasonMeta(callContext?.endReason);
  const ReasonIcon = reasonMeta.icon;
  const endedAtLabel = callContext?.endedAt ? formatDateTime(callContext.endedAt) : 'Không xác định';
  const durationLabel = formatDuration(callContext?.durationSeconds, callContext?.endReason);

  return (
    <div
      className={cn(
        'w-full max-w-sm rounded-2xl border bg-card/95 p-4 shadow-sm',
        isOwn ? 'border-primary/40' : 'border-border',
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
            isOwn ? 'bg-primary/10 text-primary' : 'bg-muted text-foreground',
          )}
        >
          <ReasonIcon className="h-5 w-5" />
        </div>

        <div className="min-w-0 flex-1 space-y-1">
          <p className="text-sm font-semibold text-foreground">{reasonMeta.title}</p>
          <p className="text-xs text-muted-foreground">{reasonMeta.description}</p>
        </div>
      </div>

      <div className="mt-4 space-y-2 rounded-xl bg-muted/40 p-3">
        <div className="flex items-center justify-between gap-3 text-xs">
          <span className="text-muted-foreground">Thời lượng</span>
          <span className="text-right font-medium text-foreground">{durationLabel}</span>
        </div>
        <div className="flex items-center justify-between gap-3 text-xs">
          <span className="text-muted-foreground">Kết thúc lúc</span>
          <span className="text-right font-medium text-foreground">{endedAtLabel}</span>
        </div>
      </div>
    </div>
  );
}
