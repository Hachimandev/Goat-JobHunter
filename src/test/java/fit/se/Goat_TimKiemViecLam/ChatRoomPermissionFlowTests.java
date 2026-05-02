package fit.se.Goat_TimKiemViecLam;

import iuh.fit.goat.GoatTimKiemViecLamApplication;
import iuh.fit.goat.dto.request.chat.UpdateChatRoomPermissionsRequest;
import iuh.fit.goat.dto.request.chat.UpdateGroupInfoRequest;
import iuh.fit.goat.dto.response.chat.ChatRoomPermissionResponse;
import iuh.fit.goat.dto.response.chat.ChatRoomResponse;
import iuh.fit.goat.entity.Applicant;
import iuh.fit.goat.entity.ChatMember;
import iuh.fit.goat.entity.ChatRoom;
import iuh.fit.goat.enumeration.ChatRole;
import iuh.fit.goat.enumeration.ChatRoomPrivacy;
import iuh.fit.goat.enumeration.ChatRoomType;
import iuh.fit.goat.exception.InvalidException;
import iuh.fit.goat.repository.ChatMemberRepository;
import iuh.fit.goat.repository.ChatRoomRepository;
import iuh.fit.goat.repository.CompanyRepository;
import iuh.fit.goat.repository.MessageRepository;
import iuh.fit.goat.repository.UserRelationshipRepository;
import iuh.fit.goat.service.AiService;
import iuh.fit.goat.service.ChatRoomService;
import iuh.fit.goat.service.MessageService;
import iuh.fit.goat.service.NotificationService;
import iuh.fit.goat.service.cache.ChatRoomCacheService;
import iuh.fit.goat.service.helper.ChatRoomPermissionGuard;
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

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

@DataJpaTest(
        properties = {
                "spring.jpa.hibernate.ddl-auto=create-drop",
                "spring.liquibase.enabled=false",
                "goat.fe.url=http://localhost:3000/"
        },
        excludeFilters = @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, classes = CompanyRepository.class)
)
@Import({ChatRoomServiceImpl.class, ChatRoomPermissionGuard.class})
@ContextConfiguration(classes = GoatTimKiemViecLamApplication.class)
class ChatRoomPermissionFlowTests {

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

    @MockBean
    private ChatRoomCacheService chatRoomCacheService;

    @Test
    void shouldPersistChatRoomPermissionDefaultsAsTrue() {
        ChatRoom room = createRoom(ChatRoomType.GROUP);

        ChatRoom saved = chatRoomRepository.saveAndFlush(room);
        testEntityManager.clear();

        ChatRoom reloaded = chatRoomRepository.findById(saved.getRoomId()).orElseThrow();
        assertTrue(reloaded.isAllowMemberUpdate());
        assertTrue(reloaded.isAllowMemberPin());
        assertTrue(reloaded.isAllowMemberCreateVote());
        assertTrue(reloaded.isAllowMemberSendMessage());
        assertTrue(reloaded.isAllowModeratorSendMessage());
    }

    @Test
    void getDetailChatRoomInformation_shouldIncludePermissionFields() throws Exception {
        Applicant member = createApplicant("detail-member");
        ChatRoom room = chatRoomRepository.saveAndFlush(createRoom(ChatRoomType.GROUP));
        room.setAllowMemberUpdate(false);
        room.setAllowMemberPin(false);
        room.setAllowMemberCreateVote(true);
        room.setAllowMemberSendMessage(false);
        room.setAllowModeratorSendMessage(true);
        room = chatRoomRepository.saveAndFlush(room);
        addMember(room, member, ChatRole.MEMBER);

        ChatRoomResponse response = chatRoomService.getDetailChatRoomInformation(member, room.getRoomId());

        assertFalse(response.isAllowMemberUpdate());
        assertFalse(response.isAllowMemberPin());
        assertTrue(response.isAllowMemberCreateVote());
        assertFalse(response.isAllowMemberSendMessage());
        assertTrue(response.isAllowModeratorSendMessage());
    }

    @Test
    void getGroupPermissions_shouldAllowMemberAndReturnRoomPermissionState() throws Exception {
        Applicant member = createApplicant("permission-member");
        ChatRoom room = chatRoomRepository.saveAndFlush(createRoom(ChatRoomType.GROUP));
        room.setAllowMemberUpdate(false);
        room.setAllowMemberPin(true);
        room.setAllowMemberCreateVote(false);
        room.setAllowMemberSendMessage(true);
        room.setAllowModeratorSendMessage(false);
        room = chatRoomRepository.saveAndFlush(room);
        addMember(room, member, ChatRole.MEMBER);

        ChatRoomPermissionResponse response = chatRoomService.getGroupPermissions(member, room.getRoomId());

        assertEquals(room.getRoomId(), response.getRoomId());
        assertFalse(response.isAllowMemberUpdate());
        assertTrue(response.isAllowMemberPin());
        assertFalse(response.isAllowMemberCreateVote());
        assertTrue(response.isAllowMemberSendMessage());
        assertFalse(response.isAllowModeratorSendMessage());
    }

    @Test
    void updateGroupPermissions_shouldAllowOwnerToUpdateAllFlags() throws Exception {
        Applicant owner = createApplicant("permission-owner");
        ChatRoom room = chatRoomRepository.saveAndFlush(createRoom(ChatRoomType.GROUP));
        addMember(room, owner, ChatRole.OWNER);

        ChatRoomPermissionResponse response = chatRoomService.updateGroupPermissions(
                owner,
                room.getRoomId(),
                new UpdateChatRoomPermissionsRequest(false, false, true, false, false)
        );

        assertFalse(response.isAllowMemberUpdate());
        assertFalse(response.isAllowMemberPin());
        assertTrue(response.isAllowMemberCreateVote());
        assertFalse(response.isAllowMemberSendMessage());
        assertFalse(response.isAllowModeratorSendMessage());
    }

