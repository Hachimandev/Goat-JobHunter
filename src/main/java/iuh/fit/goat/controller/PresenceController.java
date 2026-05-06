package iuh.fit.goat.controller;

import iuh.fit.goat.dto.response.presence.PresenceStatusResponse;
import iuh.fit.goat.service.PresenceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/presence")
public class PresenceController {

    private final PresenceService presenceService;

    @GetMapping("/{accountId}")
    public ResponseEntity<PresenceStatusResponse> getPresenceStatus(@PathVariable Long accountId) {
        return ResponseEntity.ok(this.presenceService.getPresenceStatus(accountId));
    }
}
