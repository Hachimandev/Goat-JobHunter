package iuh.fit.goat.service.impl;

import iuh.fit.goat.entity.ChatMember;
import iuh.fit.goat.repository.ChatMemberRepository;
import iuh.fit.goat.repository.MessageRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@Slf4j
@RequiredArgsConstructor
@ConditionalOnProperty(name = "chat.unread-count.backfill.enabled", havingValue = "true")
public class UnreadCountBackfillRunner implements ApplicationRunner {

    private static final int DEFAULT_BATCH_SIZE = 200;

    private final ChatMemberRepository chatMemberRepository;
    private final MessageRepository messageRepository;

    @Value("${chat.unread-count.backfill.batch-size:200}")
    private int batchSize;

    @Override
    public void run(ApplicationArguments args) {
        int safeBatchSize = batchSize > 0 ? batchSize : DEFAULT_BATCH_SIZE;
        int pageNumber = 0;
        long processedMembers = 0L;

        while (true) {
            Pageable pageable = PageRequest.of(pageNumber, safeBatchSize, Sort.by("memberId").ascending());
            Page<ChatMember> memberPage = this.chatMemberRepository.findByDeletedAtIsNull(pageable);
            List<ChatMember> members = memberPage.getContent();

            if (members.isEmpty()) {
                break;
            }

            for (ChatMember member : members) {
                member.setUnreadCount(resolveUnreadCount(member));
            }

            this.chatMemberRepository.saveAll(members);
            processedMembers += members.size();

            log.info("Unread-count backfill progress: processedMembers={}, page={}, batchSize={}",
                    processedMembers,
                    pageNumber + 1,
                    safeBatchSize);

            if (!memberPage.hasNext()) {
                break;
            }

            pageNumber++;
        }

        log.info("Unread-count backfill completed: processedMembers={}, batchSize={}",
                processedMembers,
                safeBatchSize);
    }

    private long resolveUnreadCount(ChatMember member) {
        if (member == null || member.getAccount() == null || member.getRoom() == null) {
            return 0L;
        }

        Long accountId = member.getAccount().getAccountId();
        Long chatRoomId = member.getRoom().getRoomId();

        if (accountId == null || chatRoomId == null) {
            return 0L;
        }

        long unreadCount = this.messageRepository.countUnreadMessages(
                String.valueOf(chatRoomId),
                member.getLastReadMessageSk(),
                String.valueOf(accountId)
        );

        return Math.max(unreadCount, 0L);
    }
}
