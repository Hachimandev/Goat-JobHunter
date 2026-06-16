package iuh.fit.goat.dto.response.message;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReactionGroupResponse {
    private String emoji;
    private int count;
    private List<UserReactionInfo> users;
}
