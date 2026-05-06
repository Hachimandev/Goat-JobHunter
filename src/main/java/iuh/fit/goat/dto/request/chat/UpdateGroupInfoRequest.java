package iuh.fit.goat.dto.request.chat;

import iuh.fit.goat.enumeration.ChatRoomPrivacy;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateGroupInfoRequest {
    private String name;
    private String avatar;
    private ChatRoomPrivacy privacy;
}
