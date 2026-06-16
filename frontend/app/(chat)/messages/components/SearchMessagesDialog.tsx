import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Loader2, Search, X } from 'lucide-react';
import { useCallback } from 'react';
import { useSearchMessages } from '@/app/(chat)/messages/hooks/useSearchMessages';
import { formatDateTime } from '@/utils/formatDate';
import { getMessagePreviewText, getMessageSenderDisplayName } from '@/utils/messageUtils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface SearchMessagesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chatRoomId: number;
  onNavigateToMessage?: (messageId: string) => void;
}

export function SearchMessagesDialog({
  open,
  onOpenChange,
  chatRoomId,
  onNavigateToMessage,
}: Readonly<SearchMessagesDialogProps>) {
  const { searchTerm, setSearchTerm, results, isLoading, isError, isEmpty, shouldShowResults, minLength, clearSearch } =
    useSearchMessages({ chatRoomId });

  console.log(results);

  const handleSelectResult = useCallback(
    (messageId: string) => {
      if (!messageId) {
        return;
      }

      onNavigateToMessage?.(messageId);
      onOpenChange(false);
    },
    [onNavigateToMessage, onOpenChange],
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl rounded-xl p-0 gap-0">
        <DialogHeader className="px-5 pt-5 pb-3 border-b">
          <DialogTitle>Tìm kiếm tin nhắn</DialogTitle>
          <DialogDescription>Tìm theo nội dung trong cuộc trò chuyện hiện tại.</DialogDescription>
        </DialogHeader>

        <div className="px-5 py-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              autoFocus
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Nhập từ khóa cần tìm..."
              className="pl-9 pr-10 rounded-xl"
            />
            {searchTerm.length > 0 && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full"
                onClick={clearSearch}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {isLoading && results.length > 0 && (
          <div className="px-5 pt-3 text-xs text-muted-foreground flex items-center gap-2">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Đang cập nhật kết quả...
          </div>
        )}

        <ScrollArea className="h-[420px] px-5 pb-5">
          {!shouldShowResults ? (
            <div className="text-center py-10 text-sm text-muted-foreground">
              Nhập ít nhất {minLength} ký tự để tìm kiếm tin nhắn.
            </div>
          ) : isLoading && results.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-3">
              <Loader2 className="h-6 w-6 animate-spin" />
              <p className="text-sm">Đang tìm kiếm...</p>
            </div>
          ) : isError ? (
            <div className="text-center py-10 text-sm text-destructive">
              Không thể tải kết quả tìm kiếm. Vui lòng thử lại.
            </div>
          ) : isEmpty ? (
            <div className="text-center py-10 text-sm text-muted-foreground">Không tìm thấy tin nhắn phù hợp.</div>
          ) : (
            <div className="space-y-2 pt-3">
              {results.map((message) => (
                <button
                  key={message.messageId}
                  type="button"
                  onClick={() => handleSelectResult(message.messageId)}
                  className="w-full text-left rounded-xl border border-border bg-card px-3 py-3 hover:bg-muted/30 transition-colors flex items-start justify-between"
                >
                  <div className="flex items-center gap-3 mb-1">
                    <Avatar className="h-12 w-12">
                      <AvatarImage
                        src={message.sender?.avatar || '/placeholder.svg'}
                        alt={getMessageSenderDisplayName(message.sender)}
                        className="border"
                      />
                      <AvatarFallback>{getMessageSenderDisplayName(message.sender).charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="">
                      <p className="text-base font-medium truncate">{getMessageSenderDisplayName(message.sender)}</p>
                      <p className="text-sm text-muted-foreground">{getMessagePreviewText(message)}</p>
                    </div>
                  </div>
                  <p className="mt-1 text-base text-muted-foreground line-clamp-2">
                    <span className="text-sm text-muted-foreground shrink-0">{formatDateTime(message.createdAt)}</span>
                  </p>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
