package iuh.fit.goat.dto.response.chat;

import iuh.fit.goat.enumeration.ChatCallEndReason;
import iuh.fit.goat.enumeration.ChatCallSessionStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatCallSessionResponse {
    private Long sessionId;
    private Long chatRoomId;
    private ChatCallSessionStatus status;
    private String agoraChannelName;
    private Long initiatorAccountId;
    private Instant startedAt;
    private Instant endedAt;
    private ChatCallEndReason endReason;
    private List<ChatCallParticipantResponse> participants;
}
