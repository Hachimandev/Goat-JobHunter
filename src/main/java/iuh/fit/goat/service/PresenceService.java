package iuh.fit.goat.service;

import iuh.fit.goat.dto.request.presence.PresenceHeartbeatRequest;
import iuh.fit.goat.dto.response.presence.PresenceStatusResponse;

public interface PresenceService {
    String PRESENCE_KEY_PREFIX = "presence:account:";

    PresenceStatusResponse handleHeartbeat(PresenceHeartbeatRequest request);

    void handleOffline(Long accountId);

    void handleExpiredPresenceKey(String expiredKey);

    PresenceStatusResponse getPresenceStatus(Long accountId);
}
