import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChatRoom } from '@/types/model';
import { ChatRoomType } from '@/types/enum';
import { Bell, Loader2, ShieldBan, Undo2, UserCircle, X, Users } from 'lucide-react';
import { SharedMediaGrid } from './SharedMediaGrid';
import { SharedFilesList } from './SharedFilesList';
import { Badge } from '@/components/ui/badge';
import { useFetchFilesInChatRoomQuery, useFetchMediaInChatRoomQuery } from '@/services/chatRoom/chatRoomApi';
import { useMemo } from 'react';
import useFriendActions from '@/hooks/useFriendActions';

interface ChatDetailsPanelProps {
  chatRoom: ChatRoom;
  isOpen: boolean;
  onClose: () => void;
  onRelationshipChanged?: () => void;
}

export function ChatDetailsPanel({
  chatRoom,
  isOpen,
  onClose,
  onRelationshipChanged,
}: Readonly<ChatDetailsPanelProps>) {
  const {
    data: filesData,
    isLoading: isLoadingFile,
    isError: isErrorFile,
  } = useFetchFilesInChatRoomQuery({ chatRoomId: chatRoom.roomId }, { skip: !isOpen || !chatRoom });
  const {
    data: mediaData,
    isLoading: isLoadingMedia,
    isError: isErrorMedia,
  } = useFetchMediaInChatRoomQuery({ chatRoomId: chatRoom.roomId }, { skip: !isOpen || !chatRoom });

  const media = useMemo(() => {
    return mediaData?.data || [];
  }, [mediaData]);

  const files = useMemo(() => {
    return filesData?.data || [];
  }, [filesData]);
  const { handleBlockUser, handleUnblockUser, isMutating } = useFriendActions();

  if (!isOpen) return null;

  const isGroup = chatRoom.type === ChatRoomType.GROUP;
  const isDirectBlocked = !isGroup && Boolean(chatRoom.blocked);
  const isBlockedByMe = isDirectBlocked && Boolean(chatRoom.blockedByMe);

  const isBlockActionDisabled = isGroup || isMutating;

  const canUnblock = isBlockedByMe;

  const handleToggleBlock = async () => {
    if (isGroup) {
      return;
    }

    const success = canUnblock
      ? await handleUnblockUser(chatRoom.counterpartAccountId)
      : await handleBlockUser(chatRoom.counterpartAccountId);

    if (success) {
      onRelationshipChanged?.();
    }
  };

  return (
    <div className="w-[450px] border-l border-border bg-card shrink-0 flex flex-col h-full min-h-0">
      <div className="h-16 border-b border-border flex items-center justify-between px-4 flex-none">
        <h2 className="font-semibold text-sm">Thông tin đoạn chat</h2>
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      <ScrollArea className="flex-1 min-h-0">
        <div className="p-4 space-y-6">
          <div className="flex flex-col items-center text-center">
            <div className="relative">
              <Avatar className="h-20 w-20 border">
                <AvatarImage src={chatRoom.avatar || '/placeholder.svg'} alt={chatRoom.name} />
                <AvatarFallback>{chatRoom.name.charAt(0)}</AvatarFallback>
              </Avatar>
              {isGroup && (
                <div className="absolute -bottom-1 -right-1 bg-primary rounded-full p-1.5">
                  <Users className="h-4 w-4 text-primary-foreground" />
                </div>
              )}
            </div>
            <h3 className="font-semibold text-lg mt-3">{chatRoom.name}</h3>
          </div>

          <div className="grid grid-cols-[repeat(auto-fit,minmax(72px,auto))] justify-items-center">
            <div className="flex flex-col items-center gap-1 cursor-pointer">
              <div className="h-10 w-10 rounded-full bg-muted/10 flex items-center justify-center p-2 hover:bg-primary/50 transition-colors">
                <UserCircle className="h-5 w-5" />
              </div>
              <span className="text-xs">Thông tin</span>
            </div>
            <div className="flex flex-col items-center gap-1 cursor-pointer">
              <div className="h-10 w-10 rounded-full bg-muted/10 flex items-center justify-center p-2 hover:bg-primary/50 transition-colors">
                <Bell className="h-5 w-5" />
              </div>
              <span className="text-xs">Tắt thông báo</span>
            </div>
            <div className="flex flex-col items-center gap-1 cursor-pointer" onClick={handleToggleBlock}>
              <div className="h-10 w-10 rounded-full bg-muted/10 flex items-center justify-center p-2 hover:bg-primary/50 transition-colors">
                {isMutating ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : canUnblock ? (
                  <Undo2 className="h-5 w-5" />
                ) : (
                  <ShieldBan className="h-5 w-5" />
                )}
              </div>
              <span className="text-xs">{canUnblock ? 'Bỏ chặn' : 'Chặn'}</span>
            </div>
          </div>

          {!isGroup && isDirectBlocked && (
            <p className="text-xs text-muted-foreground">
              {isBlockedByMe
                ? 'Bạn đã chặn người dùng này. Không thể gửi tin nhắn cho đến khi bỏ chặn.'
                : 'Người dùng này đã chặn bạn. Bạn không thể nhắn tin ở thời điểm hiện tại.'}
            </p>
          )}

          <Separator />

          <Tabs defaultValue="media" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger className="cursor-pointer" value="media">
                Phương tiện
              </TabsTrigger>
              <TabsTrigger className="cursor-pointer" value="files">
                Files
              </TabsTrigger>
            </TabsList>
            <TabsContent value="media" className="mt-4">
              <SharedMediaGrid media={media} isLoading={isLoadingMedia} isError={isErrorMedia} />
            </TabsContent>
            <TabsContent value="files" className="mt-4">
              <SharedFilesList files={files} isLoading={isLoadingFile} isError={isErrorFile} />
            </TabsContent>
          </Tabs>
        </div>
      </ScrollArea>
    </div>
  );
}
