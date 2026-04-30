package iuh.fit.goat.dto.response.chat;

import iuh.fit.goat.enumeration.ChatRoomPrivacy;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InviteTokenPreviewResponse {
    private Long roomId;
    private String roomName;
    private String roomAvatar;
    private boolean inviteEnabled;
    private ChatRoomPrivacy privacy;
}
