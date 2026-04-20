import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { X, ChevronDown, UserPlus, Edit, Loader2, LogOut, Bell, PinIcon, Settings, Users } from 'lucide-react';
import { SharedMediaGrid } from './SharedMediaGrid';
import { SharedFilesList } from './SharedFilesList';
import { useMemo, useState } from 'react';
import { ChatRoom } from '@/types/model';
import { ManageGroupPanel } from './ManageGroupPanel';
import { useGetMemberInGroupChatQuery, useAddMemberToGroupMutation } from '@/services/chatRoom/groupChat/groupChatApi';
import { ChatMemberItem } from '@/app/(chat)/messages/components/ChatMemberItem';
import { useUser } from '@/hooks/useUser';
import { SearchUsersModal } from './SearchUsersModal';
import { User } from '@/types/model';
import { toast } from 'sonner';
import { EditGroupModal } from '@/app/(chat)/messages/components/EditGroupModal';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { usePaginatedChatRoomAssets } from '@/app/(chat)/messages/hooks/usePaginatedChatRoomAssets';

interface GroupDetailsPanelProps {
  chatRoom: ChatRoom;
  isOpen: boolean;
  onClose: () => void;
  readOnly?: boolean;
  handleLeaveGroup: () => Promise<void>;
  isLeavingGroup: boolean;
}

