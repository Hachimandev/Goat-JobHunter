package iuh.fit.goat.dto.request.chat;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatCallTokenRequest {
    private Boolean publisher = Boolean.TRUE;
}
