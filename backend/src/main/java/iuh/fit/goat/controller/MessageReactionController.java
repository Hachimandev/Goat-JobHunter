package iuh.fit.goat.controller;

import iuh.fit.goat.dto.request.message.MessageReactionRequest;
import iuh.fit.goat.dto.response.message.MessageReactionResponse;
import iuh.fit.goat.entity.Account;
import iuh.fit.goat.exception.InvalidException;
import iuh.fit.goat.service.AccountService;
import iuh.fit.goat.service.MessageReactionService;
import iuh.fit.goat.util.SecurityUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/chatrooms")
@RequiredArgsConstructor
public class MessageReactionController {

    private final MessageReactionService messageReactionService;
    private final AccountService accountService;

    @PostMapping("/{roomId}/messages/{messageId}/reactions")
    public ResponseEntity<MessageReactionResponse> addReaction(
            @PathVariable Long roomId,
            @PathVariable String messageId,
            @Valid @RequestBody MessageReactionRequest request) throws InvalidException {
        String email = SecurityUtil.getCurrentUserLogin().orElseThrow(() -> new InvalidException("User not authenticated"));
        Account account = accountService.handleGetAccountByEmail(email);
        return ResponseEntity.ok(messageReactionService.addReaction(roomId, messageId, account, request.getEmoji()));
    }

    @DeleteMapping("/{roomId}/messages/{messageId}/reactions/{emoji}")
    public ResponseEntity<MessageReactionResponse> removeReaction(
            @PathVariable Long roomId,
            @PathVariable String messageId,
            @PathVariable String emoji) throws InvalidException {
        String email = SecurityUtil.getCurrentUserLogin().orElseThrow(() -> new InvalidException("User not authenticated"));
        Account account = accountService.handleGetAccountByEmail(email);
        return ResponseEntity.ok(messageReactionService.removeReaction(roomId, messageId, account, emoji));
    }

    @GetMapping("/{roomId}/messages/{messageId}/reactions")
    public ResponseEntity<MessageReactionResponse> getReactions(
            @PathVariable Long roomId,
            @PathVariable String messageId) throws InvalidException {
        String email = SecurityUtil.getCurrentUserLogin().orElseThrow(() -> new InvalidException("User not authenticated"));
        Account account = accountService.handleGetAccountByEmail(email);
        return ResponseEntity.ok(messageReactionService.getReactions(roomId, messageId, account));
    }
}
