'use client';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { MessageResponse } from '@/types/model';
import { MessageTypeEnum } from '@/types/enum';
import { useChatRooms } from '@/app/(chat)/messages/hooks/useChatRooms';
import type { ForwardMessageSubmitResult } from '@/hooks/useChatRoomAndMessageActions';
import { Loader2, Search, X, ImageIcon, Video, Music, FileText } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { getMessagePreviewText } from '@/utils/messageUtils';
import { useUser } from '@/hooks/useUser';

interface ForwardMessageModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sourceChatRoomId: number;
  message: MessageResponse | null;
  isSubmitting?: boolean;
  onConfirm: (targetChatRoomIds: number[]) => Promise<ForwardMessageSubmitResult | null>;
}

export function ForwardMessageModal({
  open,
  onOpenChange,
  sourceChatRoomId,
  message,
  isSubmitting = false,
  onConfirm,
}: Readonly<ForwardMessageModalProps>) {
  const { isSignedIn } = useUser();
  const { chatRooms, isLoading, isError } = useChatRooms({ isSignedIn });
  const [keyword, setKeyword] = useState('');
  const [selectedRoomIds, setSelectedRoomIds] = useState<number[]>([]);

  const filteredRooms = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();

    return chatRooms.filter((room) => {
      if (room.roomId === sourceChatRoomId) {
        return false;
      }

      if (!normalizedKeyword) {
        return true;
      }

      return room.name.toLowerCase().includes(normalizedKeyword);
    });
  }, [chatRooms, keyword, sourceChatRoomId]);

  const selectedRooms = useMemo(() => {
    const selectedSet = new Set(selectedRoomIds);
    return chatRooms.filter((room) => selectedSet.has(room.roomId));
  }, [chatRooms, selectedRoomIds]);

  const previewContent = useMemo(() => {
    if (!message) {
      return {
        text: 'Không có tin nhắn để chuyển tiếp.',
        Icon: FileText,
      };
    }

    const Icon = message.isHidden
      ? FileText
      : message.messageType === MessageTypeEnum.IMAGE
        ? ImageIcon
        : message.messageType === MessageTypeEnum.VIDEO
          ? Video
          : message.messageType === MessageTypeEnum.AUDIO
            ? Music
            : FileText;

    return {
      text: getMessagePreviewText(message, 60),
      Icon,
    };
  }, [message]);

  const toggleRoomSelection = (chatRoomId: number) => {
    if (isSubmitting) return;
    setSelectedRoomIds((prev) => {
      const isSelected = prev.includes(chatRoomId);
      return isSelected ? prev.filter((id) => id !== chatRoomId) : [...prev, chatRoomId];
    });
  };

  const handleSubmit = async () => {
    if (!message || selectedRoomIds.length === 0 || isSubmitting) {
      return;
    }

    const result = await onConfirm(selectedRoomIds);

    if (!result) {
      return;
    }

    if (result.failedCount > 0) {
      if (result.failedTargetChatRoomIds.length > 0) {
        const failedSet = new Set(result.failedTargetChatRoomIds);
        setSelectedRoomIds((prev) => prev.filter((id) => failedSet.has(id)));
      }
      return;
    }

    setKeyword('');
    setSelectedRoomIds([]);
    onOpenChange(false);
  };

  const handleDialogOpenChange = (nextOpen: boolean) => {
    if (isSubmitting) {
      return;
    }

    if (!nextOpen) {
      setKeyword('');
      setSelectedRoomIds([]);
    }

    onOpenChange(nextOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogContent className="sm:max-w-xl rounded-xl">
        <DialogHeader>
          <DialogTitle>Chuyển tiếp tin nhắn</DialogTitle>
          <DialogDescription>Chọn một hoặc nhiều cuộc trò chuyện đích để chuyển tiếp.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-xl border bg-muted/30 p-3 space-y-2">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Xem trước</p>
            <div className="flex items-center gap-2">
              <previewContent.Icon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              <p className="text-sm text-foreground leading-relaxed line-clamp-2 wrap-break-word">
                {previewContent.text}
              </p>
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="Tìm cuộc trò chuyện..."
              className="pl-9 rounded-xl"
              disabled={isSubmitting}
            />
          </div>

          {selectedRooms.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedRooms.map((room) => (
                <Badge
                  key={room.roomId}
                  variant="outline"
                  onClick={() => toggleRoomSelection(room.roomId)}
                  className="inline-flex items-center gap-1 rounded-full border bg-background px-3 py-1 text-xs max-w-full"
                >
                  <span className="truncate max-w-[180px]">{room.name}</span>
                  <X className="h-3 w-3" />
                </Badge>
              ))}
            </div>
          )}

          <ScrollArea className="h-[300px] rounded-xl border">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : isError ? (
              <div className="text-center py-8 text-destructive">Không thể tải danh sách cuộc trò chuyện</div>
            ) : filteredRooms.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">Không tìm thấy cuộc trò chuyện phù hợp</div>
            ) : (
              <div className="space-y-1 p-2">
                {filteredRooms.map((room) => {
                  const isSelected = selectedRoomIds.includes(room.roomId);
                  const previewText = room.lastMessagePreview || 'Chưa có tin nhắn';

                  return (
                    <div
                      key={room.roomId}
                      className={cn(
                        'w-full rounded-xl border p-3 flex items-center gap-3 text-left transition-colors',
                        isSelected ? 'border-primary bg-primary/5' : 'border-transparent hover:bg-accent/50',
                      )}
                      onClick={() => toggleRoomSelection(room.roomId)}
                    >
                      <Checkbox checked={isSelected} className="pointer-events-none shrink-0" />

                      <Avatar className="h-10 w-10 border shrink-0">
                        <AvatarImage src={room.avatar || '/placeholder.svg'} alt={room.name} />
                        <AvatarFallback>{room.name.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>

                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{room.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{previewText}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>

          <Button
            className="w-full rounded-xl"
            onClick={handleSubmit}
            disabled={!message || selectedRoomIds.length === 0 || isSubmitting}
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {selectedRoomIds.length > 0 ? `Chuyển tiếp (${selectedRoomIds.length})` : 'Chuyển tiếp'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
