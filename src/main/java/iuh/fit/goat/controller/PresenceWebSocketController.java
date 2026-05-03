package iuh.fit.goat.controller;

import iuh.fit.goat.dto.request.presence.PresenceHeartbeatRequest;
import iuh.fit.goat.service.PresenceService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class PresenceWebSocketController {

    private final PresenceService presenceService;

    @MessageMapping("/presence/heartbeat")
    public void heartbeat(@Payload PresenceHeartbeatRequest request) {
        this.presenceService.handleHeartbeat(request);
    }

    @MessageMapping("/presence/offline")
    public void offline(@Payload PresenceHeartbeatRequest request) {
        if (request != null) {
            this.presenceService.handleOffline(request.getAccountId());
        }
    }
}
