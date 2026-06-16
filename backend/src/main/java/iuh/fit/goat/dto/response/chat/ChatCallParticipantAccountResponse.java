package iuh.fit.goat.dto.response.chat;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatCallParticipantAccountResponse {
    private Long accountId;
    private String avatar;
    private String username;
    private String fullName;
    private String email;
}
