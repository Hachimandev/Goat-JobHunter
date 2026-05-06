package iuh.fit.goat.dto.response.chat;

import iuh.fit.goat.enumeration.ChatRoomPrivacy;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InviteLinkResponse {
    private Long roomId;
    private String inviteToken;
    private String inviteLink;
    private boolean inviteEnabled;
    private Instant inviteRotatedAt;
    private ChatRoomPrivacy privacy;
}
