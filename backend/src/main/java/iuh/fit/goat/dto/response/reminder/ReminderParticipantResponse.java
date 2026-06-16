package iuh.fit.goat.dto.response.reminder;

import iuh.fit.goat.enumeration.ReminderRsvpStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReminderParticipantResponse {
    private Long accountId;
    private String username;
    private String avatar;
    private ReminderRsvpStatus status;
    private Instant respondedAt;
}

