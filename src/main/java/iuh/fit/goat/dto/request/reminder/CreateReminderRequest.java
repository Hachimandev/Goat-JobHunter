package iuh.fit.goat.dto.request.reminder;

import iuh.fit.goat.enumeration.ReminderRepeatType;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateReminderRequest {
    @NotBlank(message = "Tiêu đề không được để trống")
    @Size(max = 255, message = "Tiêu đề không được vượt quá 255 ký tự")
    private String title;
    private String content;
    @NotNull(message = "Thời gian nhắc là bắt buộc")
    @Future(message = "Thời gian nhắc phải ở tương lai")
    private Instant reminderTime;
    @NotNull(message = "Loại lặp lại là bắt buộc")
    private ReminderRepeatType repeatType;
    private List<Long> participantIds;
    @NotNull(message = "allowResponse là bắt buộc")
    private Boolean allowResponse;
}