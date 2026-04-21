package iuh.fit.goat.dto.response.chat;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatCallParticipantResponse {
    private Long accountId;
    private Boolean publisher;
    private Instant joinedAt;
    private Instant leftAt;
}
