package fit.se.Goat_TimKiemViecLam;

import iuh.fit.goat.entity.Applicant;
import iuh.fit.goat.entity.ChatMember;
import iuh.fit.goat.entity.ChatRoom;
import iuh.fit.goat.enumeration.ChatRole;
import iuh.fit.goat.enumeration.ChatRoomPermissionAction;
import iuh.fit.goat.enumeration.ChatRoomType;
import iuh.fit.goat.exception.InvalidException;
import iuh.fit.goat.service.helper.ChatRoomPermissionGuard;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class ChatRoomPermissionGuardTests {

    private final ChatRoomPermissionGuard guard = new ChatRoomPermissionGuard();

    @Test
    void memberShouldBeAllowedToUpdateGroupInfoWhenMemberUpdatePermissionIsEnabled() {
        ChatRoom room = createGroupRoom();
        room.setAllowMemberUpdate(true);
        ChatMember member = addMember(room, 11L, ChatRole.MEMBER);

        assertDoesNotThrow(() ->
                guard.assertCanPerformAction(room, member, ChatRoomPermissionAction.UPDATE_GROUP_INFO));
    }

    @Test
    void memberShouldBeDeniedToUpdateGroupInfoWhenMemberUpdatePermissionIsDisabled() {
        ChatRoom room = createGroupRoom();
        room.setAllowMemberUpdate(false);
        ChatMember member = addMember(room, 12L, ChatRole.MEMBER);

        InvalidException exception = assertThrows(
                InvalidException.class,
                () -> guard.assertCanPerformAction(room, member, ChatRoomPermissionAction.UPDATE_GROUP_INFO)
        );

        assertEquals("Members are not allowed to update group info in this room", exception.getMessage());
    }

    @Test
    void memberShouldBeDeniedToManagePinnedContentWhenMemberPinPermissionIsDisabled() {
        ChatRoom room = createGroupRoom();
        room.setAllowMemberPin(false);
        ChatMember member = addMember(room, 13L, ChatRole.MEMBER);

        InvalidException exception = assertThrows(
                InvalidException.class,
                () -> guard.assertCanPerformAction(room, member, ChatRoomPermissionAction.PIN_CONTENT)
        );

        assertEquals("Members are not allowed to manage pinned content in this room", exception.getMessage());
    }

    @Test
    void memberShouldBeDeniedToCreatePollWhenMemberCreateVotePermissionIsDisabled() {
        ChatRoom room = createGroupRoom();
        room.setAllowMemberCreateVote(false);
        ChatMember member = addMember(room, 14L, ChatRole.MEMBER);

        InvalidException exception = assertThrows(
                InvalidException.class,
                () -> guard.assertCanPerformAction(room, member, ChatRoomPermissionAction.CREATE_POLL)
        );

        assertEquals("Members are not allowed to create polls in this room", exception.getMessage());
    }

    @Test
    void memberShouldBeDeniedToSendMessageWhenMemberSendPermissionIsDisabled() {
        ChatRoom room = createGroupRoom();
        room.setAllowMemberSendMessage(false);
        ChatMember member = addMember(room, 15L, ChatRole.MEMBER);

        InvalidException exception = assertThrows(
                InvalidException.class,
                () -> guard.assertCanPerformAction(room, member, ChatRoomPermissionAction.SEND_MESSAGE)
        );

        assertEquals("Members are not allowed to send messages in this room", exception.getMessage());
    }

    @Test
    void moderatorShouldBypassMemberTogglesButRespectModeratorSendToggle() {
        ChatRoom room = createGroupRoom();
        room.setAllowMemberUpdate(false);
        room.setAllowMemberPin(false);
        room.setAllowMemberCreateVote(false);
        room.setAllowModeratorSendMessage(false);
        ChatMember moderator = addMember(room, 16L, ChatRole.MODERATOR);

        assertDoesNotThrow(() ->
                guard.assertCanPerformAction(room, moderator, ChatRoomPermissionAction.UPDATE_GROUP_INFO));
        assertDoesNotThrow(() ->
                guard.assertCanPerformAction(room, moderator, ChatRoomPermissionAction.PIN_CONTENT));
        assertDoesNotThrow(() ->
                guard.assertCanPerformAction(room, moderator, ChatRoomPermissionAction.CREATE_POLL));

        InvalidException exception = assertThrows(
                InvalidException.class,
                () -> guard.assertCanPerformAction(room, moderator, ChatRoomPermissionAction.SEND_MESSAGE)
        );
        assertEquals("Moderators are not allowed to send messages in this room", exception.getMessage());
    }

    @Test
    void ownerShouldBypassAllRoomPermissionToggles() {
        ChatRoom room = createGroupRoom();
        room.setAllowMemberUpdate(false);
        room.setAllowMemberPin(false);
        room.setAllowMemberCreateVote(false);
        room.setAllowMemberSendMessage(false);
        room.setAllowModeratorSendMessage(false);
        ChatMember owner = addMember(room, 17L, ChatRole.OWNER);

        assertDoesNotThrow(() ->
                guard.assertCanPerformAction(room, owner, ChatRoomPermissionAction.UPDATE_GROUP_INFO));
        assertDoesNotThrow(() ->
                guard.assertCanPerformAction(room, owner, ChatRoomPermissionAction.PIN_CONTENT));
        assertDoesNotThrow(() ->
                guard.assertCanPerformAction(room, owner, ChatRoomPermissionAction.CREATE_POLL));
        assertDoesNotThrow(() ->
                guard.assertCanPerformAction(room, owner, ChatRoomPermissionAction.SEND_MESSAGE));
    }

    @Test
    void directRoomShouldIgnoreGroupPermissionToggles() {
        ChatRoom room = createDirectRoom();
        room.setAllowMemberSendMessage(false);
        ChatMember member = addMember(room, 18L, ChatRole.MEMBER);

        assertDoesNotThrow(() ->
                guard.assertCanPerformAction(room, member, ChatRoomPermissionAction.SEND_MESSAGE));
    }

    private ChatRoom createGroupRoom() {
        ChatRoom room = new ChatRoom();
        room.setRoomId(100L);
        room.setType(ChatRoomType.GROUP);
        return room;
    }

    private ChatRoom createDirectRoom() {
        ChatRoom room = new ChatRoom();
        room.setRoomId(200L);
        room.setType(ChatRoomType.DIRECT);
        return room;
    }

    private ChatMember addMember(ChatRoom room, Long accountId, ChatRole role) {
        Applicant applicant = new Applicant();
        applicant.setAccountId(accountId);

        ChatMember member = new ChatMember();
        member.setAccount(applicant);
        member.setRole(role);
        member.setRoom(room);
        room.getMembers().add(member);
        return member;
    }
}
