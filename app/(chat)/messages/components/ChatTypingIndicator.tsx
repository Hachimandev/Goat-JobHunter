import { TypingIndicatorParticipant } from '@/services/chatRoom/typing/typingIndicatorRuntime';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface ChatTypingIndicatorProps {
  typingParticipants: TypingIndicatorParticipant[];
}

const getDisplayName = (participant: TypingIndicatorParticipant) => participant.username || 'Ai đó';

const getInitials = (participant: TypingIndicatorParticipant) => {
  const name = getDisplayName(participant).trim();

  if (!name) {
    return 'A';
  }

  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase();
};

function TypingAvatar({ participant }: { participant: TypingIndicatorParticipant }) {
  return (
    <Avatar className="size-6 border border-background shadow-sm">
      <AvatarImage src={participant.avatar || '/placeholder.svg'} alt={getDisplayName(participant)} />
      <AvatarFallback className="text-[10px] font-semibold">{getInitials(participant)}</AvatarFallback>
    </Avatar>
  );
}

export function ChatTypingIndicator({ typingParticipants }: ChatTypingIndicatorProps) {
  if (typingParticipants.length === 0) {
    return null;
  }

  const firstParticipant = typingParticipants[0];
  const visibleParticipants = typingParticipants.slice(0, 2);
  const extraCount = typingParticipants.length - visibleParticipants.length;
  const label =
    extraCount > 0
      ? `${getDisplayName(firstParticipant)} và ${extraCount} người khác`
      : getDisplayName(firstParticipant);

  return (
    <div className="flex items-center gap-2 px-4 pb-2 pt-1 text-xs text-muted-foreground">
      <div className="flex items-center gap-1 rounded-full border border-border/70 bg-muted/70 px-3 py-1.5 shadow-sm">
        <div className="flex items-center pl-0.5">
          <div className="flex -space-x-2">
            {visibleParticipants.map((participant) => (
              <TypingAvatar key={participant.accountId} participant={participant} />
            ))}
            {extraCount > 0 ? (
              <div className="flex size-6 items-center justify-center rounded-full border border-background bg-background text-[10px] font-semibold text-foreground shadow-sm">
                +{extraCount}
              </div>
            ) : null}
          </div>
        </div>
        <span className="font-medium text-foreground/90">{label}</span>
        <span>đang soạn tin</span>
        <span className="flex items-center gap-1 pl-1" aria-hidden="true">
          <span
            className={cn('h-1.5 w-1.5 rounded-full bg-current animate-bounce')}
            style={{ animationDelay: '0ms' }}
          />
          <span
            className={cn('h-1.5 w-1.5 rounded-full bg-current animate-bounce')}
            style={{ animationDelay: '120ms' }}
          />
          <span
            className={cn('h-1.5 w-1.5 rounded-full bg-current animate-bounce')}
            style={{ animationDelay: '240ms' }}
          />
        </span>
      </div>
    </div>
  );
}
