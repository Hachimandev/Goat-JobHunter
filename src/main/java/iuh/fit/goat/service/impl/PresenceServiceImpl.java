package iuh.fit.goat.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import iuh.fit.goat.dto.request.presence.PresenceHeartbeatRequest;
import iuh.fit.goat.dto.response.presence.PresenceStatusResponse;
import iuh.fit.goat.service.PresenceService;
import iuh.fit.goat.service.RedisService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
@RequiredArgsConstructor
public class PresenceServiceImpl implements PresenceService {

    private static final long PRESENCE_TTL_SECONDS = 45L;

    private final RedisService redisService;
    private final SimpMessagingTemplate messagingTemplate;
    private final ObjectMapper objectMapper;

    @Override
    public PresenceStatusResponse handleHeartbeat(PresenceHeartbeatRequest request) {
        if (request == null || request.getAccountId() == null) {
            return null;
        }

        Long accountId = request.getAccountId();
        String redisKey = buildRedisKey(accountId);
        boolean wasOnline = this.redisService.hasKey(redisKey);
        PresenceStatusResponse response = PresenceStatusResponse.builder()
                .accountId(accountId)
                .online(true)
                .lastHeartbeatAt(Instant.now())
                .build();

        try {
            this.redisService.saveWithTTL(
                    redisKey,
                    this.objectMapper.writeValueAsString(response),
                    PRESENCE_TTL_SECONDS,
                    TimeUnit.SECONDS
            );
        } catch (Exception e) {
            log.error("Failed to persist presence heartbeat for account {}: {}", accountId, e.getMessage(), e);
            return response;
        }

        if (!wasOnline) {
            broadcastPresenceChange(response);
        }

        return response;
    }

    @Override
    public void handleOffline(Long accountId) {
        if (accountId == null) {
            return;
        }

        String redisKey = buildRedisKey(accountId);
        boolean wasOnline = this.redisService.hasKey(redisKey);
        this.redisService.deleteKey(redisKey);

        if (wasOnline) {
            broadcastPresenceChange(
                    PresenceStatusResponse.builder()
                            .accountId(accountId)
                            .online(false)
                            .lastHeartbeatAt(Instant.now())
                            .build()
            );
        }
    }

    @Override
    public void handleExpiredPresenceKey(String expiredKey) {
        Long accountId = parseAccountId(expiredKey);
        if (accountId == null) {
            return;
        }

        broadcastPresenceChange(
                PresenceStatusResponse.builder()
                        .accountId(accountId)
                        .online(false)
                        .lastHeartbeatAt(Instant.now())
                        .build()
        );
    }

    @Override
    public PresenceStatusResponse getPresenceStatus(Long accountId) {
        if (accountId == null) {
            return null;
        }

        String redisKey = buildRedisKey(accountId);
        String payload = this.redisService.getValue(redisKey);

        if (payload == null) {
            return PresenceStatusResponse.builder()
                    .accountId(accountId)
                    .online(false)
                    .build();
        }

        try {
            PresenceStatusResponse response = this.objectMapper.readValue(payload, PresenceStatusResponse.class);
            response.setOnline(true);
            return response;
        } catch (Exception e) {
            log.warn("Failed to parse presence payload for account {}: {}", accountId, e.getMessage());
            return PresenceStatusResponse.builder()
                    .accountId(accountId)
                    .online(this.redisService.hasKey(redisKey))
                    .build();
        }
    }

    private String buildRedisKey(Long accountId) {
        return PRESENCE_KEY_PREFIX + accountId;
    }

    private Long parseAccountId(String expiredKey) {
        if (expiredKey == null || !expiredKey.startsWith(PRESENCE_KEY_PREFIX)) {
            return null;
        }

        try {
            return Long.parseLong(expiredKey.substring(PRESENCE_KEY_PREFIX.length()));
        } catch (NumberFormatException e) {
            log.warn("Invalid presence key expired: {}", expiredKey);
            return null;
        }
    }

    private void broadcastPresenceChange(PresenceStatusResponse response) {
        this.messagingTemplate.convertAndSend("/topic/presence", response);
        this.messagingTemplate.convertAndSend("/topic/presence/" + response.getAccountId(), response);
    }
}
