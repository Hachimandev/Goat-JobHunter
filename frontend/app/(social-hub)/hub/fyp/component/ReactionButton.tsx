import { useEffect, useMemo, useState } from 'react';
import { ThumbsUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { reactionLabelMap, reactions } from '@/constants/constant';
import { toast } from 'sonner';
import { useUser } from '@/hooks/useUser';

interface ReactionButtonProps {
  initialReaction: string | null; // for post that user has already reacted
  onReactionChange: (reactionId: string | null) => void;
  totalReactions: number;
}

export function ReactionButton({
  initialReaction = null,
  onReactionChange,
  totalReactions,
}: Readonly<ReactionButtonProps>) {
  const [selectedReaction, setSelectedReaction] = useState<string | null>();
  const [open, setOpen] = useState(false);
  const { isSignedIn, user } = useUser();

  useEffect(() => {
    setSelectedReaction(initialReaction);
  }, [initialReaction]);

  const handleReactionClick = (reactionId: string) => {
    if (!isSignedIn || !user) {
      toast.error('Bạn phải đăng nhập để thực hiện chức năng này.');
      return;
    }
    const newReaction = selectedReaction === reactionId ? null : reactionId;
    setSelectedReaction(newReaction);
    setOpen(false);
    onReactionChange(newReaction);
  };

  const selectedReactionData = useMemo(() => reactions.find((r) => r.id === selectedReaction), [selectedReaction]);

  return (
    <HoverCard open={open} onOpenChange={setOpen}>
      <HoverCardTrigger asChild>
        <Button
          onClick={() => {
            if (selectedReaction) {
              setSelectedReaction(null);
              onReactionChange(null);
            } else {
              setOpen(true);
            }
          }}
          onFocus={(e) => e.preventDefault()} // Prevent open hover card when dialog is open cause the button is focused
          variant="ghost"
          size="icon"
          className="flex items-center rounded-full gap-1"
          style={{ color: selectedReactionData?.color }}
        >
          {selectedReactionData ? (
            <>
              <selectedReactionData.icon className="w-5 h-5" />
              <span>{totalReactions}</span>
            </>
          ) : (
            <>
              <ThumbsUp className="w-5 h-5" />
              <span>{totalReactions}</span>
            </>
          )}
        </Button>
      </HoverCardTrigger>
      <HoverCardContent className="w-auto p-2 rounded-full" side="top" align="start">
        <div className="flex items-center gap-2">
          {reactions.map((reaction, index) => (
            <Button
              key={reaction.id}
              onClick={() => handleReactionClick(reaction.id)}
              className={cn(
                'w-12 h-12 rounded-full flex items-center justify-center text-white transition-all duration-200 cursor-pointer',
                'hover:scale-125 active:scale-95',
                'animate-in fade-in zoom-in-50',
              )}
              title={reactionLabelMap[reaction.id as keyof typeof reactionLabelMap]}
              style={{
                backgroundColor: reaction.color,
                color: '#fff',
                animationDelay: `${index * 30}ms`,
                animationFillMode: 'both',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = reaction.hoverColor)}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = reaction.color)}
            >
              <reaction.icon className="w-5 h-5" />
            </Button>
          ))}
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
