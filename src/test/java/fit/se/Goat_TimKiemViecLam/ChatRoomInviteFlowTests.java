package fit.se.Goat_TimKiemViecLam;

import iuh.fit.goat.GoatTimKiemViecLamApplication;
import iuh.fit.goat.common.MessageEvent;
import iuh.fit.goat.dto.response.chat.InviteLinkResponse;
import iuh.fit.goat.dto.response.chat.JoinByInviteResponse;
import iuh.fit.goat.entity.Applicant;
import iuh.fit.goat.entity.ChatMember;
import iuh.fit.goat.entity.ChatRoom;
import iuh.fit.goat.enumeration.ChatRole;
import iuh.fit.goat.enumeration.ChatRoomType;
import iuh.fit.goat.exception.ConflictException;
import iuh.fit.goat.exception.InvalidException;
import iuh.fit.goat.exception.NotFoundException;
import iuh.fit.goat.repository.ChatMemberRepository;
import iuh.fit.goat.repository.ChatRoomRepository;
import iuh.fit.goat.repository.CompanyRepository;
import iuh.fit.goat.repository.MessageRepository;
import iuh.fit.goat.repository.UserRelationshipRepository;
import iuh.fit.goat.service.AiService;
import iuh.fit.goat.service.ChatRoomService;
import iuh.fit.goat.service.MessageService;
import iuh.fit.goat.service.NotificationService;
import iuh.fit.goat.service.impl.ChatRoomServiceImpl;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ContextConfiguration;

import java.time.Instant;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.verify;

@DataJpaTest(
        properties = {
                "spring.jpa.hibernate.ddl-auto=create-drop",
                "spring.liquibase.enabled=false",
                "goat.fe.url=http://localhost:3000/"
        },
        excludeFilters = @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, classes = CompanyRepository.class)
)
@Import(ChatRoomServiceImpl.class)
@ContextConfiguration(classes = GoatTimKiemViecLamApplication.class)
class ChatRoomInviteFlowTests {

    @Autowired
    private ChatRoomRepository chatRoomRepository;

    @Autowired
    private ChatMemberRepository chatMemberRepository;

    @Autowired
    private ChatRoomService chatRoomService;

    @Autowired
    private TestEntityManager testEntityManager;

    @MockBean
    private CompanyRepository companyRepository;

    @MockBean
    private MessageService messageService;

    @MockBean
    private NotificationService notificationService;

    @MockBean
    private AiService aiService;

    @MockBean
    private UserRelationshipRepository userRelationshipRepository;

    @MockBean
    private MessageRepository messageRepository;

    @Test
    void shouldSaveAndLoadInviteFieldsThroughJpa() {
        Instant rotatedAt = Instant.parse("2026-04-28T10:15:30Z");
        ChatRoom chatRoom = createRoom("room-invite-token-001", false);
        chatRoom.setInviteRotatedAt(rotatedAt);

        ChatRoom saved = chatRoomRepository.saveAndFlush(chatRoom);
        testEntityManager.clear();

        ChatRoom reloaded = chatRoomRepository.findById(saved.getRoomId()).orElseThrow();
        assertEquals("room-invite-token-001", reloaded.getInviteToken());
        assertFalse(reloaded.isInviteEnabled());
        assertEquals(rotatedAt, reloaded.getInviteRotatedAt());
    }

    @Test
    void shouldKeepEnabledLookupRestrictedButAllowTokenOnlyLookupForDisabledRoom() {
        ChatRoom disabledRoom = chatRoomRepository.saveAndFlush(createRoom("disabled-token", false));

        Optional<ChatRoom> enabledLookup =
                chatRoomRepository.findByInviteTokenAndInviteEnabledTrueAndDeletedAtIsNull("disabled-token");
        Optional<ChatRoom> tokenOnlyLookup =
                chatRoomRepository.findByInviteTokenAndDeletedAtIsNull("disabled-token");

        assertTrue(enabledLookup.isEmpty());
        assertTrue(tokenOnlyLookup.isPresent());
        assertEquals(disabledRoom.getRoomId(), tokenOnlyLookup.get().getRoomId());
    }

