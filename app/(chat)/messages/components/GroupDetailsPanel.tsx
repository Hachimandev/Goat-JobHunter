import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  X,
  ChevronDown,
  UserPlus,
  Edit,
  Loader2,
  LogOut,
  Bell,
  PinIcon,
  Settings,
  Users,
  Notebook,
  Check,
  RefreshCcw,
  UserPen,
} from 'lucide-react';
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
import GroupNewsPanel from './GroupNewsPanel';
import AssetTabSection from '@/app/(chat)/messages/components/AssetTabSection';
import InviteLinkPanel from './InviteLinkPanel';
import { ChatRoomType } from '@/types/enum';
import {
  useApproveJoinRequestMutation,
  useGetPendingJoinRequestsQuery,
  useRejectJoinRequestMutation,
} from '@/services/chatRoom/invite/inviteApi';
import { truncate } from 'lodash';
import Link from 'next/link';
import { ChatRole } from '@/services/chatRoom/groupChat/groupChatType';

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
  const [newsPanelOpen, setNewsPanelOpen] = useState(false);

  const {
    data: memberData,
    isLoading: isLoadingMembers,
    isFetching: isFetchingMembers,
    isError: isErrorMembers,
    refetch: refetchMembers,
  } = useGetMemberInGroupChatQuery(chatRoom.roomId, { skip: !isOpen || !chatRoom });

  const [addMember, { isLoading: isAddingMember }] = useAddMemberToGroupMutation();

  const { user } = useUser();

  const members = useMemo(() => {
    return memberData?.data || [];
  }, [memberData]);

  const { currentUserRole, currentUserId } = useMemo(() => {
    const currentMember = members.find((member) => member.accountId === user?.accountId);
    return {
      currentUserRole: currentMember ? currentMember.role : ChatRole.MEMBER,
      currentUserId: user?.accountId || 0,
    };
  }, [members, user?.accountId]);

  const canAddMember = currentUserRole === ChatRole.OWNER || currentUserRole === ChatRole.MODERATOR;
  const canEditGroup =
    currentUserRole === ChatRole.OWNER || currentUserRole === ChatRole.MODERATOR || Boolean(chatRoom.allowMemberUpdate);
  const canManageMembers = currentUserRole === ChatRole.OWNER || currentUserRole === ChatRole.MODERATOR;
  const canLeaveGroup = currentUserRole !== ChatRole.OWNER;
  const canProcessJoinRequests = currentUserRole === ChatRole.OWNER || currentUserRole === ChatRole.MODERATOR;
  const canCreatePoll = currentUserRole !== ChatRole.MEMBER || Boolean(chatRoom.allowMemberCreateVote);
  const createPollDisabledReason = 'Bạn không có quyền tạo bình chọn trong nhóm này.';
  const {
    data: pendingJoinRequestData,
    isLoading: isLoadingJoinRequests,
    isFetching: isFetchingJoinRequests,
    refetch: refetchJoinRequests,
  } = useGetPendingJoinRequestsQuery(chatRoom.roomId, {
    skip: !isOpen || !canProcessJoinRequests || chatRoom.type !== ChatRoomType.GROUP,
  });
  const [approveJoinRequest, { isLoading: isApprovingJoinRequest }] = useApproveJoinRequestMutation();
  const [rejectJoinRequest, { isLoading: isRejectingJoinRequest }] = useRejectJoinRequestMutation();
  const pendingJoinRequests = pendingJoinRequestData?.data ?? [];

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
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={onClose}>
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
                className="grid grid-cols-[repeat(auto-fit,minmax(72px,auto))] justify-items-center gap-y-2"
                hidden={readOnly}
              >
                <Button
                  type="button"
                  variant="ghost"
                  className="flex flex-col items-center gap-1 h-auto p-0 hover:bg-transparent rounded-full"
                >
                  <div className="h-10 w-10 rounded-full bg-muted/10 flex items-center justify-center p-2 hover:bg-primary hover:text-white">
                    <Bell className="h-5 w-5" />
                  </div>
                  <span className="text-xs">Tắt thông báo</span>
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  className="flex flex-col items-center gap-1 h-auto p-0 hover:bg-transparent rounded-full"
                >
                  <div className="h-10 w-10 rounded-full bg-muted/10 flex items-center justify-center p-2 hover:bg-primary hover:text-white">
                    <PinIcon className="h-5 w-5" />
                  </div>
                  <span className="text-xs">Ghim hội thoại</span>
                </Button>

                {canAddMember && (
                  <Button
                    type="button"
                    variant="ghost"
                    className="flex flex-col items-center gap-1 h-auto p-0 hover:bg-transparent rounded-full"
                    onClick={() => setAddMemberModalOpen(true)}
                  >
                    <div className="h-10 w-10 rounded-full bg-muted/10 flex items-center justify-center p-2 hover:bg-primary hover:text-white">
                      <UserPlus className="h-5 w-5" />
                    </div>
                    <span className="text-xs">Thêm thành viên</span>
                  </Button>
                )}

                {canManageMembers && (
                  <Button
                    type="button"
                    variant="ghost"
                    className="flex flex-col items-center gap-1 h-auto p-0 hover:bg-transparent rounded-full"
                    onClick={() => setManagePanelOpen(true)}
                  >
                    <div className="h-10 w-10 rounded-full bg-muted/10 flex items-center justify-center p-2 hover:bg-primary hover:text-white">
                      <Settings className="h-5 w-5" />
                    </div>
                    <span className="text-xs">Quản lý nhóm</span>
                  </Button>
                )}
              </div>

              <Separator />

              <Button
                type="button"
                variant="secondary"
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-accent/50 justify-start"
                onClick={() => setNewsPanelOpen(true)}
              >
                <Notebook className="h-4 w-4" />
                <span className="text-sm">Xem bảng tin nhóm</span>
              </Button>

              <Separator />

              {chatRoom.type === ChatRoomType.GROUP && (
                <InviteLinkPanel roomId={chatRoom.roomId} canManageInvite={currentUserRole === ChatRole.OWNER} />
              )}

              {chatRoom.type === ChatRoomType.GROUP && canProcessJoinRequests && (
                <>
                  <Separator />
                  <div className="bg-accent/30 rounded-lg p-3 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-sm">Yêu cầu tham gia ({pendingJoinRequests.length})</h3>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-xl"
                        title="Làm mới"
                        onClick={() => refetchJoinRequests()}
                      >
                        <RefreshCcw className={`h-4 w-4 ${isFetchingJoinRequests ? 'animate-spin' : ''}`} />
                        Làm mới
                      </Button>
                    </div>
                    {isLoadingJoinRequests && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Đang tải yêu cầu...
                      </div>
                    )}
                    {!isLoadingJoinRequests && pendingJoinRequests.length === 0 && (
                      <div className="text-xs text-muted-foreground">Không có yêu cầu chờ duyệt.</div>
                    )}
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {!isLoadingJoinRequests &&
                        pendingJoinRequests.map((request) => (
                          <div
                            key={request.requestId}
                            className="flex items-center gap-3 p-3 rounded-xl hover:bg-accent/50 transition-colors justify-between w-full border"
                          >
                            <div className="flex items-center justify-between gap-2 w-full">
                              <div className="flex items-center gap-3 min-w-0">
                                <Avatar className="h-10 w-10 shrink-0">
                                  <AvatarImage src={request.avatar || '/placeholder.svg'} alt={request.fullName} />
                                  <AvatarFallback>{request.fullName.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className="min-w-0">
                                  <p className="text-sm font-medium">
                                    {truncate(request.fullName || request.username, { length: 30 })}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    @{truncate(request.username, { length: 30 })}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  type="button"
                                  size="icon-sm"
                                  variant="default"
                                  className="rounded-xl text-xs"
                                  title="Duyệt yêu cầu"
                                  disabled={isApprovingJoinRequest || isRejectingJoinRequest}
                                  onClick={() =>
                                    approveJoinRequest({ roomId: chatRoom.roomId, requestId: request.requestId })
                                      .unwrap()
                                      .then(() => toast.success('Đã duyệt yêu cầu tham gia'))
                                      .catch(() => toast.error('Không thể duyệt yêu cầu'))
                                  }
                                >
                                  {isApprovingJoinRequest ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check />}
                                </Button>
                                <Button
                                  type="button"
                                  size="icon-sm"
                                  variant="destructive"
                                  className="rounded-xl text-xs"
                                  title="Từ chối yêu cầu"
                                  disabled={isApprovingJoinRequest || isRejectingJoinRequest}
                                  onClick={() =>
                                    rejectJoinRequest({ roomId: chatRoom.roomId, requestId: request.requestId })
                                      .unwrap()
                                      .then(() => toast.success('Đã từ chối yêu cầu tham gia'))
                                      .catch(() => toast.error('Không thể từ chối yêu cầu'))
                                  }
                                >
                                  {isRejectingJoinRequest ? <Loader2 className="h-4 w-4 animate-spin" /> : <X />}
                                </Button>
                                <Button
                                  type="button"
                                  size="icon-sm"
                                  variant="outline"
                                  className="rounded-xl text-xs"
                                  title="Xem thông tin"
                                >
                                  <Link href={`/hub/users/${request.accountId}`}>
                                    <UserPen />
                                  </Link>
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </>
              )}

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
                        <h3 className="font-semibold text-sm">
                          {members.length || chatRoom.memberCount || '0'} Thành viên
                        </h3>
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-xl"
                          title="Làm mới"
                          onClick={(e) => {
                            e.stopPropagation();
                            refetchMembers();
                          }}
                        >
                          <RefreshCcw className={`h-4 w-4 ${isFetchingMembers ? 'animate-spin' : ''}`} />
                          Làm mới
                        </Button>
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

              {canLeaveGroup && <Separator />}

              <div className="pb-2 space-y-1 mt-2">
                {canLeaveGroup && !readOnly && (
                  <Button
                    variant="destructive"
                    className="w-full rounded-xl"
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

              <Separator />

              <AssetTabSection isDetailPanelOpen={isOpen} chatRoom={chatRoom} />
            </div>
          </ScrollArea>
        </div>

        <ManageGroupPanel
          open={managePanelOpen}
          onOpenChange={setManagePanelOpen}
          chatRoom={chatRoom}
          currentUserRole={currentUserRole}
        />
        <GroupNewsPanel
          open={newsPanelOpen}
          onOpenChange={setNewsPanelOpen}
          chatRoomId={chatRoom.roomId}
          disableCreatePoll={!canCreatePoll}
          createPollDisabledReason={createPollDisabledReason}
        />
      </div>

      <SearchUsersModal
        open={addMemberModalOpen}
        onOpenChange={setAddMemberModalOpen}
        mode="add-to-group"
        onUserSelect={handleAddMember}
        existingMemberIds={members.map((m) => m.accountId)}
        isAddingMember={isAddingMember}
      />

      <EditGroupModal
        open={editGroupModalOpen}
        onOpenChange={setEditGroupModalOpen}
        chatRoom={chatRoom}
        currentUserRole={currentUserRole}
      />

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
