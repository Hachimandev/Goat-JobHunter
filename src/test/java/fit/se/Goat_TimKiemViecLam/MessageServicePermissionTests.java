package fit.se.Goat_TimKiemViecLam;

import iuh.fit.goat.dto.request.message.MessageCreateRequest;
import iuh.fit.goat.entity.Applicant;
import iuh.fit.goat.entity.ChatMember;
import iuh.fit.goat.entity.ChatRoom;
import iuh.fit.goat.enumeration.ChatRole;
import iuh.fit.goat.enumeration.ChatRoomPermissionAction;
import iuh.fit.goat.enumeration.ChatRoomType;
import iuh.fit.goat.exception.InvalidException;
import iuh.fit.goat.repository.ChatRoomRepository;
import iuh.fit.goat.repository.MessageHiddenRepository;
import iuh.fit.goat.repository.MessageRepository;
import iuh.fit.goat.repository.UserRepository;
import iuh.fit.goat.service.AiService;
import iuh.fit.goat.service.StorageService;
import iuh.fit.goat.service.cache.ChatRoomCacheService;
import iuh.fit.goat.service.helper.ChatRoomPermissionGuard;
import iuh.fit.goat.service.helper.MessageHelper;
import iuh.fit.goat.service.impl.MessageServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class MessageServicePermissionTests {

    @Mock
    private StorageService storageService;

    @Mock
    private AiService aiService;

    @Mock
    private MessageHiddenRepository messageHiddenRepository;

    @Mock
    private MessageRepository messageRepository;

    @Mock
    private ChatRoomRepository chatRoomRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private ChatRoomCacheService chatRoomCacheService;

    @Mock
    private MessageHelper messageHelper;

    @Mock
    private ChatRoomPermissionGuard chatRoomPermissionGuard;

    @Test
    void sendMessage_shouldRejectMemberWhenGroupDisablesMemberSendPermission() throws Exception {
        MessageServiceImpl service = createService();
        Applicant memberAccount = createAccount(51L);
        ChatRoom room = createGroupRoom(false, true);
        ChatMember member = addMember(room, memberAccount, ChatRole.MEMBER);

        when(messageHelper.getChatRoom(700L)).thenReturn(room);
        when(chatRoomPermissionGuard.getCurrentMember(room, memberAccount.getAccountId())).thenReturn(member);
        doThrow(new InvalidException("Members are not allowed to send messages in this room"))
                .when(chatRoomPermissionGuard)
                .assertCanPerformAction(room, member, ChatRoomPermissionAction.SEND_MESSAGE);

        InvalidException exception = assertThrows(
                InvalidException.class,
                () -> service.sendMessage(700L, new MessageCreateRequest("Hello", null), memberAccount)
        );

        assertEquals("Members are not allowed to send messages in this room", exception.getMessage());
        verify(messageHelper, never()).saveAndDispatchMessageOptimized(any(), any(), any());
    }

    @Test
    void sendMessagesWithFiles_shouldRejectModeratorWhenGroupDisablesModeratorSendPermission() throws Exception {
        MessageServiceImpl service = createService();
        Applicant moderatorAccount = createAccount(52L);
        ChatRoom room = createGroupRoom(true, false);
        ChatMember moderator = addMember(room, moderatorAccount, ChatRole.MODERATOR);

        when(messageHelper.getChatRoom(701L)).thenReturn(room);
        when(chatRoomPermissionGuard.getCurrentMember(room, moderatorAccount.getAccountId())).thenReturn(moderator);
        doThrow(new InvalidException("Moderators are not allowed to send messages in this room"))
                .when(chatRoomPermissionGuard)
                .assertCanPerformAction(room, moderator, ChatRoomPermissionAction.SEND_MESSAGE);

        InvalidException exception = assertThrows(
                InvalidException.class,
                () -> service.sendMessagesWithFiles(
                        701L,
                        new MessageCreateRequest("Files", null),
                        List.of(new MockMultipartFile("files", "a.txt", "text/plain", "data".getBytes())),
                        moderatorAccount
                )
        );

        assertEquals("Moderators are not allowed to send messages in this room", exception.getMessage());
        verify(messageHelper, never()).saveAndDispatchMessageOptimized(any(), any(), any());
    }

    @Test
    void sendContactCardMessages_shouldRejectMemberWhenGroupDisablesMemberSendPermission() throws Exception {
        MessageServiceImpl service = createService();
        Applicant memberAccount = createAccount(53L);
        ChatRoom room = createGroupRoom(false, true);
        ChatMember member = addMember(room, memberAccount, ChatRole.MEMBER);

        when(messageHelper.getChatRoom(702L)).thenReturn(room);
        when(chatRoomPermissionGuard.getCurrentMember(room, memberAccount.getAccountId())).thenReturn(member);
        doThrow(new InvalidException("Members are not allowed to send messages in this room"))
                .when(chatRoomPermissionGuard)
                .assertCanPerformAction(room, member, ChatRoomPermissionAction.SEND_MESSAGE);

        InvalidException exception = assertThrows(
                InvalidException.class,
                () -> service.sendContactCardMessages(702L, List.of(99L), memberAccount)
        );

        assertEquals("Members are not allowed to send messages in this room", exception.getMessage());
        verify(messageHelper, never()).saveAndDispatchMessageOptimized(any(), any(), any());
    }

    private MessageServiceImpl createService() {
        return new MessageServiceImpl(
                storageService,
                aiService,
                messageHiddenRepository,
                messageRepository,
                chatRoomRepository,
                userRepository,
                chatRoomCacheService,
                messageHelper,
                chatRoomPermissionGuard
        );
    }

    private Applicant createAccount(Long accountId) {
        Applicant applicant = new Applicant();
        applicant.setAccountId(accountId);
        applicant.setEmail("member-" + accountId + "@mail.test");
        applicant.setUsername("member_" + accountId);
        return applicant;
    }

    private ChatRoom createGroupRoom(boolean allowMemberSendMessage, boolean allowModeratorSendMessage) {
        ChatRoom room = new ChatRoom();
        room.setRoomId(600L);
        room.setType(ChatRoomType.GROUP);
        room.setAllowMemberSendMessage(allowMemberSendMessage);
        room.setAllowModeratorSendMessage(allowModeratorSendMessage);
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
