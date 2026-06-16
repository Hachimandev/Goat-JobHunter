package iuh.fit.goat.dto.response.message;

import iuh.fit.goat.entity.embeddable.SenderInfo;
import iuh.fit.goat.enumeration.ChatCallEndReason;
import iuh.fit.goat.enumeration.MediaType;
import iuh.fit.goat.enumeration.MessageType;
import iuh.fit.goat.enumeration.Visibility;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MessageResponse {
    private String messageId;
    private String chatRoomId;
    private SenderInfo sender;
    private String content;
    private List<MediaItem> mediaItems;
    private MessageType messageType;
    private String replyToMessageId;
    private ReplyContext replyContext;
    private ContactCardContext contactCard;
    private CallContext callContext;
    private Boolean isHidden;
    private Boolean isForwarded;
    private String originalMessageId;
    private Instant createdAt;
    private Instant updatedAt;
    private List<ReactionGroupResponse> reactions;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ReplyContext {
        private String originalMessageId;
        private SenderInfo originalSender;
        private MessageType originalMessageType;
        private String originalContentPreview;
        private Boolean originalMessageUnavailable;
        private Boolean originalMessageHidden;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class MediaItem {
        private String url;
        private MediaType mediaType;
        private String mimeType;
        private Long sizeBytes;
        private Integer displayOrder;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ContactCardContext {
        private Long accountId;
        private String fullName;
        private String username;
        private String avatar;
        private String headline;
        private String bio;
        private String coverPhoto;
        private Visibility visibility;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CallContext {
        private Long sessionId;
        private Instant startedAt;
        private Instant endedAt;
        private Long durationSeconds;
        private ChatCallEndReason endReason;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ReactionGroupResponse {
        private String emoji;
        private int count;
        private List<UserReactionInfo> users;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UserReactionInfo {
        private Long accountId;
        private String fullName;
        private String username;
        private String avatar;
        private Instant reactedAt;
    }
}
