package iuh.fit.goat.dto.response.poll;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PollVoteResponse {
    private String voteId;
    private Poll poll;
    private Option option;
    private Account account;
    private Instant createdAt;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Poll {
        private String pollId;
        private String question;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Option {
        private String optionId;
        private String text;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Account {
        private String accountId;
        private String fullName;
        private String avatar;
    }
}
