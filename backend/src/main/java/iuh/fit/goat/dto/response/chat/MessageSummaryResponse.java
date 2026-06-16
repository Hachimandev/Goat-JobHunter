package iuh.fit.goat.dto.response.chat;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MessageSummaryResponse {
    private Long chatRoomId;
    private long unreadCount;
    private String summary;
    private boolean isSummarized;
}

