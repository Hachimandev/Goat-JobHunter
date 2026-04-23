package iuh.fit.goat.dto.response.chat;

import iuh.fit.goat.enumeration.ChatCallSessionStatus;
import iuh.fit.goat.enumeration.ChatCallType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatCallRealtimeEventResponse {
    private String eventType;
    private Long chatRoomId;
    private Long sessionId;
    private Long actorAccountId;
    private ChatCallSessionStatus status;
    private ChatCallType callType;
}
