package iuh.fit.goat.controller;

import iuh.fit.goat.dto.request.chat.ChatCallTokenRequest;
import iuh.fit.goat.dto.response.chat.ChatCallTokenResponse;
import iuh.fit.goat.entity.Account;
import iuh.fit.goat.exception.InvalidException;
import iuh.fit.goat.exception.PermissionException;
import iuh.fit.goat.service.AccountService;
import iuh.fit.goat.service.AgoraRtcTokenService;
import iuh.fit.goat.util.SecurityUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/chatrooms")
@RequiredArgsConstructor
public class ChatCallController {
    private final AccountService accountService;
    private final AgoraRtcTokenService agoraRtcTokenService;

    @PostMapping("/{chatRoomId}/calls/token")
    public ResponseEntity<ChatCallTokenResponse> issueChatRoomCallToken(
            @PathVariable Long chatRoomId,
            @RequestBody(required = false) @Valid ChatCallTokenRequest request
    ) throws InvalidException, PermissionException {
        Account currentAccount = getCurrentAccount();

        boolean publisher = request == null
                || request.getPublisher() == null
                || request.getPublisher();

        ChatCallTokenResponse response = this.agoraRtcTokenService.issueChatRoomRtcToken(
                currentAccount,
                chatRoomId,
                publisher
        );

        return ResponseEntity.ok(response);
    }

    private Account getCurrentAccount() throws InvalidException {
        String email = SecurityUtil.getCurrentUserLogin()
                .orElseThrow(() -> new InvalidException("User not authenticated"));

        Account currentAccount = this.accountService.handleGetAccountByEmail(email);
        if (currentAccount == null) {
            throw new InvalidException("User not found");
        }

        return currentAccount;
    }
}
