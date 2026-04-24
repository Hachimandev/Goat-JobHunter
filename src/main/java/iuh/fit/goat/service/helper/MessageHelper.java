package iuh.fit.goat.service.helper;

import iuh.fit.goat.dto.response.message.MessageResponse;
import iuh.fit.goat.entity.Account;
import iuh.fit.goat.entity.Message;
import iuh.fit.goat.entity.User;
import iuh.fit.goat.entity.embeddable.MediaItem;
import iuh.fit.goat.enumeration.MessageType;
import iuh.fit.goat.repository.MessageRepository;
import iuh.fit.goat.repository.UserRepository;
import iuh.fit.goat.service.async.AsyncMessageDispatchService;
import iuh.fit.goat.util.MessageMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Component
@RequiredArgsConstructor
@Slf4j
public class MessageHelper {

    private final UserRepository userRepository;

    private final SimpMessagingTemplate messagingTemplate;
    private final MessageRepository messageRepository;
    private final AsyncMessageDispatchService asyncMessageDispatch;

    private static final String UNAVAILABLE_MESSAGE_PREVIEW = "Tin nhắn không khả dụng";
    private static final String REVOKED_MESSAGE_PREVIEW = "Tin nhắn đã được thu hồi";
    private static final int MAX_REPLY_PREVIEW_LENGTH = 120;

    @Transactional(readOnly = false)
    public Message saveAndDispatchMessageOptimized(Long chatRoomId, Message message, Account currentAccount) {
        Message savedMessage = this.messageRepository.saveMessage(message);
        this.asyncMessageDispatch.updateChatRoomSummaryAsync(savedMessage);
        this.asyncMessageDispatch.incrementUnreadCountAsync(chatRoomId, currentAccount.getAccountId());
        this.sendMessageToUsers(chatRoomId, savedMessage);
        return savedMessage;
    }

    public void sendMessageToUsers(Long chatRoomId, Message message) {
        if (chatRoomId == null) {
            log.warn("Skip realtime emit because chatRoomId is null for messageId={}",
                    message != null ? message.getMessageId() : null);
            return;
        }
        this.sendMessageToUsers(chatRoomId.toString(), message);
    }

    public void sendMessageToUsers(String chatRoomId, Message message) {
        if (chatRoomId == null || chatRoomId.isBlank() || message == null) {
            log.warn("Skip realtime emit because payload is invalid: chatRoomId={}, messageNull={}",
                    chatRoomId,
                    message == null);
            return;
        }

        log.debug("Sending realtime message to chatRoom: {}", chatRoomId);
        MessageResponse payload = this.toMessageResponse(message);
        this.messagingTemplate.convertAndSend("/topic/chatrooms/" + chatRoomId, payload);
    }

    public MessageResponse toMessageResponse(Message message) {
        return this.toMessageResponse(message, Collections.emptyMap(), new HashMap<>(), new HashMap<>());
    }

    public MessageResponse toMessageResponse(
            Message message,
            Map<String, Message> localMessages,
            Map<String, Optional<Message>> parentLookupCache,
            Map<Long, Optional<User>> contactLookupCache
    ) {
        if (message == null) {
            return null;
        }

        MessageResponse.ReplyContext replyContext = this.buildReplyContext(message, localMessages, parentLookupCache);
        MessageResponse.ContactCardContext contactCardContext = this.buildContactCardContext(message, contactLookupCache);
        return MessageMapper.toResponse(message, replyContext, contactCardContext);
    }

    public MessageResponse.ReplyContext buildReplyContext(
            Message message,
            Map<String, Message> localMessages,
            Map<String, Optional<Message>> parentLookupCache
    ) {
        String replyToMessageId = this.normalizeReplyToMessageId(message.getReplyTo());
        if (replyToMessageId == null) return null;

        String chatRoomId = message.getChatRoomId();
        if (chatRoomId == null || chatRoomId.isBlank()) {
            return MessageResponse.ReplyContext.builder()
                    .originalMessageId(replyToMessageId)
                    .originalContentPreview(UNAVAILABLE_MESSAGE_PREVIEW)
                    .originalMessageUnavailable(true)
                    .originalMessageHidden(false)
                    .build();
        }

        Message originalMessage = this.resolveOriginalMessage(
                chatRoomId,
                replyToMessageId,
                localMessages,
                parentLookupCache
        );

        if (originalMessage == null) {
            return MessageResponse.ReplyContext.builder()
                    .originalMessageId(replyToMessageId)
                    .originalContentPreview(UNAVAILABLE_MESSAGE_PREVIEW)
                    .originalMessageUnavailable(true)
                    .originalMessageHidden(false)
                    .build();
        }

        boolean originalMessageHidden = Boolean.TRUE.equals(originalMessage.getIsHidden());

        return MessageResponse.ReplyContext.builder()
                .originalMessageId(
                        originalMessage.getMessageId() != null
                                ? originalMessage.getMessageId()
                                : replyToMessageId
                )
                .originalSender(originalMessage.getSender())
                .originalMessageType(originalMessage.getMessageType())
                .originalContentPreview(
                        originalMessageHidden
                                ? REVOKED_MESSAGE_PREVIEW
                                : this.buildOriginalMessagePreview(originalMessage)
                )
                .originalMessageUnavailable(false)
                .originalMessageHidden(originalMessageHidden)
                .build();
    }