export function GroupDetailsPanel({
  chatRoom,
  isOpen,
  onClose,
  readOnly = false,
  handleLeaveGroup,
  isLeavingGroup,
}: Readonly<GroupDetailsPanelProps>) {
  const [isMembersOpen, setIsMembersOpen] = useState(true);
  const [addMemberModalOpen, setAddMemberModalOpen] = useState(false);
  const [editGroupModalOpen, setEditGroupModalOpen] = useState(false);
  const [leaveConfirmOpen, setLeaveConfirmOpen] = useState(false);
  const [managePanelOpen, setManagePanelOpen] = useState(false);

  const {
    assets: media,
    isLoadingInitial: isLoadingMedia,
    isError: isErrorMedia,
    hasMore: hasMoreMedia,
    isFetchingNext: isFetchingNextMedia,
    loadMore: loadMoreMedia,
  } = usePaginatedChatRoomAssets({
    chatRoomId: chatRoom?.roomId ?? null,
    assetType: 'media',
    enabled: isOpen && Boolean(chatRoom),
  });

  const {
    assets: files,
    isLoadingInitial: isLoadingFile,
    isError: isErrorFile,
    hasMore: hasMoreFile,
    isFetchingNext: isFetchingNextFile,
    loadMore: loadMoreFile,
  } = usePaginatedChatRoomAssets({
    chatRoomId: chatRoom?.roomId ?? null,
    assetType: 'files',
    enabled: isOpen && Boolean(chatRoom),
  });

  const {
    data: memberData,
    isLoading: isLoadingMembers,
    isError: isErrorMembers,
  } = useGetMemberInGroupChatQuery(chatRoom.roomId, { skip: !isOpen || !chatRoom });

  const [addMember, { isLoading: isAddingMember }] = useAddMemberToGroupMutation();

  const { user } = useUser();

  const members = useMemo(() => {
    return memberData?.data || [];
  }, [memberData]);

  const { currentUserRole, currentUserId } = useMemo(() => {
    const currentMember = members.find((member) => member.accountId === user?.accountId);
    return {
      currentUserRole: currentMember ? currentMember.role : 'MEMBER',
      currentUserId: user?.accountId || 0,
    };
  }, [members, user?.accountId]);

  const canAddMember = currentUserRole === 'OWNER' || currentUserRole === 'MODERATOR';
  const canEditGroup = currentUserRole === 'OWNER' || currentUserRole === 'MODERATOR';
  const canManageMembers = currentUserRole === 'OWNER' || currentUserRole === 'MODERATOR';
  const canLeaveGroup = currentUserRole !== 'OWNER';

  const handleAddMember = async (selectedUser: User) => {
    try {
      await addMember({
        chatroomId: chatRoom.roomId.toString(),
        accountId: selectedUser.accountId,
      }).unwrap();

      toast.success(`Đã thêm ${selectedUser.fullName} vào nhóm`);
      setAddMemberModalOpen(false);
    } catch (error) {
      console.error('Error adding member:', error);
      toast.error('Không thể thêm thành viên vào nhóm');

      throw error;
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="relative w-[450px] shrink-0 h-full min-h-0">
        <div className="absolute inset-0 border-l border-border bg-card flex flex-col h-full min-h-0 z-0">
          <div className="h-16 border-b border-border flex items-center justify-between px-4 flex-none">
            <h2 className="font-semibold text-sm">Thông tin nhóm</h2>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          <ScrollArea className="flex-1 min-h-0">
            <div className="p-4 space-y-6">
              <div className="flex flex-col items-center text-center">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={chatRoom.avatar || '/placeholder.svg'} alt={chatRoom.name} />
                  <AvatarFallback>{chatRoom.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex items-baseline gap-1" hidden={readOnly}>
                  <h3 className="font-semibold text-lg mt-3">{chatRoom.name}</h3>
                  {canEditGroup && (
                    <Edit className="h-4 w-4 cursor-pointer" onClick={() => setEditGroupModalOpen(true)} />
                  )}
                </div>
              </div>

              <div
                className="grid grid-cols-[repeat(auto-fit,minmax(72px,auto))] justify-items-center"
                hidden={readOnly}
              >
                <div className="flex flex-col items-center gap-1 cursor-pointer">
                  <div className="h-10 w-10 rounded-full bg-muted/10 flex items-center justify-center p-2 hover:bg-primary/50 transition-colors">
                    <Bell className="h-5 w-5" />
                  </div>
                  <span className="text-xs">Tắt thông báo</span>
                </div>
                <div className="flex flex-col items-center gap-1 cursor-pointer">
                  <div className="h-10 w-10 rounded-full bg-muted/10 flex items-center justify-center p-2 hover:bg-primary/50 transition-colors">
                    <PinIcon className="h-5 w-5" />
                  </div>
                  <span className="text-xs">Ghim hội thoại</span>
                </div>
                {canAddMember && (
                  <div
                    className="flex flex-col items-center gap-1 cursor-pointer"
                    onClick={() => setAddMemberModalOpen(true)}
                  >
                    <div className="h-10 w-10 rounded-full bg-muted/10 flex items-center justify-center p-2 hover:bg-primary/50 transition-colors">
                      <UserPlus className="h-5 w-5" />
                    </div>
                    <span className="text-xs">Thêm thành viên</span>
                  </div>
                )}
                {canManageMembers && (
                  <div
                    className="flex flex-col items-center gap-1 cursor-pointer"
                    onClick={() => setManagePanelOpen(true)}
                  >
                    <div className="h-10 w-10 rounded-full bg-muted/10 flex items-center justify-center p-2 hover:bg-primary/50 transition-colors">
                      <Settings className="h-5 w-5" />
                    </div>
                    <span className="text-xs">Quản lý nhóm</span>
                  </div>
                )}
              </div>

              <Separator />

              <Collapsible open={isMembersOpen} onOpenChange={setIsMembersOpen}>
                <div className="bg-accent/30 rounded-lg overflow-hidden">
                  <CollapsibleTrigger asChild>
                    <Button
                      className="w-full flex items-center justify-between p-3 py-6 hover:bg-accent/50 transition-colors cursor-pointer rounded-xl"
                      variant="ghost"
                    >
                      <div className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        <h3 className="font-semibold text-sm">{chatRoom.memberCount} Thành viên</h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <ChevronDown
                          className={`h-4 w-4 transition-transform duration-200 ${isMembersOpen ? 'rotate-180' : ''}`}
                        />
                      </div>
                    </Button>
                  </CollapsibleTrigger>

                  <CollapsibleContent className="data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up">
                    <div className="px-2 pb-2 space-y-1 mt-2">
                      {isLoadingMembers && (
                        <div className="flex items-center justify-center py-4">
                          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                        </div>
                      )}
                      {isErrorMembers && (
                        <div className="text-center py-4 text-sm text-destructive">
                          Có lỗi xảy ra khi tải thành viên. Vui lòng thử lại sau.
                        </div>
                      )}
                      {members &&
                        members.length > 0 &&
                        !isLoadingMembers &&
                        !isErrorMembers &&
                        members.map((member) => (
                          <ChatMemberItem
                            key={member.chatMemberId}
                            member={member}
                            chatroomId={chatRoom.roomId.toString()}
                            currentUserRole={currentUserRole}
                            currentUserId={currentUserId}
                            readOnly={readOnly}
                          />
                        ))}
                      {members.length == 0 && !isLoadingMembers && !isErrorMembers && (
                        <div className="text-center py-4 text-sm text-muted-foreground">Không có thành viên</div>
                      )}
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>

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
                  <SharedMediaGrid
                    media={media}
                    isLoading={isLoadingMedia}
                    isError={isErrorMedia}
                    hasMore={hasMoreMedia}
                    isFetchingNext={isFetchingNextMedia}
                    onLoadMore={loadMoreMedia}
                  />
                </TabsContent>
                <TabsContent value="files" className="mt-4">
                  <SharedFilesList
                    files={files}
                    isLoading={isLoadingFile}
                    isError={isErrorFile}
                    hasMore={hasMoreFile}
                    isFetchingNext={isFetchingNextFile}
                    onLoadMore={loadMoreFile}
                  />
                </TabsContent>
              </Tabs>

              {canLeaveGroup && <Separator />}

              <div className="pb-2 space-y-1 mt-2">
                {canLeaveGroup && !readOnly && (
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-destructive hover:text-destructive rounded-xl"
                    onClick={() => setLeaveConfirmOpen(true)}
                    disabled={isLeavingGroup}
                  >
                    {isLeavingGroup ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Đang rời nhóm...
                      </>
                    ) : (
                      <>
                        <LogOut className="h-4 w-4" />
                        Rời khỏi nhóm
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </ScrollArea>
        </div>

        <ManageGroupPanel open={managePanelOpen} onOpenChange={setManagePanelOpen} chatRoom={chatRoom} />
      </div>

      <SearchUsersModal
        open={addMemberModalOpen}
        onOpenChange={setAddMemberModalOpen}
        mode="add-to-group"
        onUserSelect={handleAddMember}
        existingMemberIds={members.map((m) => m.accountId)}
        isAddingMember={isAddingMember}
      />

      {/* Edit Group Modal */}
      <EditGroupModal open={editGroupModalOpen} onOpenChange={setEditGroupModalOpen} chatRoom={chatRoom} />

      {/* Leave Group Confirmation */}
      <AlertDialog open={leaveConfirmOpen} onOpenChange={setLeaveConfirmOpen}>
        <AlertDialogContent className="rounded-xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Rời khỏi nhóm?</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn rời khỏi nhóm &#34;{chatRoom.name}&#34;? Bạn sẽ không thể xem tin nhắn hoặc tham gia
              trò chuyện nữa.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLeaveGroup}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl text-white"
            >
              Rời nhóm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
