import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Ellipsis, MessageSquare, Pin, PinOff, Pencil, Trash2 } from 'lucide-react';
import { AIConversation } from '@/services/ai/conversationType';
import Link from 'next/link';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import RenameConversationDialog from '@/app/(ai)/components/RenameConversationDialog';

interface ConversationCardProps {
  conv: AIConversation;
  isActive?: boolean;
  handleTogglePin: (conversationId: number, isPinned: boolean) => void;
  handleRename: (conversationId: number, newName: string) => void;
  handleDelete: (conversationId: number) => void;
  isLoading: boolean;
}

const ConversationCard = ({
  conv,
  isActive = false,
  handleTogglePin,
  handleRename,
  handleDelete,
  isLoading,
}: ConversationCardProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showRenameDialog, setShowRenameDialog] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const handleConfirmDelete = () => {
    handleDelete(conv.conversationId);
    setShowDeleteDialog(false);
    setIsPopoverOpen(false);
  };

  const handleConfirmRename = (newTitle: string) => {
    handleRename(conv.conversationId, newTitle);
    setIsPopoverOpen(false);
  };

  return (
    <>
      <div
        key={conv.conversationId}
        className={`group relative flex items-center gap-2 px-3 py-2 rounded-xl transition-colors ${isActive ? 'bg-muted text-foreground' : 'hover:bg-muted/80'}`}
      >
        <Link href={`/chat/conversation/${conv.conversationId}`} className={'flex items-center gap-2 flex-1 min-w-0'}>
          {!conv.pinned && <MessageSquare className="w-4 h-4 shrink-0 text-muted-foreground" />}
          {conv.pinned && <Pin className="w-4 h-4 shrink-0 text-muted-foreground" />}
          <span className="flex-1 truncate text-sm">{conv.title}</span>
        </Link>
        <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={`h-6 w-6 transition-opacity ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
              disabled={isLoading}
            >
              <Ellipsis className="w-4 h-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-48 p-1 rounded-xl shadow-lg"
            align="start"
            side="right"
            onClick={(e) => e.preventDefault()}
          >
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-2 h-8 px-2"
              onClick={(e) => {
                e.preventDefault();
                setShowRenameDialog(true);
                setIsPopoverOpen(false);
              }}
            >
              <Pencil className="w-4 h-4" />
              <span className="text-sm">Đổi tên</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-2 h-8 px-2"
              onClick={(e) => {
                e.preventDefault();
                handleTogglePin(conv.conversationId, conv.pinned);
                setIsPopoverOpen(false);
              }}
            >
              {conv.pinned ? (
                <>
                  <PinOff className="w-4 h-4" />
                  <span className="text-sm">Bỏ ghim</span>
                </>
              ) : (
                <>
                  <Pin className="w-4 h-4" />
                  <span className="text-sm">Ghim</span>
                </>
              )}
            </Button>

            <Separator className="my-1" />

            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-2 h-8 px-2 text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={(e) => {
                e.preventDefault();
                setShowDeleteDialog(true);
              }}
            >
              <Trash2 className="w-4 h-4" />
              <span className="text-sm">Xóa</span>
            </Button>
          </PopoverContent>
        </Popover>
      </div>

      <RenameConversationDialog
        open={showRenameDialog}
        onOpenChange={setShowRenameDialog}
        currentTitle={conv.title}
        onConfirm={handleConfirmRename}
      />

      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Xác nhận xóa"
        description={
          <>
            Bạn có chắc chắn muốn xóa cuộc trò chuyện <strong>&quot;{conv.title}&quot;</strong>?
            <br />
            Hành động này không thể hoàn tác.
          </>
        }
        confirmText="Xóa"
        confirmBtnClass="bg-destructive text-destructive-foreground hover:bg-destructive/90 text-white"
        onConfirm={handleConfirmDelete}
      />
    </>
  );
};

export default ConversationCard;
