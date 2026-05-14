package iuh.fit.goat.dto.response.reminder;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReminderRealtimeResponse {
    private Long reminderId;
    private String title;
    private String content;
    private Instant triggerTime;
    private Long chatRoomId;
    private Long creatorId;
}

