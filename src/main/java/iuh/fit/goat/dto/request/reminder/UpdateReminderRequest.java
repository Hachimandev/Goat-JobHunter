package iuh.fit.goat.dto.request.reminder;

import iuh.fit.goat.enumeration.ReminderRepeatType;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateReminderRequest {
    @Size(max = 255, message = "Tiêu đề không được vượt quá 255 ký tự")
    private String title;
    private String content;
    @Future(message = "Thời gian nhắc phải ở tương lai")
    private Instant reminderTime;
    private ReminderRepeatType repeatType;
    private Boolean allowResponse;
}

