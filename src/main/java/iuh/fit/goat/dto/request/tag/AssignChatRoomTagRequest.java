package iuh.fit.goat.dto.request.tag;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AssignChatRoomTagRequest {
    @NotNull(message = "Tag ID is required")
    private Long tagId;
    private List<Long> roomIds;
}

