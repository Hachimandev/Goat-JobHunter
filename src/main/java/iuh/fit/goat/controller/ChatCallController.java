package iuh.fit.goat.controller;

import iuh.fit.goat.dto.request.chat.ChatCallTokenRequest;
import iuh.fit.goat.dto.request.chat.EndChatCallRequest;
import iuh.fit.goat.dto.request.chat.JoinChatCallRequest;
import iuh.fit.goat.dto.request.chat.StartChatCallRequest;
import iuh.fit.goat.dto.response.chat.ChatCallSessionResponse;
import iuh.fit.goat.dto.response.chat.ChatCallTokenResponse;
import iuh.fit.goat.entity.Account;
import iuh.fit.goat.exception.InvalidException;
import iuh.fit.goat.exception.PermissionException;
import iuh.fit.goat.service.AccountService;
import iuh.fit.goat.service.AgoraRtcTokenService;
import iuh.fit.goat.service.ChatCallService;
import iuh.fit.goat.util.SecurityUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
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
    private final ChatCallService chatCallService;

    @PostMapping("/{chatRoomId}/calls")
    public ResponseEntity<ChatCallSessionResponse> startCall(
            @PathVariable Long chatRoomId,
            @RequestBody(required = false) @Valid StartChatCallRequest request
    ) throws InvalidException, PermissionException {
        Account currentAccount = getCurrentAccount();
        ChatCallSessionResponse response = this.chatCallService.startCall(
                currentAccount,
                chatRoomId,
                request == null ? new StartChatCallRequest(Boolean.TRUE) : request
        );
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{chatRoomId}/calls/{sessionId}/join")
    public ResponseEntity<ChatCallSessionResponse> joinCall(
            @PathVariable Long chatRoomId,
            @PathVariable Long sessionId,
            @RequestBody(required = false) @Valid JoinChatCallRequest request
    ) throws InvalidException, PermissionException {
        Account currentAccount = getCurrentAccount();
        ChatCallSessionResponse response = this.chatCallService.joinCall(
                currentAccount,
                chatRoomId,
                sessionId,
                request == null ? new JoinChatCallRequest(Boolean.TRUE) : request
        );
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{chatRoomId}/calls/{sessionId}/leave")
    public ResponseEntity<ChatCallSessionResponse> leaveCall(
            @PathVariable Long chatRoomId,
            @PathVariable Long sessionId
    ) throws InvalidException, PermissionException {
        Account currentAccount = getCurrentAccount();
        ChatCallSessionResponse response = this.chatCallService.leaveCall(currentAccount, chatRoomId, sessionId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{chatRoomId}/calls/{sessionId}/end")
    public ResponseEntity<ChatCallSessionResponse> endCall(
            @PathVariable Long chatRoomId,
            @PathVariable Long sessionId,
            @RequestBody(required = false) @Valid EndChatCallRequest request
    ) throws InvalidException, PermissionException {
        Account currentAccount = getCurrentAccount();
        ChatCallSessionResponse response = this.chatCallService.endCall(
                currentAccount,
                chatRoomId,
                sessionId,
                request == null ? new EndChatCallRequest(null) : request
        );
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{chatRoomId}/calls/current")
    public ResponseEntity<ChatCallSessionResponse> getCurrentCall(
            @PathVariable Long chatRoomId
    ) throws InvalidException, PermissionException {
        Account currentAccount = getCurrentAccount();
        ChatCallSessionResponse response = this.chatCallService.getCurrentCall(currentAccount, chatRoomId);
        return ResponseEntity.ok(response);
    }

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
                request == null ? null : request.getSessionId(),
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
