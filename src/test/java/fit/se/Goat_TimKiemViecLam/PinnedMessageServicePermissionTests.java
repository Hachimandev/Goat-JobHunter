package fit.se.Goat_TimKiemViecLam;

import iuh.fit.goat.entity.Applicant;
import iuh.fit.goat.entity.ChatMember;
import iuh.fit.goat.entity.ChatRoom;
import iuh.fit.goat.enumeration.ChatRole;
import iuh.fit.goat.enumeration.ChatRoomPermissionAction;
import iuh.fit.goat.enumeration.ChatRoomType;
import iuh.fit.goat.exception.InvalidException;
import iuh.fit.goat.repository.AccountRepository;
import iuh.fit.goat.repository.ChatRoomRepository;
import iuh.fit.goat.repository.MessageRepository;
import iuh.fit.goat.service.MessageService;
import iuh.fit.goat.service.helper.ChatRoomPermissionGuard;
import iuh.fit.goat.service.helper.MessageHelper;
import iuh.fit.goat.service.impl.PinnedMessageServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PinnedMessageServicePermissionTests {

    @Mock
    private MessageService messageService;

    @Mock
    private MessageRepository messageRepository;

    @Mock
    private ChatRoomRepository chatRoomRepository;

    @Mock
    private AccountRepository accountRepository;

    @Mock
    private MessageHelper messageHelper;

    @Mock
    private ChatRoomPermissionGuard chatRoomPermissionGuard;

    @Test
    void pinMessage_shouldRejectMemberWhenGroupDisablesPinPermission() throws Exception {
        PinnedMessageServiceImpl service = createService();
        Applicant memberAccount = createAccount(61L);
        ChatRoom room = createGroupRoom(false);
        ChatMember member = addMember(room, memberAccount, ChatRole.MEMBER);

        when(chatRoomRepository.findByRoomIdAndDeletedAtIsNull(801L)).thenReturn(Optional.of(room));
        when(chatRoomPermissionGuard.getCurrentMember(room, memberAccount.getAccountId())).thenReturn(member);
        doThrow(new InvalidException("Members are not allowed to manage pinned content in this room"))
                .when(chatRoomPermissionGuard)
                .assertCanPerformAction(room, member, ChatRoomPermissionAction.PIN_CONTENT);

        InvalidException exception = assertThrows(
                InvalidException.class,
                () -> service.pinMessage(801L, "msg-1", memberAccount)
        );

        assertEquals("Members are not allowed to manage pinned content in this room", exception.getMessage());
        verify(messageRepository, never()).pinMessage("801", "msg-1", null);
    }

    @Test
    void unpinMessage_shouldRejectMemberWhenGroupDisablesPinPermission() throws Exception {
        PinnedMessageServiceImpl service = createService();
        Applicant memberAccount = createAccount(62L);
        ChatRoom room = createGroupRoom(false);
        ChatMember member = addMember(room, memberAccount, ChatRole.MEMBER);

        when(chatRoomRepository.findByRoomIdAndDeletedAtIsNull(802L)).thenReturn(Optional.of(room));
        when(chatRoomPermissionGuard.getCurrentMember(room, memberAccount.getAccountId())).thenReturn(member);
        doThrow(new InvalidException("Members are not allowed to manage pinned content in this room"))
                .when(chatRoomPermissionGuard)
                .assertCanPerformAction(room, member, ChatRoomPermissionAction.PIN_CONTENT);

        InvalidException exception = assertThrows(
                InvalidException.class,
                () -> service.unpinMessage(802L, "msg-2", memberAccount)
        );

        assertEquals("Members are not allowed to manage pinned content in this room", exception.getMessage());
        verify(messageRepository, never()).deletePinnedMessage("802", "msg-2");
    }

    @Test
    void clearAllPinnedMessages_shouldRejectMemberWhenGroupDisablesPinPermission() throws Exception {
        PinnedMessageServiceImpl service = createService();
        Applicant memberAccount = createAccount(63L);
        ChatRoom room = createGroupRoom(false);
        ChatMember member = addMember(room, memberAccount, ChatRole.MEMBER);

        when(chatRoomRepository.findByRoomIdAndDeletedAtIsNull(803L)).thenReturn(Optional.of(room));
        when(chatRoomPermissionGuard.getCurrentMember(room, memberAccount.getAccountId())).thenReturn(member);
        doThrow(new InvalidException("Members are not allowed to manage pinned content in this room"))
                .when(chatRoomPermissionGuard)
                .assertCanPerformAction(room, member, ChatRoomPermissionAction.PIN_CONTENT);

        InvalidException exception = assertThrows(
                InvalidException.class,
                () -> service.clearAllPinnedMessages(803L, memberAccount)
        );

        assertEquals("Members are not allowed to manage pinned content in this room", exception.getMessage());
        verify(messageRepository, never()).getPinnedMessagesByChatRoom("803");
    }

    private PinnedMessageServiceImpl createService() {
        return new PinnedMessageServiceImpl(
                messageService,
                messageRepository,
                chatRoomRepository,
                accountRepository,
                messageHelper,
                chatRoomPermissionGuard
        );
    }

    private Applicant createAccount(Long accountId) {
        Applicant applicant = new Applicant();
        applicant.setAccountId(accountId);
        applicant.setEmail("pin-" + accountId + "@mail.test");
        return applicant;
    }

    private ChatRoom createGroupRoom(boolean allowMemberPin) {
        ChatRoom room = new ChatRoom();
        room.setRoomId(800L);
        room.setType(ChatRoomType.GROUP);
        room.setAllowMemberPin(allowMemberPin);
        return room;
    }

    private ChatMember addMember(ChatRoom room, Applicant account, ChatRole role) {
        ChatMember member = new ChatMember();
        member.setAccount(account);
        member.setRole(role);
        member.setRoom(room);
        room.getMembers().add(member);
        return member;
    }
}
