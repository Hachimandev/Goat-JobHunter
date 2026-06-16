package iuh.fit.goat.dto.request.chat;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ToggleInviteLinkRequest {
    @NotNull(message = "enabled is required")
    private Boolean enabled;
}
