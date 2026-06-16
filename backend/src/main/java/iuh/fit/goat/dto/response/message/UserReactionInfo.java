package iuh.fit.goat.dto.response.message;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserReactionInfo {
    private Long accountId;
    private String fullName;
    private String username;
    private String avatar;
    private Instant reactedAt;
}
