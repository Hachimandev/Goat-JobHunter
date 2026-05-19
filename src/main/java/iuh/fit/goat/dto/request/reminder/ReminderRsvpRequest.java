package iuh.fit.goat.dto.request.reminder;

import iuh.fit.goat.enumeration.ReminderRsvpStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReminderRsvpRequest {
    @NotNull(message = "Trạng thái phản hồi là bắt buộc")
    private ReminderRsvpStatus status;
}

