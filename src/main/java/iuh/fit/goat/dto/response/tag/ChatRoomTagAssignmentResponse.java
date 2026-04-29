package iuh.fit.goat.dto.response.tag;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatRoomTagAssignmentResponse {
    private Long assignmentId;
    private Long roomId;
    private Long accountId;
    private Long tagId;
    private String tagName;
    private String tagColor;
    private Boolean systemTag;
}

