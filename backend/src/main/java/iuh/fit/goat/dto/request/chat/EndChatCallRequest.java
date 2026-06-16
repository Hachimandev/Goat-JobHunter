package iuh.fit.goat.dto.request.chat;

import iuh.fit.goat.enumeration.ChatCallEndReason;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EndChatCallRequest {
    @NotNull(message = "reason is required")
    private ChatCallEndReason reason;
}
