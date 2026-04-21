package iuh.fit.goat.service.impl;

import iuh.fit.goat.config.AgoraRtcProperties;
import iuh.fit.goat.dto.response.chat.ChatCallTokenResponse;
import iuh.fit.goat.entity.Account;
import iuh.fit.goat.exception.InvalidException;
import iuh.fit.goat.exception.PermissionException;
import iuh.fit.goat.service.ChatRoomService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

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

    private AgoraRtcProperties agoraRtcProperties;
    private AgoraRtcTokenServiceImpl agoraRtcTokenService;

    @BeforeEach
    void setUp() {
        this.agoraRtcProperties = new AgoraRtcProperties();
        this.agoraRtcProperties.setAppId("0123456789abcdef0123456789abcdef");
        this.agoraRtcProperties.setAppCertificate("fedcba9876543210fedcba9876543210");
        this.agoraRtcProperties.setTokenTtlSeconds(600);
        this.agoraRtcProperties.setChannelPrefix("chatroom-");

        this.agoraRtcTokenService = new AgoraRtcTokenServiceImpl(this.agoraRtcProperties, this.chatRoomService);
    }

    @Test
    void issueChatRoomRtcToken_shouldReturnToken_whenUserBelongsToChatRoom() throws InvalidException, PermissionException {
        Account account = mock(Account.class);
        when(account.getAccountId()).thenReturn(123L);
        when(this.chatRoomService.isUserInChatRoom(10L, 123L)).thenReturn(true);

        ChatCallTokenResponse response = this.agoraRtcTokenService.issueChatRoomRtcToken(account, 10L, true);

        assertNotNull(response);
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
                () -> this.agoraRtcTokenService.issueChatRoomRtcToken(account, 10L, true)
        );
    }

    @Test
    void issueChatRoomRtcToken_shouldThrowInvalidException_whenAgoraConfigMissing() {
        this.agoraRtcProperties.setAppId("");

        Account account = mock(Account.class);
        when(account.getAccountId()).thenReturn(123L);

        assertThrows(
                InvalidException.class,
                () -> this.agoraRtcTokenService.issueChatRoomRtcToken(account, 10L, true)
        );
    }
}
