'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { ChatRoom } from '@/types/model';
import { useMemo, useState } from 'react';

interface TagChatroomSelectorDialogProps {
  open: boolean;
  onClose: () => void;
  onSelectedChatRoomIdsChange: (ids: number[]) => void;
  selectedChatRoomIds: number[];
  onToggleChatRoom: (roomId: number) => void;
  chatRooms: ChatRoom[];
}

export function TagChatroomSelectorDialog({
  open,
  onClose,
  onSelectedChatRoomIdsChange,
  selectedChatRoomIds,
  onToggleChatRoom,
  chatRooms
}: Readonly<TagChatroomSelectorDialogProps>) {
  const [chatRoomSearch, setChatRoomSearch] = useState('');

  const filteredChatRooms = useMemo(() => {
    const keyword = chatRoomSearch.trim().toLowerCase();

    if (!keyword) {
      return chatRooms;
    }

    return chatRooms.filter((room) => room.name?.toLowerCase().includes(keyword));
  }, [chatRooms, chatRoomSearch]);

  const handleOnchange = () => {
    onSelectedChatRoomIdsChange([]);
    setChatRoomSearch('');
    onClose();
  }

  const handleConfirm = () => {
    onClose();
    setChatRoomSearch('');
  }

  return (
    <Dialog open={open} onOpenChange={handleOnchange}>
      <DialogContent className="max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Thêm hội thoại</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Input
              value={chatRoomSearch}
              onChange={(e) => setChatRoomSearch(e.target.value)}
              placeholder="Nhập tên hội thoại"
              className="bg-accent/50 border-0 focus-visible:ring-1 rounded-lg"
            />
          </div>

          <ScrollArea className="h-72 rounded-lg border">
            <div className="p-2 space-y-1">
              {filteredChatRooms.length > 0 ? (
                filteredChatRooms.map((room) => (
                  <div
                    key={room.roomId}
                    onClick={() => onToggleChatRoom(room.roomId)}
                    className="w-full flex items-center gap-3 rounded-xl px-2 py-2 text-left hover:bg-accent/60 transition-colors cursor-pointer"
                  >
                    <Checkbox
                      checked={selectedChatRoomIds.includes(room.roomId)}
                      className="rounded-full pointer-events-none"
                    />
                    <Avatar className="h-9 w-9 border shrink-0">
                      <AvatarImage src={room.avatar || '/placeholder.svg'} alt={room.name} />
                      <AvatarFallback>{room.name?.charAt(0) || 'C'}</AvatarFallback>
                    </Avatar>
                    <div className="text-sm font-medium truncate">{room.name ?? room.roomId}</div>
                  </div>
                ))
              ) : (
                <div className="px-3 py-6 text-center text-sm text-muted-foreground">Không tìm thấy hội thoại nào</div>
              )}
            </div>
          </ScrollArea>

          <div className="flex gap-2 justify-end">
            <Button variant="outline" size="sm" onClick={handleOnchange} className="rounded-lg">
              Hủy
            </Button>
            <Button size="sm" onClick={handleConfirm} disabled={selectedChatRoomIds.length === 0} className="rounded-lg">
              Thêm ({selectedChatRoomIds.length})
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
