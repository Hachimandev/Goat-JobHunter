package iuh.fit.goat.dto.response.chat;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatCallTokenResponse {
    private Long sessionId;
    private String appId;
    private String channelName;
    private int uid;
    private String token;
    private long expiresAtEpochMs;
    private int ttlSeconds;
    private boolean publisher;
}
