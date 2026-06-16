package iuh.fit.goat.dto.response.message;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReactionUpdateEvent {
    private String type;
    private String messageId;
    private String emoji;
    private String action; // ADDED, REMOVED, REPLACED
    private UserReactionInfo user;
    private String previousEmoji;
    private int totalCount;

    public static ReactionUpdateEvent added(String messageId, String emoji, UserReactionInfo user, int totalCount) {
        return ReactionUpdateEvent.builder()
                .type("REACTION_UPDATE")
                .messageId(messageId)
                .emoji(emoji)
                .action("ADDED")
                .user(user)
                .totalCount(totalCount)
                .build();
    }

    public static ReactionUpdateEvent removed(String messageId, String emoji, UserReactionInfo user, int totalCount) {
        return ReactionUpdateEvent.builder()
                .type("REACTION_UPDATE")
                .messageId(messageId)
                .emoji(emoji)
                .action("REMOVED")
                .user(user)
                .totalCount(totalCount)
                .build();
    }

    public static ReactionUpdateEvent replaced(String messageId, String newEmoji, String previousEmoji, UserReactionInfo user, int totalCount) {
        return ReactionUpdateEvent.builder()
                .type("REACTION_UPDATE")
                .messageId(messageId)
                .emoji(newEmoji)
                .action("REPLACED")
                .user(user)
                .previousEmoji(previousEmoji)
                .totalCount(totalCount)
                .build();
    }
}
