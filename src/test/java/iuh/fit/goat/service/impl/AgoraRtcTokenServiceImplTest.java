package iuh.fit.goat.service.impl;

import iuh.fit.goat.config.AgoraRtcProperties;
import iuh.fit.goat.dto.response.chat.ChatCallTokenResponse;
import iuh.fit.goat.entity.Account;
import iuh.fit.goat.entity.ChatCallSession;
import iuh.fit.goat.entity.ChatRoom;
import iuh.fit.goat.enumeration.ChatCallSessionStatus;
import iuh.fit.goat.exception.InvalidException;
import iuh.fit.goat.exception.PermissionException;
import iuh.fit.goat.repository.ChatCallSessionRepository;
import iuh.fit.goat.service.ChatRoomService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AgoraRtcTokenServiceImplTest {

    @Mock
    private ChatRoomService chatRoomService;

    @Mock
    private ChatCallSessionRepository chatCallSessionRepository;

    private AgoraRtcProperties agoraRtcProperties;
    private AgoraRtcTokenServiceImpl agoraRtcTokenService;

    @BeforeEach
    void setUp() {
        this.agoraRtcProperties = new AgoraRtcProperties();
        this.agoraRtcProperties.setAppId("0123456789abcdef0123456789abcdef");
        this.agoraRtcProperties.setAppCertificate("fedcba9876543210fedcba9876543210");
        this.agoraRtcProperties.setTokenTtlSeconds(600);
        this.agoraRtcProperties.setChannelPrefix("chatroom-");

        this.agoraRtcTokenService = new AgoraRtcTokenServiceImpl(
                this.agoraRtcProperties,
                this.chatRoomService,
                this.chatCallSessionRepository
        );
    }

    @Test
    void issueChatRoomRtcToken_shouldReturnToken_whenUserBelongsToChatRoom() throws InvalidException, PermissionException {
        Account account = mock(Account.class);
        when(account.getAccountId()).thenReturn(123L);
        when(this.chatRoomService.isUserInChatRoom(10L, 123L)).thenReturn(true);
        when(this.chatCallSessionRepository
                .findFirstByChatRoomRoomIdAndStatusInAndDeletedAtIsNullOrderByCreatedAtDesc(org.mockito.ArgumentMatchers.eq(10L), org.mockito.ArgumentMatchers.anyCollection()))
                .thenReturn(Optional.of(mockActiveSession(1L, 10L, "chatroom-10")));

        ChatCallTokenResponse response = this.agoraRtcTokenService.issueChatRoomRtcToken(account, 10L, 1L, true);

        assertNotNull(response);
        assertEquals(1L, response.getSessionId());
        assertEquals("0123456789abcdef0123456789abcdef", response.getAppId());
        assertEquals("chatroom-10", response.getChannelName());
        assertEquals(123, response.getUid());
        assertEquals(600, response.getTtlSeconds());
        assertFalse(response.getToken().isBlank());
    }

    @Test
    void issueChatRoomRtcToken_shouldThrowPermissionException_whenUserNotInChatRoom() throws InvalidException {
        Account account = mock(Account.class);
        when(account.getAccountId()).thenReturn(123L);
        when(this.chatRoomService.isUserInChatRoom(10L, 123L)).thenReturn(false);

        assertThrows(
                PermissionException.class,
                () -> this.agoraRtcTokenService.issueChatRoomRtcToken(account, 10L, 1L, true)
        );
    }

    @Test
    void issueChatRoomRtcToken_shouldThrowInvalidException_whenAgoraConfigMissing() throws InvalidException {
        this.agoraRtcProperties.setAppId("");

        Account account = mock(Account.class);
        when(account.getAccountId()).thenReturn(123L);
        when(this.chatRoomService.isUserInChatRoom(10L, 123L)).thenReturn(true);

        assertThrows(
                InvalidException.class,
                () -> this.agoraRtcTokenService.issueChatRoomRtcToken(account, 10L, 2L, true)
        );
    }

    @Test
    void issueChatRoomRtcToken_shouldThrowInvalidException_whenNoActiveSession() throws InvalidException {
        Account account = mock(Account.class);
        when(account.getAccountId()).thenReturn(123L);
        when(this.chatRoomService.isUserInChatRoom(10L, 123L)).thenReturn(true);
        when(this.chatCallSessionRepository
                .findFirstByChatRoomRoomIdAndStatusInAndDeletedAtIsNullOrderByCreatedAtDesc(org.mockito.ArgumentMatchers.eq(10L), org.mockito.ArgumentMatchers.anyCollection()))
                .thenReturn(Optional.empty());

        assertThrows(
                InvalidException.class,
                () -> this.agoraRtcTokenService.issueChatRoomRtcToken(account, 10L, null, true)
        );
    }

    @Test
    void issueChatRoomRtcToken_shouldThrowInvalidException_whenSessionIdMismatch() throws InvalidException {
        Account account = mock(Account.class);
        when(account.getAccountId()).thenReturn(123L);
        when(this.chatRoomService.isUserInChatRoom(10L, 123L)).thenReturn(true);
        when(this.chatCallSessionRepository
                .findFirstByChatRoomRoomIdAndStatusInAndDeletedAtIsNullOrderByCreatedAtDesc(org.mockito.ArgumentMatchers.eq(10L), org.mockito.ArgumentMatchers.anyCollection()))
                .thenReturn(Optional.of(mockActiveSession(5L, 10L, "chatroom-10")));

        assertThrows(
                InvalidException.class,
                () -> this.agoraRtcTokenService.issueChatRoomRtcToken(account, 10L, 7L, true)
        );
    }

    private ChatCallSession mockActiveSession(Long sessionId, Long roomId, String channelName) {
        ChatRoom room = new ChatRoom();
        room.setRoomId(roomId);

        ChatCallSession session = new ChatCallSession();
        session.setCallSessionId(sessionId);
        session.setChatRoom(room);
        session.setStatus(ChatCallSessionStatus.ACTIVE);
        session.setAgoraChannelName(channelName);
        session.setStartedAt(Instant.now());
        return session;
    }
}