    @Test
    void shouldNotReturnSoftDeletedRoomInTokenOnlyLookup() {
        ChatRoom deletedRoom = createRoom("deleted-token", true);
        deletedRoom.setDeletedAt(Instant.parse("2026-04-28T11:00:00Z"));
        chatRoomRepository.saveAndFlush(deletedRoom);

        Optional<ChatRoom> lookup = chatRoomRepository.findByInviteTokenAndDeletedAtIsNull("deleted-token");

        assertTrue(lookup.isEmpty());
    }

    @Test
    void getInviteLink_shouldAllowMemberAndRejectNonMember() throws Exception {
        Applicant owner = createApplicant("owner");
        Applicant member = createApplicant("member");
        Applicant outsider = createApplicant("outsider");

        ChatRoom room = createRoom("member-token-001", true);
        room = chatRoomRepository.saveAndFlush(room);
        final Long roomId = room.getRoomId();
        addMember(room, owner, ChatRole.OWNER);
        addMember(room, member, ChatRole.MEMBER);

        InviteLinkResponse response = chatRoomService.getInviteLink(member, roomId);
        assertEquals(roomId, response.getRoomId());
        assertEquals("member-token-001", response.getInviteToken());
        assertTrue(response.isInviteEnabled());
        assertEquals("http://localhost:3000/invite/member-token-001", response.getInviteLink());

        assertThrows(InvalidException.class, () -> chatRoomService.getInviteLink(outsider, roomId));
    }

    @Test
    void isUserInChatRoom_shouldUseValueEqualityForLargeAccountIds() {
        ChatRoom room = createRoom("large-id-token", true);
        Applicant member = new Applicant();
        member.setAccountId(10_000L);
        ChatMember chatMember = new ChatMember();
        chatMember.setAccount(member);
        room.getMembers().add(chatMember);

        assertTrue(chatRoomService.isUserInChatRoom(room, Long.valueOf("10000")));
    }

    @Test
    void rotateInviteLink_shouldRequireOwnerAndInvalidateOldTokenForJoin() throws Exception {
        Applicant owner = createApplicant("rotate-owner");
        Applicant member = createApplicant("rotate-member");
        Applicant joiner = createApplicant("rotate-joiner");

        ChatRoom room = createRoom("rotate-token-old", true);
        room = chatRoomRepository.saveAndFlush(room);
        final Long roomId = room.getRoomId();
        addMember(room, owner, ChatRole.OWNER);
        addMember(room, member, ChatRole.MEMBER);

        assertThrows(InvalidException.class, () -> chatRoomService.rotateInviteLink(member, roomId));

        InviteLinkResponse response = chatRoomService.rotateInviteLink(owner, roomId);
        assertEquals(roomId, response.getRoomId());
        assertNotEquals("rotate-token-old", response.getInviteToken());
        assertTrue(response.isInviteEnabled());
        assertNotNull(response.getInviteRotatedAt());

        assertThrows(NotFoundException.class, () -> chatRoomService.joinByInvite(joiner, "rotate-token-old"));
        JoinByInviteResponse joined = chatRoomService.joinByInvite(joiner, response.getInviteToken());
        assertTrue(joined.isJoined());
        assertEquals(roomId, joined.getRoomId());

        ChatRoom reloaded = chatRoomRepository.findByRoomIdAndDeletedAtIsNull(roomId).orElseThrow();
        assertTrue(reloaded.isInviteEnabled());
        assertNotEquals("rotate-token-old", reloaded.getInviteToken());
        assertTrue(chatRoomRepository.findByInviteTokenAndDeletedAtIsNull("rotate-token-old").isEmpty());
        assertTrue(chatMemberRepository.existsByRoomRoomIdAndAccountAccountIdAndDeletedAtIsNull(roomId, joiner.getAccountId()));
    }