    @Test
    void updateGroupPermissions_shouldAllowModeratorToUpdateMemberFlagsOnlyWhenModeratorFlagUnchanged() throws Exception {
        Applicant owner = createApplicant("permission-owner-2");
        Applicant moderator = createApplicant("permission-moderator");
        ChatRoom room = chatRoomRepository.saveAndFlush(createRoom(ChatRoomType.GROUP));
        addMember(room, owner, ChatRole.OWNER);
        addMember(room, moderator, ChatRole.MODERATOR);

        ChatRoomPermissionResponse response = chatRoomService.updateGroupPermissions(
                moderator,
                room.getRoomId(),
                new UpdateChatRoomPermissionsRequest(false, false, false, true, true)
        );

        assertFalse(response.isAllowMemberUpdate());
        assertFalse(response.isAllowMemberPin());
        assertFalse(response.isAllowMemberCreateVote());
        assertTrue(response.isAllowMemberSendMessage());
        assertTrue(response.isAllowModeratorSendMessage());
    }

    @Test
    void updateGroupPermissions_shouldRejectModeratorChangingModeratorSendFlag() {
        Applicant owner = createApplicant("permission-owner-3");
        Applicant moderator = createApplicant("permission-moderator-2");
        ChatRoom room = chatRoomRepository.saveAndFlush(createRoom(ChatRoomType.GROUP));
        addMember(room, owner, ChatRole.OWNER);
        addMember(room, moderator, ChatRole.MODERATOR);

        InvalidException exception = assertThrows(
                InvalidException.class,
                () -> chatRoomService.updateGroupPermissions(
                        moderator,
                        room.getRoomId(),
                        new UpdateChatRoomPermissionsRequest(true, true, true, true, false)
                )
        );

        assertEquals("Moderators cannot update moderator send message permission", exception.getMessage());
    }

    @Test
    void updateGroupPermissions_shouldRejectMember() {
        Applicant owner = createApplicant("permission-owner-4");
        Applicant member = createApplicant("permission-member-2");
        ChatRoom room = chatRoomRepository.saveAndFlush(createRoom(ChatRoomType.GROUP));
        addMember(room, owner, ChatRole.OWNER);
        addMember(room, member, ChatRole.MEMBER);

        InvalidException exception = assertThrows(
                InvalidException.class,
                () -> chatRoomService.updateGroupPermissions(
                        member,
                        room.getRoomId(),
                        new UpdateChatRoomPermissionsRequest(false, false, false, false, false)
                )
        );

        assertEquals("Only owners and moderators can update group permissions", exception.getMessage());
    }

    @Test
    void updateGroupInfo_shouldAllowMemberWhenMemberUpdatePermissionIsEnabled() throws Exception {
        Applicant owner = createApplicant("group-owner");
        Applicant member = createApplicant("group-member");
        ChatRoom room = chatRoomRepository.saveAndFlush(createRoom(ChatRoomType.GROUP));
        room.setAllowMemberUpdate(true);
        room = chatRoomRepository.saveAndFlush(room);
        addMember(room, owner, ChatRole.OWNER);
        addMember(room, member, ChatRole.MEMBER);

        ChatRoom updated = chatRoomService.updateGroupInfo(
                member,
                room.getRoomId(),
                new UpdateGroupInfoRequest("Updated by member", null, ChatRoomPrivacy.PRIVATE)
        );

        assertEquals("Updated by member", updated.getName());
        assertEquals(ChatRoomPrivacy.PRIVATE, updated.getPrivacy());
    }

    @Test
    void updateGroupInfo_shouldRejectMemberWhenMemberUpdatePermissionIsDisabled() {
        Applicant owner = createApplicant("group-owner-2");
        Applicant member = createApplicant("group-member-2");
        ChatRoom room = chatRoomRepository.saveAndFlush(createRoom(ChatRoomType.GROUP));
        room.setAllowMemberUpdate(false);
        room = chatRoomRepository.saveAndFlush(room);
        Long roomId = room.getRoomId();
        addMember(room, owner, ChatRole.OWNER);
        addMember(room, member, ChatRole.MEMBER);

        InvalidException exception = assertThrows(
                InvalidException.class,
                () -> chatRoomService.updateGroupInfo(
                        member,
                        roomId,
                        new UpdateGroupInfoRequest("Denied", null, ChatRoomPrivacy.PRIVATE)
                )
        );

        assertEquals("Members are not allowed to update group info in this room", exception.getMessage());
    }

    @Test
    void getGroupPermissions_shouldRejectDirectRoom() {
        Applicant applicant = createApplicant("direct-permission");
        ChatRoom room = chatRoomRepository.saveAndFlush(createRoom(ChatRoomType.DIRECT));
        addMember(room, applicant, ChatRole.OWNER);

        InvalidException exception = assertThrows(
                InvalidException.class,
                () -> chatRoomService.getGroupPermissions(applicant, room.getRoomId())
        );

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

    private ChatRoom createRoom(ChatRoomType type) {
        ChatRoom room = new ChatRoom();
        room.setName("Permission Room " + type.name());
        room.setType(type);
        room.setInviteToken(type.name().toLowerCase() + "-permission-token-" + System.nanoTime());
        room.setInviteEnabled(true);
        return room;
    }
}
