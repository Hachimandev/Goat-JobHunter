package fit.se.Goat_TimKiemViecLam;

import iuh.fit.goat.entity.ChatRoom;
import org.junit.jupiter.api.Test;

import java.time.Instant;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

class ChatRoomInviteFlowTests {

    @Test
    void shouldPersistInviteFieldsThroughEntityAccessors() {
        ChatRoom chatRoom = new ChatRoom();
        Instant rotatedAt = Instant.parse("2026-04-28T10:15:30Z");

        chatRoom.setInviteToken("room-invite-token-001");
        chatRoom.setInviteRotatedAt(rotatedAt);
        chatRoom.setInviteEnabled(false);

        assertEquals("room-invite-token-001", chatRoom.getInviteToken());
        assertEquals(rotatedAt, chatRoom.getInviteRotatedAt());
        assertEquals(false, chatRoom.getInviteEnabled());
    }

    @Test
    void shouldAllowNullableInviteRotatedAt() {
        ChatRoom chatRoom = new ChatRoom();
        chatRoom.setInviteRotatedAt(null);
        chatRoom.setInviteEnabled(true);

        assertNull(chatRoom.getInviteRotatedAt());
        assertTrue(chatRoom.getInviteEnabled());
    }
}
