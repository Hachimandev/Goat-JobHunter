package iuh.fit.goat.service.impl;

import iuh.fit.goat.dto.request.chat.EndChatCallRequest;
import iuh.fit.goat.dto.request.chat.JoinChatCallRequest;
import iuh.fit.goat.dto.request.chat.StartChatCallRequest;
import iuh.fit.goat.dto.response.chat.ChatCallParticipantResponse;
import iuh.fit.goat.dto.response.chat.ChatCallRealtimeEventResponse;
import iuh.fit.goat.dto.response.chat.ChatCallSessionResponse;
import iuh.fit.goat.entity.Account;
import iuh.fit.goat.entity.ChatCallParticipant;
import iuh.fit.goat.entity.ChatCallSession;
import iuh.fit.goat.enumeration.ChatCallEndReason;
import iuh.fit.goat.enumeration.ChatCallSessionStatus;
import iuh.fit.goat.exception.InvalidException;
import iuh.fit.goat.exception.PermissionException;
import iuh.fit.goat.repository.ChatCallParticipantRepository;
import iuh.fit.goat.repository.ChatCallSessionRepository;
import iuh.fit.goat.repository.ChatRoomRepository;
import iuh.fit.goat.service.ChatCallService;
import iuh.fit.goat.service.ChatRoomService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.EnumSet;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ChatCallServiceImpl implements ChatCallService {
    private static final String CALL_TOPIC_PREFIX = "/topic/chatrooms/";
    private static final String DEFAULT_CHANNEL_PREFIX = "chatroom-";

    private final ChatCallSessionRepository chatCallSessionRepository;
    private final ChatCallParticipantRepository chatCallParticipantRepository;
    private final ChatRoomRepository chatRoomRepository;
    private final ChatRoomService chatRoomService;
    private final SimpMessagingTemplate messagingTemplate;

    @Override
    @Transactional
    public ChatCallSessionResponse startCall(Account currentAccount, Long chatRoomId, StartChatCallRequest request)
            throws InvalidException, PermissionException {
        validateCurrentAccount(currentAccount);
        validateChatRoomMembership(chatRoomId, currentAccount.getAccountId());

        if (this.chatCallSessionRepository.existsByChatRoomRoomIdAndStatusInAndDeletedAtIsNull(
                chatRoomId,
                activeStatuses()
        )) {
            throw new InvalidException("An active call already exists in this chat room");
        }

        ChatCallSession session = new ChatCallSession();
        session.setChatRoom(this.chatRoomRepository.findByRoomId(chatRoomId)
                .orElseThrow(() -> new InvalidException("Chat room not found")));
        session.setInitiator(currentAccount);
        session.setStatus(ChatCallSessionStatus.ACTIVE);
        session.setAgoraChannelName(buildChannelName(chatRoomId));
        session.setStartedAt(Instant.now());

        ChatCallSession savedSession = this.chatCallSessionRepository.save(session);

        ChatCallParticipant participant = new ChatCallParticipant();
        participant.setSession(savedSession);
        participant.setAccount(currentAccount);
        participant.setJoinedAt(Instant.now());
        participant.setPublisher(isPublisher(request != null ? request.getPublisher() : null));
        this.chatCallParticipantRepository.save(participant);

        ChatCallSessionResponse response = toResponse(savedSession.getCallSessionId());
        publishEvent("CALL_STARTED", chatRoomId, savedSession.getCallSessionId(), currentAccount.getAccountId(), savedSession.getStatus());
        return response;
    }

    @Override
    @Transactional
    public ChatCallSessionResponse joinCall(Account currentAccount, Long chatRoomId, Long sessionId, JoinChatCallRequest request)
            throws InvalidException, PermissionException {
        validateCurrentAccount(currentAccount);
        ChatCallSession session = validateSessionAccess(chatRoomId, sessionId, currentAccount.getAccountId());
        ensureActiveSession(session);

        ChatCallParticipant participant = this.chatCallParticipantRepository
                .findBySessionCallSessionIdAndAccountAccountIdAndDeletedAtIsNull(sessionId, currentAccount.getAccountId())
                .orElse(null);

        if (participant == null) {
            participant = new ChatCallParticipant();
            participant.setSession(session);
            participant.setAccount(currentAccount);
        }

        participant.setJoinedAt(Instant.now());
        participant.setLeftAt(null);
        participant.setPublisher(isPublisher(request != null ? request.getPublisher() : null));
        this.chatCallParticipantRepository.save(participant);

        ChatCallSessionResponse response = toResponse(sessionId);
        publishEvent("CALL_JOINED", chatRoomId, sessionId, currentAccount.getAccountId(), session.getStatus());
        return response;
    }

    @Override
    @Transactional
    public ChatCallSessionResponse leaveCall(Account currentAccount, Long chatRoomId, Long sessionId)
            throws InvalidException, PermissionException {
        validateCurrentAccount(currentAccount);
        ChatCallSession session = validateSessionAccess(chatRoomId, sessionId, currentAccount.getAccountId());
        ensureActiveSession(session);

        ChatCallParticipant participant = this.chatCallParticipantRepository
                .findBySessionCallSessionIdAndAccountAccountIdAndDeletedAtIsNull(sessionId, currentAccount.getAccountId())
                .orElseThrow(() -> new InvalidException("Participant not found in this call session"));

        participant.setLeftAt(Instant.now());
        this.chatCallParticipantRepository.save(participant);

        if (countActiveParticipants(sessionId) == 0) {
            session.setStatus(ChatCallSessionStatus.ENDED);
            session.setEndReason(ChatCallEndReason.HANGUP);
            session.setEndedAt(Instant.now());
            this.chatCallSessionRepository.save(session);
        }

        ChatCallSessionResponse response = toResponse(sessionId);
        publishEvent("CALL_LEFT", chatRoomId, sessionId, currentAccount.getAccountId(), response.getStatus());
        return response;
    }

    @Override
    @Transactional
    public ChatCallSessionResponse endCall(Account currentAccount, Long chatRoomId, Long sessionId, EndChatCallRequest request)
            throws InvalidException, PermissionException {
        validateCurrentAccount(currentAccount);
        ChatCallSession session = validateSessionAccess(chatRoomId, sessionId, currentAccount.getAccountId());
        ensureActiveSession(session);

        session.setStatus(ChatCallSessionStatus.ENDED);
        session.setEndedAt(Instant.now());
        session.setEndReason(request != null && request.getReason() != null ? request.getReason() : ChatCallEndReason.HANGUP);
        this.chatCallSessionRepository.save(session);

        ChatCallSessionResponse response = toResponse(sessionId);
        publishEvent("CALL_ENDED", chatRoomId, sessionId, currentAccount.getAccountId(), response.getStatus());
        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public ChatCallSessionResponse getCurrentCall(Account currentAccount, Long chatRoomId)
            throws InvalidException, PermissionException {
        validateCurrentAccount(currentAccount);
        validateChatRoomMembership(chatRoomId, currentAccount.getAccountId());

        ChatCallSession session = this.chatCallSessionRepository
                .findFirstByChatRoomRoomIdAndStatusInAndDeletedAtIsNullOrderByCreatedAtDesc(chatRoomId, activeStatuses())
                .orElseThrow(() -> new InvalidException("No active call found in this chat room"));

        return toResponse(session.getCallSessionId());
    }

    private ChatCallSession validateSessionAccess(Long chatRoomId, Long sessionId, Long accountId)
            throws InvalidException, PermissionException {
        validateChatRoomMembership(chatRoomId, accountId);
        if (sessionId == null || sessionId <= 0) {
            throw new InvalidException("Call session not found");
        }

        ChatCallSession session = this.chatCallSessionRepository.findByCallSessionIdAndDeletedAtIsNull(sessionId)
                .orElseThrow(() -> new InvalidException("Call session not found"));

        if (session.getChatRoom() == null || session.getChatRoom().getRoomId() == null
                || !session.getChatRoom().getRoomId().equals(chatRoomId)) {
            throw new PermissionException("Call session does not belong to this chat room");
        }

        return session;
    }

    private void validateCurrentAccount(Account account) throws InvalidException {
        if (account == null || account.getAccountId() <= 0) {
            throw new InvalidException("User not found");
        }
    }

    private void validateChatRoomMembership(Long chatRoomId, Long accountId) throws InvalidException, PermissionException {
        if (chatRoomId == null || chatRoomId <= 0) {
            throw new InvalidException("Chat room not found");
        }

        boolean isMember = this.chatRoomService.isUserInChatRoom(chatRoomId, accountId);
        if (!isMember) {
            throw new PermissionException("User is not belong to this chat room");
        }
    }

    private void ensureActiveSession(ChatCallSession session) throws InvalidException {
        if (!activeStatuses().contains(session.getStatus())) {
            throw new InvalidException("Call session is not active");
        }
    }

    private String buildChannelName(Long chatRoomId) {
        return DEFAULT_CHANNEL_PREFIX + chatRoomId;
    }

    private EnumSet<ChatCallSessionStatus> activeStatuses() {
        return EnumSet.of(ChatCallSessionStatus.PENDING, ChatCallSessionStatus.ACTIVE);
    }

    private long countActiveParticipants(Long sessionId) {
        return this.chatCallParticipantRepository.findBySessionCallSessionIdAndDeletedAtIsNull(sessionId)
                .stream()
                .filter(participant -> participant.getLeftAt() == null)
                .count();
    }

    private boolean isPublisher(Boolean publisher) {
        return publisher == null || publisher;
    }

    private ChatCallSessionResponse toResponse(Long sessionId) throws InvalidException {
        ChatCallSession session = this.chatCallSessionRepository.findByCallSessionIdAndDeletedAtIsNull(sessionId)
                .orElseThrow(() -> new InvalidException("Call session not found"));

        List<ChatCallParticipantResponse> participants = new ArrayList<>();
        for (ChatCallParticipant participant : this.chatCallParticipantRepository
                .findBySessionCallSessionIdAndDeletedAtIsNull(sessionId)) {
            Long accountId = participant.getAccount() != null ? participant.getAccount().getAccountId() : null;
            participants.add(new ChatCallParticipantResponse(
                    accountId,
                    participant.isPublisher(),
                    participant.getJoinedAt(),
                    participant.getLeftAt()
            ));
        }

        return new ChatCallSessionResponse(
                session.getCallSessionId(),
                session.getChatRoom() != null ? session.getChatRoom().getRoomId() : null,
                session.getStatus(),
                session.getAgoraChannelName(),
                session.getInitiator() != null ? session.getInitiator().getAccountId() : null,
                session.getStartedAt(),
                session.getEndedAt(),
                session.getEndReason(),
                participants
        );
    }

    private void publishEvent(String eventType, Long chatRoomId, Long sessionId, Long actorAccountId, ChatCallSessionStatus status) {
        String destination = CALL_TOPIC_PREFIX + chatRoomId + "/calls";
        ChatCallRealtimeEventResponse payload = new ChatCallRealtimeEventResponse(
                eventType,
                chatRoomId,
                sessionId,
                actorAccountId,
                status
        );
        this.messagingTemplate.convertAndSend(destination, payload);
    }
}
