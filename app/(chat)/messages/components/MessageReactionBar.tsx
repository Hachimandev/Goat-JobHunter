"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MessageReactionUsersDialog } from "./MessageReactionUsersDialog";

interface UserReactionInfo {
  accountId: number;
  fullName: string;
  username: string;
  avatar: string;
  reactedAt: string;
}

interface ReactionGroup {
  emoji: string;
  count: number;
  users: UserReactionInfo[];
}

interface MessageReactionBarProps {
  reactions: ReactionGroup[];
  currentUserId?: number;
  onReactionClick: (emoji: string) => void;
}

export function MessageReactionBar({ reactions, currentUserId, onReactionClick }: MessageReactionBarProps) {
  const [selected, setSelected] = useState<string | null>(null);

  if (!reactions?.length) return null;

  const visible = reactions.slice(0, 5);

  return (
    <>
      <div className="flex items-center gap-1 mt-1 flex-wrap">
        {visible.map((group) => {
          const hasOwnReaction = group.users.some((u) => u.accountId === currentUserId);
          return (
            <Button
              key={group.emoji}
              variant="outline"
              size="sm"
              className={`h-6 px-2 text-xs rounded-full gap-1 ${
                hasOwnReaction
                  ? "bg-primary/10 border-primary/30 text-primary"
                  : "bg-muted/50 border-border"
              }`}
              onClick={() =>
                hasOwnReaction
                  ? onReactionClick(group.emoji)
                  : setSelected(group.emoji)
              }
            >
              <span>{group.emoji}</span>
              <span className="font-medium">{group.count}</span>
            </Button>
          );
        })}
        {reactions.length > 5 && (
          <span className="text-xs text-muted-foreground px-1">
            +{reactions.length - 5}
          </span>
        )}
      </div>
      <MessageReactionUsersDialog
        open={selected !== null}
        onOpenChange={(open) => !open && setSelected(null)}
        emoji={selected || ""}
        users={reactions.find((r) => r.emoji === selected)?.users || []}
      />
    </>
  );
}
