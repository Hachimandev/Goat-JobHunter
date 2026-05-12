"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

interface UserReactionInfo {
  accountId: number;
  fullName: string;
  username: string;
  avatar: string;
  reactedAt: string;
}

interface MessageReactionUsersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  emoji: string;
  users: UserReactionInfo[];
}

export function MessageReactionUsersDialog({ open, onOpenChange, emoji, users }: MessageReactionUsersDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-2xl">{emoji}</span>
            People who reacted
          </DialogTitle>
        </DialogHeader>
        <div className="max-h-80 overflow-y-auto">
          {users.map((user) => (
            <div
              key={user.accountId}
              className="flex items-center gap-3 py-2 px-3 hover:bg-muted/50 rounded-lg"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.avatar || "/placeholder.svg"} />
                <AvatarFallback>
                  {user.fullName[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user.fullName}</p>
                <p className="text-xs text-muted-foreground">@{user.username}</p>
              </div>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(user.reactedAt), {
                  addSuffix: true,
                  locale: vi,
                })}
              </span>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
