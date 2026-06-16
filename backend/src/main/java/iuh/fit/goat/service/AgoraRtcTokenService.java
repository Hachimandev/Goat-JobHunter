package iuh.fit.goat.service;

import iuh.fit.goat.dto.response.chat.ChatCallTokenResponse;
import iuh.fit.goat.entity.Account;
import iuh.fit.goat.exception.InvalidException;
import iuh.fit.goat.exception.PermissionException;

public interface AgoraRtcTokenService {
    ChatCallTokenResponse issueChatRoomRtcToken(Account currentAccount, Long chatRoomId, Long sessionId, boolean publisher)
            throws InvalidException, PermissionException;
}
