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
public class TypingIndicatorResponse {
    private Long chatRoomId;
    private Long accountId;
    private String username;
    private String avatar;
    private boolean typing;
    private Instant updatedAt;
}