    public String normalizeReplyToMessageId(String replyToMessageId) {
        if (replyToMessageId == null) {
            return null;
        }

        String normalized = replyToMessageId.trim();
        if (normalized.isEmpty()) {
            return null;
        }

        return normalized;
    }

    public Message resolveOriginalMessage(
            String chatRoomId,
            String replyToMessageId,
            Map<String, Message> localMessages,
            Map<String, Optional<Message>> parentLookupCache
    ) {
        if (localMessages != null && localMessages.containsKey(replyToMessageId)) {
            return localMessages.get(replyToMessageId);
        }

        Optional<Message> parentMessage = this.findReplyTarget(chatRoomId, replyToMessageId, parentLookupCache);
        return parentMessage.orElse(null);
    }

    public Optional<Message> findReplyTarget(
            String chatRoomId,
            String replyToMessageId,
            Map<String, Optional<Message>> parentLookupCache
    ) {
        if (parentLookupCache != null && parentLookupCache.containsKey(replyToMessageId)) {
            return parentLookupCache.get(replyToMessageId);
        }

        Optional<Message> parentMessage = this.messageRepository
                .findByChatRoomIdAndMessageId(chatRoomId, replyToMessageId);

        if (parentLookupCache != null) {
            parentLookupCache.put(replyToMessageId, parentMessage);
        }

        return parentMessage;
    }

    public String buildOriginalMessagePreview(Message originalMessage) {
        if (originalMessage == null) {
            return UNAVAILABLE_MESSAGE_PREVIEW;
        }

        if (originalMessage.getMessageType() == MessageType.TEXT) {
            return this.truncateReplyPreview(originalMessage.getContent());
        }

        if (originalMessage.getMessageType() == MessageType.MEDIA) {
            return this.buildMediaPreview(originalMessage.getMediaItems());
        }

        if (originalMessage.getMessageType() == null) {
            return UNAVAILABLE_MESSAGE_PREVIEW;
        }

        return originalMessage.getMessageType().name().toLowerCase(Locale.ROOT);
    }

    public String truncateReplyPreview(String content) {
        if (content == null || content.isBlank()) {
            return "text";
        }

        String normalized = content.trim();
        if (normalized.length() <= MAX_REPLY_PREVIEW_LENGTH) {
            return normalized;
        }

        return normalized.substring(0, MAX_REPLY_PREVIEW_LENGTH) + "...";
    }

    public String buildMediaPreview(List<MediaItem> mediaItems) {
        if (mediaItems == null || mediaItems.isEmpty()) {
            return MessageType.MEDIA.name().toLowerCase(Locale.ROOT);
        }

        MediaItem first = mediaItems.get(0);
        if (first == null || first.getMediaType() == null) {
            return MessageType.MEDIA.name().toLowerCase(Locale.ROOT);
        }

        return first.getMediaType().name().toLowerCase(Locale.ROOT);
    }

    public MessageResponse.ContactCardContext buildContactCardContext(
            Message message,
            Map<Long, Optional<User>> contactLookupCache
    ) {
        Long contactUserId = this.extractContactCardUserId(message);
        if (contactUserId == null) return null;

        User contactUser = this.resolveContactUser(contactUserId, contactLookupCache);
        if (contactUser == null) return null;

        return MessageResponse.ContactCardContext.builder()
                .accountId(contactUser.getAccountId())
                .fullName(contactUser.getFullName())
                .username(contactUser.getUsername())
                .avatar(contactUser.getAvatar())
                .headline(contactUser.getHeadline())
                .bio(contactUser.getBio())
                .coverPhoto(contactUser.getCoverPhoto())
                .visibility(contactUser.getVisibility())
                .build();
    }

    public Long extractContactCardUserId(Message message) {
        if (message == null || message.getMessageType() != MessageType.CONTACT_CARD) return null;

        return this.parseContactCardUserId(message.getContent());
    }

    public Long parseContactCardUserId(String content) {
        if (content == null || content.isBlank()) return null;

        try {
            long parsed = Long.parseLong(content.trim());
            return parsed > 0 ? parsed : null;
        } catch (NumberFormatException e) {
            return null;
        }
    }

    public User resolveContactUser(Long contactUserId, Map<Long, Optional<User>> contactLookupCache) {
        if (contactLookupCache != null && contactLookupCache.containsKey(contactUserId)) {
            return contactLookupCache.get(contactUserId).orElse(null);
        }

        Optional<User> referencedUser = this.userRepository.findByAccountIdAndDeletedAtIsNull(contactUserId);
        if (contactLookupCache != null) {
            contactLookupCache.put(contactUserId, referencedUser);
        }

        return referencedUser.orElse(null);
    }
}
