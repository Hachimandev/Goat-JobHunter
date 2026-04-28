package iuh.fit.goat.service;

import iuh.fit.goat.dto.request.chat.*;
import iuh.fit.goat.dto.request.message.MessageToNewChatRoom;
import iuh.fit.goat.dto.response.ResultPaginationResponse;
import iuh.fit.goat.dto.response.chat.ChatRoomResponse;
import iuh.fit.goat.dto.response.chat.GroupMemberResponse;
import iuh.fit.goat.dto.response.chat.InviteLinkResponse;
import iuh.fit.goat.dto.response.chat.JoinByInviteResponse;
import iuh.fit.goat.dto.response.chat.MessageSummaryResponse;
import iuh.fit.goat.dto.response.chat.UnreadMessageResponse;
import iuh.fit.goat.entity.*;
import iuh.fit.goat.exception.ConflictException;
import iuh.fit.goat.exception.InvalidException;
import iuh.fit.goat.exception.NotFoundException;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface ChatRoomService {
    ResultPaginationResponse getMyChatRooms(Long accountId, Pageable pageable);

    ChatRoomResponse getDetailChatRoomInformation(Account currentAccount, Long chatRoomId) throws InvalidException;

    ResultPaginationResponse getMessagesInChatRoom(Account account, Long chatRoomId, Pageable pageable)
            throws InvalidException;

    ResultPaginationResponse searchMessagesInChatRoom(
            Account account,
            Long chatRoomId,
            String searchTerm,
            Pageable pageable
    ) throws InvalidException;

    boolean isUserInChatRoom(ChatRoom chatRoom, Long accountId);

    boolean isUserInChatRoom(Long chatRoomId, Long accountId) throws InvalidException;

    ChatRoom createNewSingleChatRoom(Account currentAccount, MessageToNewChatRoom request) throws InvalidException;

    ChatRoom createNewSingleChatRoomWithFiles(Account currentAccount, MessageToNewChatRoom request, List<MultipartFile> files) throws InvalidException;

    ChatRoom existsDirectChatRoom(Long currentUserId, Long otherUserId);

    ResultPaginationResponse getMediaMessagesInChatRoom(Account account, Long chatRoomId, Pageable pageable)
            throws InvalidException;

    ResultPaginationResponse getFileMessagesInChatRoom(Account account, Long chatRoomId, Pageable pageable)
            throws InvalidException;

    ChatRoom createGroupChat(Account currentAccount, CreateGroupChatRequest request) throws InvalidException;

    ChatRoom updateGroupInfo(Account currentAccount, Long chatRoomId, UpdateGroupInfoRequest request) throws InvalidException;

    void leaveGroupChat(Account currentAccount, Long chatRoomId) throws InvalidException;

    ChatMember addMemberToGroup(Account currentAccount, Long chatRoomId, AddMemberRequest request) throws InvalidException;

    void removeMemberFromGroup(Account currentAccount, Long chatRoomId, Long chatMemberId) throws InvalidException;

    ChatMember updateMemberRole(Account currentAccount, Long chatRoomId, Long chatMemberId, UpdateMemberRoleRequest request) throws InvalidException;

    List<GroupMemberResponse> getGroupMembers(Account currentAccount, Long chatRoomId) throws InvalidException;

    void smartGroupDissolution(Long chatRoomId, Account currentAccount, String groupNameConfirmation) throws InvalidException;

    List<UnreadMessageResponse> getUnreadMessages(Pageable pageable) throws InvalidException;

    MessageSummaryResponse getUnreadMessagesSummary(Account currentAccount, Long chatRoomId) throws InvalidException;

    InviteLinkResponse getInviteLink(Account currentAccount, Long roomId) throws InvalidException, NotFoundException;

    InviteLinkResponse rotateInviteLink(Account currentAccount, Long roomId) throws InvalidException, NotFoundException;

    InviteLinkResponse toggleInviteLink(Account currentAccount, Long roomId, boolean enabled) throws InvalidException, NotFoundException;

    JoinByInviteResponse joinByInvite(Account currentAccount, String inviteToken) throws InvalidException, NotFoundException, ConflictException;
}
