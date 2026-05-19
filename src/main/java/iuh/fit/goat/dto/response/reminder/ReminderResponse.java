package iuh.fit.goat.dto.response.reminder;

import iuh.fit.goat.enumeration.ReminderRepeatType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReminderResponse {
    private Long reminderId;
    private String title;
    private String content;
    private Instant reminderTime;
    private Instant nextTriggerTime;
    private Instant lastTriggeredAt;
    private ReminderRepeatType repeatType;
    private boolean allowResponse;
    private boolean active;
    private Long creatorId;
    private Long chatRoomId;
    private List<ReminderParticipantResponse> participants;
    private Instant createdAt;
    private Instant updatedAt;
}

