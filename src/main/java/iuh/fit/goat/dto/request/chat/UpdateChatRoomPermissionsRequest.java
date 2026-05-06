package iuh.fit.goat.dto.request.chat;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateChatRoomPermissionsRequest {
    private Boolean allowMemberUpdate;
    private Boolean allowMemberPin;
    private Boolean allowMemberCreateVote;
    private Boolean allowMemberSendMessage;
    private Boolean allowModeratorSendMessage;
}
