package iuh.fit.goat.service.async;

import iuh.fit.goat.entity.Message;
import iuh.fit.goat.enumeration.MessageType;
import iuh.fit.goat.repository.ChatMemberRepository;
import iuh.fit.goat.repository.ChatRoomRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class AsyncMessageDispatchService {
    private final ChatRoomRepository chatRoomRepository;
    private final ChatMemberRepository chatMemberRepository;

    @Async("messageDispatchExecutor")
    public void updateChatRoomSummaryAsync(Message message) {
        if (message == null || message.getMessageType() == null) return;

        // Skip system messages - only user/media messages should appear in latestMessage preview
        if (message.getMessageType().equals(MessageType.SYSTEM)) {
            return;
        }

        try {
            Long roomId = this.parseChatRoomId(message.getChatRoomId());
            if (roomId == null) return;

            Long senderAccountId = message.getSender() != null ? message.getSender().getAccountId() : null;
            String preview = this.formatMessagePreview(message);

            this.chatRoomRepository.updateLastMessageSummary(
                    roomId,
                    message.getMessageId(),
                    senderAccountId,
                    preview,
                    message.getCreatedAt()
            );
        } catch (Exception e) {
            log.error("Failed to update chat room summary async for messageId={}", message.getMessageId(), e);
        }
    }

    @Async("messageDispatchExecutor")
    public void incrementUnreadCountAsync(Long chatRoomId, Long senderAccountId) {
        if (chatRoomId == null || senderAccountId == null) return;

        try {
            this.chatMemberRepository.incrementUnreadCountForRecipients(chatRoomId, senderAccountId, 1L);
        } catch (Exception e) {
            log.error("Failed to increment unread count async for chatRoomId={}", chatRoomId, e);
        }
    }

    private Long parseChatRoomId(String chatRoomId) {
        if (chatRoomId == null || chatRoomId.isBlank()) return null;

        try {
            return Long.parseLong(chatRoomId);
        } catch (NumberFormatException e) {
            log.warn("Invalid chatRoomId format: {}", chatRoomId);
            return null;
        }
    }

    private String formatMessagePreview(Message message) {
        if (message == null || message.getContent() == null)  return "...";

        String content = message.getContent().trim();
        if (content.isEmpty())  return "...";

        int maxLength = 50;
        return content.length() > maxLength
                ? content.substring(0, maxLength) + "..."
                : content;
    }
}