    @Test
    void toggleInviteLink_shouldRequireOwnerAndOnlyToggleEnabledState() throws Exception {
        Applicant owner = createApplicant("toggle-owner");
        Applicant member = createApplicant("toggle-member");
        Applicant joiner = createApplicant("toggle-joiner");

        ChatRoom room = createRoom("toggle-token", true);
        room.setInviteRotatedAt(Instant.parse("2026-04-28T10:00:00Z"));
        room = chatRoomRepository.saveAndFlush(room);
        final Long roomId = room.getRoomId();
        addMember(room, owner, ChatRole.OWNER);
        addMember(room, member, ChatRole.MEMBER);

        assertThrows(InvalidException.class, () -> chatRoomService.toggleInviteLink(member, roomId, false));

        InviteLinkResponse toggled = chatRoomService.toggleInviteLink(owner, roomId, false);
        assertFalse(toggled.isInviteEnabled());
        assertEquals("toggle-token", toggled.getInviteToken());
        assertEquals(Instant.parse("2026-04-28T10:00:00Z"), toggled.getInviteRotatedAt());
        assertThrows(InvalidException.class, () -> chatRoomService.joinByInvite(joiner, "toggle-token"));

        InviteLinkResponse reEnabled = chatRoomService.toggleInviteLink(owner, roomId, true);
        assertTrue(reEnabled.isInviteEnabled());
        assertEquals("toggle-token", reEnabled.getInviteToken());
        assertEquals(Instant.parse("2026-04-28T10:00:00Z"), reEnabled.getInviteRotatedAt());

        JoinByInviteResponse joined = chatRoomService.joinByInvite(joiner, "toggle-token");
        assertTrue(joined.isJoined());
        assertEquals(roomId, joined.getRoomId());

        ChatRoom reloaded = chatRoomRepository.findByRoomIdAndDeletedAtIsNull(roomId).orElseThrow();
        assertTrue(reloaded.isInviteEnabled());
        assertEquals("toggle-token", reloaded.getInviteToken());
        assertEquals(Instant.parse("2026-04-28T10:00:00Z"), reloaded.getInviteRotatedAt());
        assertTrue(chatMemberRepository.existsByRoomRoomIdAndAccountAccountIdAndDeletedAtIsNull(roomId, joiner.getAccountId()));
    }

    @Test
    void joinByInvite_shouldValidateRulesAndCreateMembership() throws Exception {
        Applicant owner = createApplicant("join-owner");
        Applicant existing = createApplicant("join-existing");
        Applicant joiner = createApplicant("joiner");

        ChatRoom room = createRoom("join-token-disabled", false);
        room = chatRoomRepository.saveAndFlush(room);
        addMember(room, owner, ChatRole.OWNER);
        addMember(room, existing, ChatRole.MEMBER);

        assertThrows(NotFoundException.class, () -> chatRoomService.joinByInvite(joiner, "not-found-token"));
        assertThrows(InvalidException.class, () -> chatRoomService.joinByInvite(null, "join-token-disabled"));
        assertThrows(InvalidException.class, () -> chatRoomService.joinByInvite(joiner, "join-token-disabled"));

        room.setInviteEnabled(true);
        chatRoomRepository.saveAndFlush(room);

        assertThrows(InvalidException.class, () -> chatRoomService.joinByInvite(null, "join-token-disabled"));
        assertThrows(ConflictException.class, () -> chatRoomService.joinByInvite(existing, "join-token-disabled"));

        JoinByInviteResponse response = chatRoomService.joinByInvite(joiner, "join-token-disabled");
        assertTrue(response.isJoined());
        assertEquals(room.getRoomId(), response.getRoomId());
        assertTrue(chatMemberRepository.existsByRoomRoomIdAndAccountAccountIdAndDeletedAtIsNull(room.getRoomId(), joiner.getAccountId()));
    }

