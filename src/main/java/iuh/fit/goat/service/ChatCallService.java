package iuh.fit.goat.service;

import iuh.fit.goat.dto.request.chat.EndChatCallRequest;
import iuh.fit.goat.dto.request.chat.JoinChatCallRequest;
import iuh.fit.goat.dto.request.chat.StartChatCallRequest;
import iuh.fit.goat.dto.response.chat.ChatCallSessionResponse;
import iuh.fit.goat.entity.Account;
import iuh.fit.goat.exception.InvalidException;
import iuh.fit.goat.exception.PermissionException;

public interface ChatCallService {
    ChatCallSessionResponse startCall(Account currentAccount, Long chatRoomId, StartChatCallRequest request)
            throws InvalidException, PermissionException;

    ChatCallSessionResponse joinCall(Account currentAccount, Long chatRoomId, Long sessionId, JoinChatCallRequest request)
            throws InvalidException, PermissionException;

    ChatCallSessionResponse leaveCall(Account currentAccount, Long chatRoomId, Long sessionId)
            throws InvalidException, PermissionException;

    ChatCallSessionResponse endCall(Account currentAccount, Long chatRoomId, Long sessionId, EndChatCallRequest request)
            throws InvalidException, PermissionException;

    ChatCallSessionResponse getCurrentCall(Account currentAccount, Long chatRoomId)
            throws InvalidException, PermissionException;
}
