package fit.se.Goat_TimKiemViecLam;

import iuh.fit.goat.entity.ChatRoom;
import iuh.fit.goat.enumeration.ChatRoomType;
import iuh.fit.goat.GoatTimKiemViecLamApplication;
import iuh.fit.goat.repository.ChatRoomRepository;
import iuh.fit.goat.repository.CompanyRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.test.context.ContextConfiguration;

import java.time.Instant;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest(
        properties = {
                "spring.jpa.hibernate.ddl-auto=create-drop",
                "spring.liquibase.enabled=false"
        },
        excludeFilters = @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, classes = CompanyRepository.class)
)
@ContextConfiguration(classes = GoatTimKiemViecLamApplication.class)
class ChatRoomInviteFlowTests {

    @Autowired
    private ChatRoomRepository chatRoomRepository;

    @Autowired
    private TestEntityManager testEntityManager;

    @MockBean
    private CompanyRepository companyRepository;

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

    private ChatRoom createRoom(String inviteToken, boolean inviteEnabled) {
        ChatRoom room = new ChatRoom();
        room.setName("Task 1 Room " + inviteToken);
        room.setType(ChatRoomType.GROUP);
        room.setInviteToken(inviteToken);
        room.setInviteEnabled(inviteEnabled);
        return room;
    }

}
