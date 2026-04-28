package iuh.fit.goat.dto.request.chat;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class JoinByInviteRequest {
    @NotBlank(message = "Invite token is required")
    private String inviteToken;
}
