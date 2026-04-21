package iuh.fit.goat.service.impl;

import iuh.fit.goat.component.agora.token.RtcTokenBuilder2;
import iuh.fit.goat.config.AgoraRtcProperties;
import iuh.fit.goat.dto.response.chat.ChatCallTokenResponse;
import iuh.fit.goat.entity.Account;
import iuh.fit.goat.exception.InvalidException;
import iuh.fit.goat.exception.PermissionException;
import iuh.fit.goat.service.AgoraRtcTokenService;
import iuh.fit.goat.service.ChatRoomService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.nio.charset.StandardCharsets;
import java.time.Instant;

@Service
@RequiredArgsConstructor
public class AgoraRtcTokenServiceImpl implements AgoraRtcTokenService {
    private static final int MAX_TOKEN_TTL_SECONDS = 24 * 60 * 60;
    private static final String DEFAULT_CHANNEL_PREFIX = "chatroom-";

    private final AgoraRtcProperties agoraRtcProperties;
    private final ChatRoomService chatRoomService;

    private final RtcTokenBuilder2 tokenBuilder = new RtcTokenBuilder2();

    @Override
    @Transactional(readOnly = true)
    public ChatCallTokenResponse issueChatRoomRtcToken(Account currentAccount, Long chatRoomId, boolean publisher)
            throws InvalidException, PermissionException {
        if (currentAccount == null) {
            throw new InvalidException("User not found");
        }
        if (chatRoomId == null || chatRoomId <= 0) {
            throw new InvalidException("Chat room not found");
        }

        boolean isMember = this.chatRoomService.isUserInChatRoom(chatRoomId, currentAccount.getAccountId());
        if (!isMember) {
            throw new PermissionException("User is not belong to this chat room");
        }

        String appId = normalized(this.agoraRtcProperties.getAppId());
        String appCertificate = normalized(this.agoraRtcProperties.getAppCertificate());
        validateAgoraSecrets(appId, appCertificate);

        int ttlSeconds = this.agoraRtcProperties.getTokenTtlSeconds();
        validateTokenTtl(ttlSeconds);

        int uid = toAgoraUid(currentAccount.getAccountId());
        String channelName = buildChannelName(chatRoomId);

        RtcTokenBuilder2.Role role = publisher
                ? RtcTokenBuilder2.Role.ROLE_PUBLISHER
                : RtcTokenBuilder2.Role.ROLE_SUBSCRIBER;

        String token = this.tokenBuilder.buildTokenWithUid(
                appId,
                appCertificate,
                channelName,
                uid,
                role,
                ttlSeconds,
                ttlSeconds
        );

        if (!StringUtils.hasText(token)) {
            throw new InvalidException("Failed to generate Agora RTC token");
        }

        long expiresAtEpochMs = Instant.now().plusSeconds(ttlSeconds).toEpochMilli();

        return new ChatCallTokenResponse(
                appId,
                channelName,
                uid,
                token,
                expiresAtEpochMs,
                ttlSeconds,
                publisher
        );
    }

    private void validateAgoraSecrets(String appId, String appCertificate) throws InvalidException {
        if (!StringUtils.hasText(appId) || !StringUtils.hasText(appCertificate)) {
            throw new InvalidException("Agora RTC is not configured");
        }
    }

    private void validateTokenTtl(int ttlSeconds) throws InvalidException {
        if (ttlSeconds <= 0 || ttlSeconds > MAX_TOKEN_TTL_SECONDS) {
            throw new InvalidException("Agora token ttl must be between 1 and 86400 seconds");
        }
    }

    private int toAgoraUid(long accountId) throws InvalidException {
        if (accountId <= 0 || accountId > Integer.MAX_VALUE) {
            throw new InvalidException("Current account id is not valid for Agora UID");
        }
        return (int) accountId;
    }

    private String buildChannelName(Long chatRoomId) throws InvalidException {
        String prefix = normalized(this.agoraRtcProperties.getChannelPrefix());
        if (!StringUtils.hasText(prefix)) {
            prefix = DEFAULT_CHANNEL_PREFIX;
        }

        String channelName = prefix + chatRoomId;
        int channelLength = channelName.getBytes(StandardCharsets.UTF_8).length;
        if (channelLength > 64) {
            throw new InvalidException("Generated Agora channel name exceeds 64 bytes");
        }

        return channelName;
    }

    private String normalized(String value) {
        return value == null ? "" : value.trim();
    }
}
