package iuh.fit.goat.service.impl;

import iuh.fit.goat.dto.request.chat.EndChatCallRequest;
import iuh.fit.goat.dto.request.chat.JoinChatCallRequest;
import iuh.fit.goat.dto.request.chat.StartChatCallRequest;
import iuh.fit.goat.dto.response.chat.ChatCallSessionResponse;
import iuh.fit.goat.dto.response.chat.ChatRoomResponse;
import iuh.fit.goat.entity.Account;
import iuh.fit.goat.entity.ChatCallParticipant;
import iuh.fit.goat.entity.ChatCallSession;
import iuh.fit.goat.entity.ChatRoom;
import iuh.fit.goat.enumeration.ChatCallEndReason;
import iuh.fit.goat.enumeration.ChatCallSessionStatus;
import iuh.fit.goat.enumeration.ChatRoomType;
import iuh.fit.goat.exception.InvalidException;
import iuh.fit.goat.exception.PermissionException;
import iuh.fit.goat.repository.ChatCallParticipantRepository;
import iuh.fit.goat.repository.ChatCallSessionRepository;
import iuh.fit.goat.repository.ChatRoomRepository;
import iuh.fit.goat.service.ChatRoomService;
import iuh.fit.goat.service.MessageService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyCollection;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ChatCallServiceImplTest {

    @Mock
    private ChatCallSessionRepository chatCallSessionRepository;
    @Mock
    private ChatCallParticipantRepository chatCallParticipantRepository;
    @Mock
    private ChatRoomRepository chatRoomRepository;
    @Mock
    private ChatRoomService chatRoomService;
    @Mock
    private MessageService messageService;
    @Mock
    private SimpMessagingTemplate messagingTemplate;

    private ChatCallServiceImpl service;

    @BeforeEach
    void setUp() {
        this.service = new ChatCallServiceImpl(
                this.chatCallSessionRepository,
                this.chatCallParticipantRepository,
                this.chatRoomRepository,
                this.chatRoomService,
                this.messageService,
                this.messagingTemplate
        );
    }

    @Test
    void startCall_shouldCreateSession_whenMemberAndNoActiveCall() throws Exception {
        Account account = mock(Account.class);
        when(account.getAccountId()).thenReturn(10L);

        ChatRoom room = new ChatRoom();
        room.setRoomId(99L);

        ChatCallSession saved = new ChatCallSession();
        saved.setCallSessionId(123L);
        saved.setChatRoom(room);
        saved.setInitiator(account);
        saved.setStatus(ChatCallSessionStatus.ACTIVE);
        saved.setAgoraChannelName("chatroom-99");
        saved.setStartedAt(Instant.now());

        when(this.chatRoomService.isUserInChatRoom(99L, 10L)).thenReturn(true);
        when(this.chatCallSessionRepository.existsByChatRoomRoomIdAndStatusInAndDeletedAtIsNull(eq(99L), anyCollection()))
                .thenReturn(false);
        when(this.chatRoomRepository.findByRoomId(99L)).thenReturn(Optional.of(room));
        when(this.chatCallSessionRepository.save(any(ChatCallSession.class))).thenReturn(saved);
        when(this.chatCallSessionRepository.findByCallSessionIdAndDeletedAtIsNull(123L)).thenReturn(Optional.of(saved));
        when(this.chatCallParticipantRepository.findBySessionCallSessionIdAndDeletedAtIsNull(123L)).thenReturn(List.of());
        when(this.chatRoomService.getDetailChatRoomInformation(account, 99L))
                .thenReturn(ChatRoomResponse.builder().roomId(99L).type(ChatRoomType.DIRECT).name("Receiver").build());

        ChatCallSessionResponse response = this.service.startCall(account, 99L, new StartChatCallRequest(true));

        assertEquals(123L, response.getSessionId());
        assertEquals(ChatCallSessionStatus.ACTIVE, response.getStatus());
        verify(this.messagingTemplate).convertAndSend(anyString(), any(Object.class));
    }

    @Test
    void startCall_shouldThrow_whenActiveCallExists() throws Exception {
        Account account = mock(Account.class);
        when(account.getAccountId()).thenReturn(10L);
        when(this.chatRoomService.isUserInChatRoom(99L, 10L)).thenReturn(true);
        when(this.chatCallSessionRepository.existsByChatRoomRoomIdAndStatusInAndDeletedAtIsNull(eq(99L), anyCollection()))
                .thenReturn(true);

        assertThrows(InvalidException.class, () -> this.service.startCall(account, 99L, new StartChatCallRequest(true)));
        verify(this.chatCallSessionRepository, never()).save(any(ChatCallSession.class));
    }

    @Test
    void endCall_shouldSetEndedStatus() throws Exception {
        Account account = mock(Account.class);
        when(account.getAccountId()).thenReturn(10L);

        ChatRoom room = new ChatRoom();
        room.setRoomId(99L);

        ChatCallSession session = new ChatCallSession();
        session.setCallSessionId(123L);
        session.setChatRoom(room);
        session.setInitiator(account);
        session.setStatus(ChatCallSessionStatus.ACTIVE);

        when(this.chatRoomService.isUserInChatRoom(99L, 10L)).thenReturn(true);
        when(this.chatCallSessionRepository.findByCallSessionIdAndDeletedAtIsNull(123L)).thenReturn(Optional.of(session));
        when(this.chatCallSessionRepository.save(any(ChatCallSession.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(this.chatCallParticipantRepository.findBySessionCallSessionIdAndDeletedAtIsNull(123L)).thenReturn(List.of());
        when(this.chatRoomService.getDetailChatRoomInformation(account, 99L))
                .thenReturn(ChatRoomResponse.builder().roomId(99L).type(ChatRoomType.DIRECT).name("Receiver").build());

        ChatCallSessionResponse response = this.service.endCall(
                account,
                99L,
                123L,
                new EndChatCallRequest(ChatCallEndReason.HANGUP)
        );

        assertEquals(ChatCallSessionStatus.ENDED, response.getStatus());
        assertEquals(ChatCallEndReason.HANGUP, response.getEndReason());
        verify(this.messageService).createAndSendCallMessage(99L, account, session);
    }

    @Test
    void leaveCall_shouldAutoEndWhenNoParticipantsActive() throws Exception {
        Account account = mock(Account.class);
        when(account.getAccountId()).thenReturn(10L);

        ChatRoom room = new ChatRoom();
        room.setRoomId(99L);

        ChatCallSession session = new ChatCallSession();
        session.setCallSessionId(123L);
        session.setChatRoom(room);
        session.setInitiator(account);
        session.setStatus(ChatCallSessionStatus.ACTIVE);

        ChatCallParticipant participant = new ChatCallParticipant();
        participant.setSession(session);
        participant.setAccount(account);
        participant.setJoinedAt(Instant.now());

        when(this.chatRoomService.isUserInChatRoom(99L, 10L)).thenReturn(true);
        when(this.chatCallSessionRepository.findByCallSessionIdAndDeletedAtIsNull(123L)).thenReturn(Optional.of(session));
        when(this.chatCallParticipantRepository.findBySessionCallSessionIdAndAccountAccountIdAndDeletedAtIsNull(123L, 10L))
                .thenReturn(Optional.of(participant));
        when(this.chatCallParticipantRepository.findBySessionCallSessionIdAndDeletedAtIsNull(123L))
                .thenReturn(List.of(participant));
        when(this.chatCallSessionRepository.save(any(ChatCallSession.class))).thenAnswer(invocation -> invocation.getArgument(0));

        this.service.leaveCall(account, 99L, 123L);

        ArgumentCaptor<ChatCallSession> captor = ArgumentCaptor.forClass(ChatCallSession.class);
        verify(this.chatCallSessionRepository).save(captor.capture());
        assertEquals(ChatCallSessionStatus.ENDED, captor.getValue().getStatus());
        verify(this.messageService).createAndSendCallMessage(99L, account, session);
    }

    @Test
    void declineCall_shouldEndDirectCallWithNoAnswer() throws Exception {
        Account recipient = mock(Account.class);
        when(recipient.getAccountId()).thenReturn(11L);

        Account initiator = mock(Account.class);
        when(initiator.getAccountId()).thenReturn(10L);

        ChatRoom room = new ChatRoom();
        room.setRoomId(99L);
        room.setType(ChatRoomType.DIRECT);

        ChatCallSession session = new ChatCallSession();
        session.setCallSessionId(123L);
        session.setChatRoom(room);
        session.setInitiator(initiator);
        session.setStatus(ChatCallSessionStatus.ACTIVE);

        when(this.chatRoomService.isUserInChatRoom(99L, 11L)).thenReturn(true);
        when(this.chatCallSessionRepository.findByCallSessionIdAndDeletedAtIsNull(123L)).thenReturn(Optional.of(session));
        when(this.chatCallParticipantRepository.findBySessionCallSessionIdAndDeletedAtIsNull(123L)).thenReturn(List.of());
        when(this.chatCallSessionRepository.save(any(ChatCallSession.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(this.chatRoomService.getDetailChatRoomInformation(recipient, 99L))
                .thenReturn(ChatRoomResponse.builder().roomId(99L).type(ChatRoomType.DIRECT).name("Caller").build());

        ChatCallSessionResponse response = this.service.declineCall(recipient, 99L, 123L);

        assertEquals(ChatCallSessionStatus.ENDED, response.getStatus());
        assertEquals(ChatCallEndReason.NO_ANSWER, response.getEndReason());
        verify(this.messageService).createAndSendCallMessage(99L, initiator, session);
    }

    @Test
    void joinCall_shouldThrowWhenSessionEnded() throws Exception {
        Account account = mock(Account.class);
        when(account.getAccountId()).thenReturn(10L);

        ChatRoom room = new ChatRoom();
        room.setRoomId(99L);

        ChatCallSession session = new ChatCallSession();
        session.setCallSessionId(123L);
        session.setChatRoom(room);
        session.setStatus(ChatCallSessionStatus.ENDED);

        when(this.chatRoomService.isUserInChatRoom(99L, 10L)).thenReturn(true);
        when(this.chatCallSessionRepository.findByCallSessionIdAndDeletedAtIsNull(123L)).thenReturn(Optional.of(session));

        assertThrows(
                InvalidException.class,
                () -> this.service.joinCall(account, 99L, 123L, new JoinChatCallRequest(true))
        );
    }
}
