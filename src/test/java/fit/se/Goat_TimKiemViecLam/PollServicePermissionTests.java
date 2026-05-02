package fit.se.Goat_TimKiemViecLam;

import iuh.fit.goat.dto.request.poll.CreatePollRequest;
import iuh.fit.goat.entity.Applicant;
import iuh.fit.goat.entity.ChatMember;
import iuh.fit.goat.entity.ChatRoom;
import iuh.fit.goat.enumeration.ChatRole;
import iuh.fit.goat.enumeration.ChatRoomPermissionAction;
import iuh.fit.goat.enumeration.ChatRoomType;
import iuh.fit.goat.exception.InvalidException;
import iuh.fit.goat.repository.AccountRepository;
import iuh.fit.goat.repository.ChatRoomRepository;
import iuh.fit.goat.repository.PollRepository;
import iuh.fit.goat.repository.PollVoteRepository;
import iuh.fit.goat.service.MessageService;
import iuh.fit.goat.service.helper.ChatRoomPermissionGuard;
import iuh.fit.goat.service.impl.PollServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PollServicePermissionTests {

    @Mock
    private PollRepository pollRepository;

    @Mock
    private PollVoteRepository pollVoteRepository;

    @Mock
    private ChatRoomRepository chatRoomRepository;

    @Mock
    private AccountRepository accountRepository;

    @Mock
    private MessageService messageService;

    @Mock
    private SimpMessagingTemplate messagingTemplate;

    @Mock
    private ChatRoomPermissionGuard chatRoomPermissionGuard;

    @Test
    void createPoll_shouldRejectMemberWhenGroupDisablesCreateVotePermission() throws Exception {
        PollServiceImpl service = new PollServiceImpl(
                pollRepository,
                pollVoteRepository,
                chatRoomRepository,
                accountRepository,
                messageService,
                messagingTemplate,
                chatRoomPermissionGuard
        );
        Applicant memberAccount = createAccount(71L);
        ChatRoom room = createGroupRoom(false);
        ChatMember member = addMember(room, memberAccount, ChatRole.MEMBER);

        when(chatRoomRepository.findByRoomIdAndDeletedAtIsNull(901L)).thenReturn(Optional.of(room));
        when(chatRoomPermissionGuard.getCurrentMember(room, memberAccount.getAccountId())).thenReturn(member);
        doThrow(new InvalidException("Members are not allowed to create polls in this room"))
                .when(chatRoomPermissionGuard)
                .assertCanPerformAction(room, member, ChatRoomPermissionAction.CREATE_POLL);

        InvalidException exception = assertThrows(
                InvalidException.class,
                () -> service.createPoll(
                        901L,
                        new CreatePollRequest("Question?", List.of("A", "B"), false, false, false, null),
                        memberAccount
                )
        );

        assertEquals("Members are not allowed to create polls in this room", exception.getMessage());
        verify(pollRepository, never()).save(any());
    }

    private Applicant createAccount(Long accountId) {
        Applicant applicant = new Applicant();
        applicant.setAccountId(accountId);
        applicant.setEmail("poll-" + accountId + "@mail.test");
        return applicant;
    }

    private ChatRoom createGroupRoom(boolean allowMemberCreateVote) {
        ChatRoom room = new ChatRoom();
        room.setRoomId(900L);
        room.setType(ChatRoomType.GROUP);
        room.setAllowMemberCreateVote(allowMemberCreateVote);
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
