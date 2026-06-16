package iuh.fit.goat.dto.response.chat;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatRoomPermissionResponse {
    private Long roomId;
    private boolean allowMemberUpdate;
    private boolean allowMemberPin;
    private boolean allowMemberCreateVote;
    private boolean allowMemberSendMessage;
    private boolean allowModeratorSendMessage;
}
