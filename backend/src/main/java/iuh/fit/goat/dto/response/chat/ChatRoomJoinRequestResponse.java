package iuh.fit.goat.dto.response.chat;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatRoomJoinRequestResponse {
    private Long requestId;
    private Long accountId;
    private String fullName;
    private String username;
    private String avatar;
    private Instant requestedAt;
}
