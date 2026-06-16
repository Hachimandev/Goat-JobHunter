package iuh.fit.goat.dto.response.chat;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class JoinByInviteResponse {
    private Long roomId;
    private boolean joined;
    private String status;
    private Long requestId;
}