    @Test
    void joinByInvite_shouldCreateSystemMessageEvent() throws Exception {
        Applicant owner = createApplicant("join-event-owner");
        Applicant joiner = createApplicant("join-event-joiner");

        ChatRoom room = createRoom("join-event-token", true);
        room = chatRoomRepository.saveAndFlush(room);
        addMember(room, owner, ChatRole.OWNER);

        JoinByInviteResponse response = chatRoomService.joinByInvite(joiner, "join-event-token");

        assertTrue(response.isJoined());
        assertEquals(room.getRoomId(), response.getRoomId());
        verify(messageService).createAndSendSystemMessage(
                room.getRoomId(),
                MessageEvent.MEMBER_JOINED_BY_INVITE,
                joiner
        );
    }

    @Test
    void getInviteLink_shouldRejectDirectRoom() {
        Applicant applicant = createApplicant("direct-get");
        ChatRoom directRoom = chatRoomRepository.saveAndFlush(createRoom("direct-get-token", true, ChatRoomType.DIRECT));

        InvalidException exception = assertThrows(InvalidException.class,
                () -> chatRoomService.getInviteLink(applicant, directRoom.getRoomId()));
        assertEquals("This operation is only available for group chats", exception.getMessage());
    }

    @Test
    void rotateInviteLink_shouldRejectDirectRoom() {
        Applicant applicant = createApplicant("direct-rotate");
        ChatRoom directRoom = chatRoomRepository.saveAndFlush(createRoom("direct-rotate-token", true, ChatRoomType.DIRECT));

        InvalidException exception = assertThrows(InvalidException.class,
                () -> chatRoomService.rotateInviteLink(applicant, directRoom.getRoomId()));
        assertEquals("This operation is only available for group chats", exception.getMessage());
    }

    @Test
    void toggleInviteLink_shouldRejectDirectRoom() {
        Applicant applicant = createApplicant("direct-toggle");
        ChatRoom directRoom = chatRoomRepository.saveAndFlush(createRoom("direct-toggle-token", true, ChatRoomType.DIRECT));

        InvalidException exception = assertThrows(InvalidException.class,
                () -> chatRoomService.toggleInviteLink(applicant, directRoom.getRoomId(), false));
        assertEquals("This operation is only available for group chats", exception.getMessage());
    }

    @Test
    void joinByInvite_shouldRejectDirectRoomToken() {
        Applicant applicant = createApplicant("direct-join");
        ChatRoom directRoom = chatRoomRepository.saveAndFlush(createRoom("direct-join-token", true, ChatRoomType.DIRECT));

        InvalidException exception = assertThrows(InvalidException.class,
                () -> chatRoomService.joinByInvite(applicant, directRoom.getInviteToken()));
        assertEquals("This operation is only available for group chats", exception.getMessage());
    }

    private Applicant createApplicant(String seed) {
        Applicant applicant = new Applicant();
        applicant.setUsername(seed + "_username");
        applicant.setEmail(seed + "@mail.test");
        applicant.setPassword("pwd123");
        applicant.setFullName("User " + seed);
        return testEntityManager.persistAndFlush(applicant);
    }

    private ChatMember addMember(ChatRoom room, Applicant account, ChatRole role) {
        ChatMember member = new ChatMember();
        member.setRoom(room);
        member.setAccount(account);
        member.setRole(role);
        room.getMembers().add(member);
        return chatMemberRepository.saveAndFlush(member);
    }

    private ChatRoom createRoom(String inviteToken, boolean inviteEnabled) {
        return createRoom(inviteToken, inviteEnabled, ChatRoomType.GROUP);
    }

    private ChatRoom createRoom(String inviteToken, boolean inviteEnabled, ChatRoomType type) {
        ChatRoom room = new ChatRoom();
        room.setName("Task 2 Room " + inviteToken);
        room.setType(type);
        room.setInviteToken(inviteToken);
        room.setInviteEnabled(inviteEnabled);
        return room;
    }
}
