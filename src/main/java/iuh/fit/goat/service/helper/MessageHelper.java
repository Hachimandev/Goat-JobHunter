package iuh.fit.goat.service.helper;

import iuh.fit.goat.common.Role;
import iuh.fit.goat.dto.request.message.ForwardMessageRequest;
import iuh.fit.goat.dto.response.ResultPaginationResponse;
import iuh.fit.goat.dto.response.message.ForwardMessageFailureResponse;
import iuh.fit.goat.dto.response.message.MessageDeletedEventResponse;
import iuh.fit.goat.dto.response.message.MessageResponse;
import iuh.fit.goat.entity.*;
import iuh.fit.goat.entity.embeddable.CallSummary;
import iuh.fit.goat.entity.embeddable.MediaItem;
import iuh.fit.goat.entity.embeddable.SenderInfo;
import iuh.fit.goat.enumeration.ChatRoomType;
import iuh.fit.goat.enumeration.MediaType;
import iuh.fit.goat.enumeration.MessageType;
import iuh.fit.goat.enumeration.RelationshipState;
import iuh.fit.goat.exception.BlockedInteractionException;
import iuh.fit.goat.exception.InvalidException;
import iuh.fit.goat.repository.*;
import iuh.fit.goat.service.StorageService;
import iuh.fit.goat.service.async.AsyncMessageDispatchService;
import iuh.fit.goat.service.cache.BlockedInteractionCacheService;
import iuh.fit.goat.service.cache.ChatRoomCacheService;
import iuh.fit.goat.util.EntityUtil;
import iuh.fit.goat.util.MessageMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.net.URI;
import java.net.URISyntaxException;
import java.time.Duration;
import java.time.Instant;
import java.util.*;
import java.util.function.Predicate;

import static iuh.fit.goat.constant.MessageConstant.*;

@Component
@RequiredArgsConstructor
@Slf4j
public class MessageHelper {
    private final StorageService storageService;

    private final UserRepository userRepository;
    private final ChatMemberRepository chatMemberRepository;
    private final UserRelationshipRepository userRelationshipRepository;
    private final ChatRoomRepository chatRoomRepository;
    private final MessageHiddenRepository messageHiddenRepository;

    private final SimpMessagingTemplate messagingTemplate;
    private final MessageRepository messageRepository;
    private final AsyncMessageDispatchService asyncMessageDispatch;
    private final BlockedInteractionCacheService blockedInteractionCache;
    private final ChatRoomCacheService chatRoomCache;

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

    public List<MessageResponse> toMessageResponses(List<Message> messages) {
        if (messages == null || messages.isEmpty()) return Collections.emptyList();

        Map<String, Message> localMessages = new HashMap<>();
        for (Message message : messages) {
            if (message == null || message.getMessageId() == null || message.getMessageId().isBlank()) {
                continue;
            }
            localMessages.putIfAbsent(message.getMessageId(), message);
        }

        Map<String, Optional<Message>> parentLookupCache = preloadReplyTargets(messages, localMessages);
        Map<Long, Optional<User>> contactLookupCache = preloadContactUsers(messages);
        List<MessageResponse> responses = new ArrayList<>(messages.size());
        for (Message message : messages) {
            responses.add(this.toMessageResponse(message, localMessages, parentLookupCache, contactLookupCache));
        }

        return responses;
    }

    public Map<String, Optional<Message>> preloadReplyTargets(
            List<Message> messages,
            Map<String, Message> localMessages
    ) {
        Map<String, Optional<Message>> parentLookupCache = new HashMap<>();
        if (messages == null || messages.isEmpty()) return parentLookupCache;

        Map<String, LinkedHashSet<String>> replyIdsByChatRoom = new HashMap<>();

        for (Message message : messages) {
            if (message == null) continue;

            String replyToMessageId = this.normalizeReplyToMessageId(message.getReplyTo());
            if (replyToMessageId == null) continue;

            if (localMessages != null && localMessages.containsKey(replyToMessageId)) {
                parentLookupCache.put(replyToMessageId, Optional.ofNullable(localMessages.get(replyToMessageId)));
                continue;
            }

            String chatRoomId = message.getChatRoomId();
            if (chatRoomId == null || chatRoomId.isBlank()) continue;

            replyIdsByChatRoom
                    .computeIfAbsent(chatRoomId, ignored -> new LinkedHashSet<>())
                    .add(replyToMessageId);
        }

        for (Map.Entry<String, LinkedHashSet<String>> entry : replyIdsByChatRoom.entrySet()) {
            String chatRoomId = entry.getKey();
            LinkedHashSet<String> replyIds = entry.getValue();
            if (replyIds == null || replyIds.isEmpty()) continue;

            Map<String, Message> matchedParents = this.messageRepository
                    .findByChatRoomIdAndMessageIds(
                            chatRoomId,
                            replyIds,
                            DEFAULT_REPLY_LOOKUP_SCAN_LIMIT
                    );

            for (String replyId : replyIds) {
                if (parentLookupCache.containsKey(replyId)) continue;
                parentLookupCache.put(replyId, Optional.ofNullable(matchedParents.get(replyId)));
            }
        }

        return parentLookupCache;
    }

    public Map<Long, Optional<User>> preloadContactUsers(List<Message> messages) {
        Map<Long, Optional<User>> contactLookupCache = new HashMap<>();
        if (messages == null || messages.isEmpty()) {
            return contactLookupCache;
        }

        LinkedHashSet<Long> contactUserIds = new LinkedHashSet<>();
        for (Message message : messages) {
            Long contactUserId = this.extractContactCardUserId(message);
            if (contactUserId != null) {
                contactUserIds.add(contactUserId);
            }
        }

        if (contactUserIds.isEmpty()) {
            return contactLookupCache;
        }

        List<User> existingUsers = this.userRepository
                .findByAccountIdInAndDeletedAtIsNull(new ArrayList<>(contactUserIds));

        for (User user : existingUsers) {
            contactLookupCache.put(user.getAccountId(), Optional.of(user));
        }

        for (Long userId : contactUserIds) {
            contactLookupCache.putIfAbsent(userId, Optional.empty());
        }

        return contactLookupCache;
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

        MediaItem first = mediaItems.getFirst();
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

    public void validateNoBlockedDirectInteractionOptimized(
            ChatRoom chatRoom,
            List<ChatMember> preloadedMembers,
            Long currentAccountId
    ) throws InvalidException
    {
        if (chatRoom.getType() != ChatRoomType.DIRECT) return;

        Long peerAccountId = null;
        if (preloadedMembers != null && !preloadedMembers.isEmpty()) {
            for (ChatMember chatMember : preloadedMembers) {
                if (chatMember != null) {
                    Account account = chatMember.getAccount();
                    if (account != null && account.getAccountId() != currentAccountId) {
                        peerAccountId = account.getAccountId();
                        break;
                    }
                }
            }
        }

        if (peerAccountId == null) {
            peerAccountId = this.chatMemberRepository.findByRoomRoomIdAndDeletedAtIsNull(chatRoom.getRoomId())
                    .stream()
                    .map(ChatMember::getAccount)
                    .filter(Objects::nonNull)
                    .map(Account::getAccountId)
                    .filter(accountId -> !Objects.equals(accountId, currentAccountId))
                    .findFirst()
                    .orElseThrow(() -> new InvalidException("Direct chat room has invalid members"));
        }

        UserRelationshipRepository.PairIds pair = UserRelationshipRepository.PairIds.of(currentAccountId, peerAccountId);

        Boolean cachedBlocked = this.blockedInteractionCache.isBlocked(pair.pairLowId(), pair.pairHighId());
        if (cachedBlocked != null) {
            if (cachedBlocked) throw new BlockedInteractionException("Cannot send message because this pair is blocked");
            return;
        }

        boolean blocked = this.userRelationshipRepository
                .existsByPairLowUser_AccountIdAndPairHighUser_AccountIdAndRelationshipStateAndDeletedAtIsNull(
                        pair.pairLowId(),
                        pair.pairHighId(),
                        RelationshipState.BLOCKED
                );

        this.blockedInteractionCache.putBlocked(pair.pairLowId(), pair.pairHighId(), blocked);

        if (blocked) throw new BlockedInteractionException("Cannot send message because this pair is blocked");
    }

    public void validateChatRoom(Long chatRoomId) throws InvalidException {
        ChatRoom chatRoom = this.chatRoomCache.getCached(chatRoomId);
        if (chatRoom == null) {
            chatRoom = this.chatRoomRepository.findByRoomId(chatRoomId).orElseThrow(() -> new InvalidException("Chat Room not found"));
            this.chatRoomCache.cache(chatRoom);
        }
    }

    public ChatRoom getChatRoom(Long chatRoomId) throws InvalidException {
        ChatRoom chatRoom = this.chatRoomCache.getCached(chatRoomId);

        if(chatRoom == null) {
            chatRoom = this.chatRoomRepository.findByRoomId(chatRoomId).orElseThrow(() -> new InvalidException("Chat Room not found"));
            this.chatRoomCache.cache(chatRoom);
        }

        return chatRoom;
    }

    public ResultPaginationResponse getPaginatedMessagesByChatRoom(
            Long chatRoomId,
            Pageable pageable,
            Account currentAccount,
            boolean includeGloballyHidden,
            Predicate<Message> messageFilter,
            boolean updateLastReadMessage
    ) throws InvalidException {
        if (currentAccount == null) throw new InvalidException("Current account is invalid");
        this.validateChatRoom(chatRoomId);

        int pageNumber = pageable != null ? Math.max(pageable.getPageNumber(), 0) : 0;
        int pageSize = resolveRequestedSize(pageable, DEFAULT_SEARCH_PAGE_SIZE);
        int batchQuerySize = resolveCursorBatchQuerySize(pageSize);

        Long currentAccountId = currentAccount.getAccountId();

        CursorResolution cursorResolution = resolvePageStartCursor(
                chatRoomId,
                currentAccountId,
                pageSize,
                pageNumber,
                batchQuerySize,
                includeGloballyHidden,
                messageFilter
        );

        List<Message> pageMessages;
        boolean hasMore;
        if (cursorResolution.reachedEndBeforePage()) {
            pageMessages = Collections.emptyList();
            hasMore = false;
        } else {
            FilteredPageSlice pageSlice = fetchFilteredPageSlice(
                    chatRoomId.toString(),
                    cursorResolution.startCursor(),
                    pageSize,
                    batchQuerySize,
                    includeGloballyHidden,
                    currentAccountId,
                    messageFilter
            );

            pageMessages = pageSlice.messages();
            hasMore = pageSlice.hasMore();
        }

        if (updateLastReadMessage) {
            updateLastReadMessageOnFirstPage(chatRoomId, pageNumber, pageMessages, currentAccount);
        }

        List<MessageResponse> result = toMessageResponses(pageMessages);
        long totalVisibleMessages = cursorResolution.reachedEndBeforePage()
                ? resolveAndCacheTotalForEndPage(
                pageSize,
                pageNumber,
                cursorResolution.exactTotalWhenEnd()
        )
                : resolveAndCacheTotal(
                pageSize,
                pageNumber,
                pageMessages.size(),
                hasMore
        );

        return buildPaginationResponse(result, pageNumber, pageSize, totalVisibleMessages);
    }

    public int resolveRequestedSize(Pageable pageable, int fallbackSize) {
        int requestedSize = (pageable == null || pageable.getPageSize() <= 0)
                ? fallbackSize
                : pageable.getPageSize();

        int safeMaxPageSize = maxCursorPageSize > 0 ? maxCursorPageSize : fallbackSize;
        return Math.min(requestedSize, safeMaxPageSize);
    }

    public int resolveCursorBatchQuerySize(int pageSize) {
        int recommended = Math.max(pageSize * 2, DEFAULT_CURSOR_BATCH_QUERY_SIZE);
        int configured = cursorBatchQuerySize > 0 ? cursorBatchQuerySize : recommended;
        int bounded = Math.min(configured, MAX_CURSOR_BATCH_QUERY_SIZE);
        return Math.max(bounded, Math.max(pageSize, 1));
    }

    public record CursorResolution(String startCursor, boolean reachedEndBeforePage, Long exactTotalWhenEnd) {
    }
    public CursorResolution resolvePageStartCursor(
            Long chatRoomId,
            Long accountId,
            int pageSize,
            int pageNumber,
            int batchQuerySize,
            boolean includeGloballyHidden,
            Predicate<Message> messageFilter
    ) {
        if (pageNumber <= 0) return new CursorResolution(null, false, null);

        String cursor = null;
        for (int currentPage = 0; currentPage < pageNumber; currentPage++) {
            FilteredPageSlice pageSlice = fetchFilteredPageSlice(
                    chatRoomId.toString(),
                    cursor,
                    pageSize,
                    batchQuerySize,
                    includeGloballyHidden,
                    accountId,
                    messageFilter
            );

            String nextPageCursor = pageSlice.nextCursor();
            if (nextPageCursor == null) {
                long exactTotal = (long) currentPage * pageSize + pageSlice.messages().size();
                return new CursorResolution(null, true, exactTotal);
            }

            cursor = nextPageCursor;
        }

        return new CursorResolution(cursor, false, null);
    }

    public FilteredPageSlice fetchFilteredPageSlice(
            String chatRoomId,
            String startCursor,
            int pageSize,
            int batchQuerySize,
            boolean includeGloballyHidden,
            Long accountId,
            Predicate<Message> messageFilter
    ) {
        List<Message> pageMessages = new ArrayList<>(pageSize);
        String queryCursor = startCursor;

        while (pageMessages.size() < pageSize) {
            MessageRepository.MessageCursorBatchResult batchResult = this.messageRepository
                    .queryMessageBatchByChatRoomWithCursor(chatRoomId, queryCursor, batchQuerySize);

            List<Message> rawBatchMessages = batchResult.messages();
            if (rawBatchMessages.isEmpty()) {
                return new FilteredPageSlice(pageMessages, null, false);
            }

            List<Message> visibleMessages = filterMessagesForPagination(
                    rawBatchMessages,
                    includeGloballyHidden,
                    accountId,
                    messageFilter
            );

            String lastReturnedMessageSk = null;
            for (Message message : visibleMessages) {
                if (pageMessages.size() >= pageSize) {
                    break;
                }

                pageMessages.add(message);
                lastReturnedMessageSk = message != null ? message.getMessageSk() : null;
            }

            if (pageMessages.size() >= pageSize) {
                boolean hasMoreInCurrentBatch = hasRawItemsAfterMessage(rawBatchMessages, lastReturnedMessageSk);
                boolean hasMore = hasMoreInCurrentBatch || batchResult.hasMore();
                String nextCursor = hasMore
                        ? this.messageRepository.createCursorToken(chatRoomId, lastReturnedMessageSk)
                        : null;

                if (hasMore && (nextCursor == null || nextCursor.isBlank())) {
                    nextCursor = batchResult.nextCursor();
                }

                return new FilteredPageSlice(pageMessages, nextCursor, hasMore);
            }

            if (!batchResult.hasMore()) {
                return new FilteredPageSlice(pageMessages, null, false);
            }

            queryCursor = batchResult.nextCursor();
            if (queryCursor == null || queryCursor.isBlank()) {
                return new FilteredPageSlice(pageMessages, null, false);
            }
        }

        return new FilteredPageSlice(pageMessages, null, false);
    }

    public boolean hasRawItemsAfterMessage(List<Message> rawMessages, String messageSk) {
        if (rawMessages == null || rawMessages.isEmpty() || messageSk == null || messageSk.isBlank()) {
            return false;
        }

        for (int index = 0; index < rawMessages.size(); index++) {
            Message current = rawMessages.get(index);
            if (current == null || current.getMessageSk() == null) {
                continue;
            }

            if (messageSk.equals(current.getMessageSk())) {
                return index < rawMessages.size() - 1;
            }
        }

        return false;
    }

    public record FilteredPageSlice(List<Message> messages, String nextCursor, boolean hasMore) {
    }
    public List<Message> filterMessagesForPagination(
            List<Message> messages,
            boolean includeGloballyHidden,
            Long accountId,
            Predicate<Message> messageFilter
    ) {
        if (messages == null || messages.isEmpty()) {
            return Collections.emptyList();
        }

        List<Message> globallyVisibleMessages = messages.stream()
                .filter(Objects::nonNull)
                .filter(message -> includeGloballyHidden || !Boolean.TRUE.equals(message.getIsHidden()))
                .toList();

        List<Message> visibleMessages = filterHiddenMessagesForUser(globallyVisibleMessages, accountId);
        if (messageFilter == null) {
            return visibleMessages;
        }

        return visibleMessages.stream()
                .filter(messageFilter)
                .toList();
    }

    public List<Message> filterHiddenMessagesForUser(List<Message> messages, Long accountId) {
        if (messages == null || messages.isEmpty()) return Collections.emptyList();

        if (accountId == null) return messages;

        List<String> messageIds = messages.stream()
                .map(Message::getMessageId)
                .filter(messageId -> messageId != null && !messageId.isBlank())
                .distinct()
                .toList();

        if (messageIds.isEmpty()) return messages;

        Set<String> hiddenMessageIds = this.messageHiddenRepository.findHiddenMessageIdsForUser(messageIds, accountId);
        if (hiddenMessageIds.isEmpty()) {
            return messages;
        }

        List<Message> visibleMessages = new ArrayList<>(messages.size());
        for (Message message : messages) {
            if (message == null) {
                continue;
            }

            String messageId = message.getMessageId();
            if (messageId == null || !hiddenMessageIds.contains(messageId)) {
                visibleMessages.add(message);
            }
        }

        return visibleMessages;
    }

    public void updateLastReadMessageOnFirstPage(
            Long chatRoomId,
            int pageNumber,
            List<Message> pageMessages,
            Account currentAccount
    ) {
        if (pageNumber != 0 || pageMessages == null || pageMessages.isEmpty()) {
            return;
        }

        Message latestMessage = pageMessages.getFirst();
        String latestMessageSk = latestMessage.getMessageSk();
        if (latestMessageSk == null || latestMessageSk.isBlank()) {
            return;
        }

        this.chatMemberRepository.markConversationAsRead(
                chatRoomId,
                currentAccount.getAccountId(),
                latestMessageSk
        );
    }

    public long resolveAndCacheTotalForEndPage(
            int pageSize,
            int pageNumber,
            Long exactTotalWhenEnd
    ) {
        if (exactTotalWhenEnd != null) {
            return exactTotalWhenEnd;
        }

        return Math.max((long) pageNumber * pageSize, 0L);
    }

    public long resolveAndCacheTotal(
            int pageSize,
            int pageNumber,
            int currentPageItemCount,
            boolean hasMore
    ) {
        long lowerBound = (long) pageNumber * pageSize + currentPageItemCount;
        if (!hasMore) {
            return lowerBound;
        }

        long minimumForNextPage = ((long) pageNumber + 1) * pageSize + 1;
        return Math.max(lowerBound, minimumForNextPage);
    }

    public ResultPaginationResponse buildPaginationResponse(
            List<MessageResponse> messages,
            int pageNumber,
            int pageSize,
            long total
    ) {
        ResultPaginationResponse.Meta meta = new ResultPaginationResponse.Meta();
        meta.setPage(pageNumber + 1);
        meta.setPageSize(pageSize);
        meta.setPages(calculateTotalPages(total, pageSize));
        meta.setTotal(total);

        return new ResultPaginationResponse(meta, messages);
    }

    public int calculateTotalPages(long total, int pageSize) {
        if (total <= 0 || pageSize <= 0) return 0;
        return (int) ((total + pageSize - 1) / pageSize);
    }

    public void validateReplyTarget(String chatRoomId, String replyToMessageId) throws InvalidException {
        if (replyToMessageId == null) return;

        boolean isValidReplyTarget = this.messageRepository
                .findByChatRoomIdAndMessageId(chatRoomId, replyToMessageId)
                .isPresent();

        if (!isValidReplyTarget) throw new InvalidException("replyToMessageId is invalid or not in this conversation");
    }

    public List<Message> collectCascadeRecallMessages(Message rootMessage) {
        if (rootMessage == null) return Collections.emptyList();

        LinkedHashMap<String, Message> messagesById = new LinkedHashMap<>();
        addMessageIfAbsent(messagesById, rootMessage);

        List<Message> forwardedDescendants = this.messageRepository
                .findForwardedDescendantsByOriginalMessageId(rootMessage.getMessageId());

        for (Message forwardedDescendant : forwardedDescendants) {
            addMessageIfAbsent(messagesById, forwardedDescendant);
        }

        return new ArrayList<>(messagesById.values());
    }

    public void addMessageIfAbsent(Map<String, Message> messagesById, Message message) {
        if (message == null || message.getMessageId() == null || message.getMessageId().isBlank()) {
            return;
        }

        messagesById.putIfAbsent(message.getMessageId(), message);
    }

    public List<Long> normalizeTargetChatRoomIds(ForwardMessageRequest request) throws InvalidException {
        if (request == null || request.getTargetChatRoomIds() == null || request.getTargetChatRoomIds().isEmpty()) {
            throw new InvalidException("At least one target chat room ID is required");
        }

        LinkedHashSet<Long> deduplicated = new LinkedHashSet<>();
        for (Long chatRoomId : request.getTargetChatRoomIds()) {
            if (chatRoomId != null) {
                deduplicated.add(chatRoomId);
            }
        }

        if (deduplicated.isEmpty()) throw new InvalidException("At least one valid target chat room ID is required");

        if (deduplicated.size() > MAX_FORWARD_TARGETS) {
            throw new InvalidException("Cannot forward to more than " + MAX_FORWARD_TARGETS + " chat rooms at once");
        }

        return new ArrayList<>(deduplicated);
    }

    public boolean isMediaType(MessageType type) {
        return type == MessageType.MEDIA || type == MessageType.IMAGE
                || type == MessageType.VIDEO || type == MessageType.AUDIO;
    }

    public int resolveSearchPageSize(int requestedPageSize) {
        if (requestedPageSize <= 0) return DEFAULT_SEARCH_PAGE_SIZE;
        return Math.min(requestedPageSize, MAX_SEARCH_PAGE_SIZE);
    }

    public void refreshChatRoomSummaries(Collection<String> chatRoomIds) {
        if (chatRoomIds == null || chatRoomIds.isEmpty()) return;

        for (String chatRoomId : chatRoomIds) {
            refreshChatRoomSummary(chatRoomId);
        }
    }

    private void refreshChatRoomSummary(String chatRoomId) {
        Long roomId = parseChatRoomId(chatRoomId);
        if (roomId == null) return;

        Optional<Message> latestMessage = this.messageRepository.findLastMessageByConversation(chatRoomId);
        if (latestMessage.isEmpty()) {
            this.chatRoomRepository.clearLastMessageSummary(roomId);
            return;
        }

        this.asyncMessageDispatch.updateChatRoomSummaryAsync(latestMessage.get());
    }

    public Long parseChatRoomId(String chatRoomId) {
        if (chatRoomId == null || chatRoomId.isBlank()) return null;

        try {
            return Long.parseLong(chatRoomId);
        } catch (NumberFormatException e) {
            log.warn("Invalid chatRoomId format for summary update: {}", chatRoomId);
            return null;
        }
    }

    public String normalizeSearchTerm(String searchTerm) throws InvalidException {
        if (searchTerm == null) return null;

        String normalized = searchTerm.trim();
        if (normalized.isEmpty()) return null;

        if (normalized.length() > MAX_SEARCH_TERM_LENGTH) {
            throw new InvalidException("searchTerm must not exceed " + MAX_SEARCH_TERM_LENGTH + " characters");
        }

        return normalized;
    }

    public MessageType determineMessageType(String mimeType) {
        MediaType mediaType = determineMediaType(mimeType);
        if (mediaType != null) return MessageType.MEDIA;

        return MessageType.FILE;
    }

    public MessageType determineLegacyMediaMessageType(String mimeType) {
        MediaType mediaType = determineMediaType(mimeType);
        if (mediaType == null) return MessageType.FILE;

        return switch (mediaType) {
            case IMAGE -> MessageType.IMAGE;
            case VIDEO -> MessageType.VIDEO;
            case AUDIO -> MessageType.AUDIO;
        };
    }

    public MediaType determineMediaType(String mimeType) {
        if (mimeType == null) return null;

        String normalized = mimeType.toLowerCase(Locale.ROOT);
        if (normalized.startsWith("image/")) return MediaType.IMAGE;
        if (normalized.startsWith("video/")) return MediaType.VIDEO;
        if (normalized.startsWith("audio/")) return MediaType.AUDIO;
        return null;
    }

    public String normalizeMessageContent(String content) {
        if (content == null) return null;
        String normalized = content.trim();
        return normalized.isEmpty() ? null : normalized;
    }

    public void validateFile(MultipartFile file) throws InvalidException {
        if (file == null || file.isEmpty()) {throw new InvalidException("File cannot be empty");}
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new InvalidException(
                    String.format("File '%s' exceeds maximum size of 20MB",
                            file.getOriginalFilename()));
        }
        String filename = file.getOriginalFilename();
        if (filename == null || filename.contains("..") || filename.contains("/")) {
            throw new InvalidException("Invalid filename");
        }
    }

    public void validateMediaBatchConstraints(List<MultipartFile> mediaFiles) throws InvalidException {
        if (mediaFiles == null || mediaFiles.isEmpty()) return;

        if (mediaFiles.size() > MAX_MEDIA_ITEMS_PER_MESSAGE) {
            throw new InvalidException("Cannot upload more than " + MAX_MEDIA_ITEMS_PER_MESSAGE + " media items per message");
        }

        long totalSize = 0L;
        for (MultipartFile mediaFile : mediaFiles) {
            if (mediaFile == null)  continue;

            totalSize += mediaFile.getSize();
            if (totalSize > MAX_MEDIA_BATCH_SIZE) {
                throw new InvalidException("Total media payload exceeds maximum size of 100MB");
            }
        }
    }

    public String getFolderByMessageType(MessageType type) {
        return switch (type) {
            case IMAGE -> "images";
            case VIDEO -> "videos";
            case AUDIO -> "audios";
            default -> "files";
        };
    }

    public String getFolderByMediaType(MediaType mediaType) {
        return switch (mediaType) {
            case IMAGE -> "images";
            case VIDEO -> "videos";
            case AUDIO -> "audios";
        };
    }

    public Message createMediaMessage(
            String chatRoomId, List<MediaItem> mediaItems,
            String content, String replyToMessageId, Account currentAccount
    ) {
        String messageId = generateMessageId();
        Instant now = Instant.now();
        long timestamp = now.toEpochMilli();

        String messageSk = Message.buildMessageSk(timestamp, messageId);

        return Message.builder()
                .messageSk(messageSk)
                .chatRoomId(chatRoomId)
                .messageId(messageId)
                .sender(buildSenderInfo(currentAccount))
                .content(content)
                .mediaItems(cloneMediaItems(mediaItems))
                .messageType(MessageType.MEDIA)
                .replyTo(replyToMessageId)
                .isHidden(false)
                .isForwarded(false)
                .originalMessageId(null)
                .createdAt(now)
                .updatedAt(now)
                .build();
    }

    public Message createFileMessage(
            String chatRoomId, String fileUrl,
            MessageType messageType, String replyToMessageId, Account currentAccount
    ) {
        String messageId = generateMessageId();
        Instant now = Instant.now();
        long timestamp = now.toEpochMilli();

        String messageSk = Message.buildMessageSk(timestamp, messageId);

        SenderInfo senderInfo = buildSenderInfo(currentAccount);

        return Message.builder()
                .messageSk(messageSk)
                .chatRoomId(chatRoomId)
                .messageId(messageId)
                .sender(senderInfo)
                .content(fileUrl)
                .mediaItems(null)
                .messageType(messageType)
                .replyTo(replyToMessageId)
                .isHidden(false)
                .isForwarded(false)
                .originalMessageId(null)
                .createdAt(now)
                .updatedAt(now)
                .build();
    }

    public Message createContactCardMessage(String chatRoomId, Long referencedUserId, Account currentAccount) {
        String messageId = generateMessageId();
        Instant now = Instant.now();
        long timestamp = now.toEpochMilli();

        return Message.builder()
                .messageSk(Message.buildMessageSk(timestamp, messageId))
                .chatRoomId(chatRoomId)
                .messageId(messageId)
                .sender(buildSenderInfo(currentAccount))
                .content(String.valueOf(referencedUserId))
                .mediaItems(null)
                .messageType(MessageType.CONTACT_CARD)
                .replyTo(null)
                .isHidden(false)
                .isForwarded(false)
                .originalMessageId(null)
                .createdAt(now)
                .updatedAt(now)
                .build();
    }

    public Message createForwardedMessage(Message sourceMessage, Long targetChatRoomId, Account currentAccount) {
        String forwardedMessageId = generateMessageId();
        Instant now = Instant.now();
        long timestamp = now.toEpochMilli();

        return Message.builder()
                .messageSk(Message.buildMessageSk(timestamp, forwardedMessageId))
                .chatRoomId(targetChatRoomId.toString())
                .messageId(forwardedMessageId)
                .sender(buildSenderInfo(currentAccount))
                .content(sourceMessage.getContent())
                .mediaItems(cloneMediaItems(sourceMessage.getMediaItems()))
                .callSummary(cloneCallSummary(sourceMessage.getCallSummary()))
                .messageType(sourceMessage.getMessageType())
                .replyTo(null)
                .isHidden(false)
                .isForwarded(true)
                .originalMessageId(sourceMessage.getMessageId())
                .createdAt(now)
                .updatedAt(now)
                .build();
    }

    public List<MediaItem> cloneMediaItems(List<MediaItem> sourceMediaItems) {
        if (sourceMediaItems == null || sourceMediaItems.isEmpty()) {
            return null;
        }

        List<MediaItem> clonedItems = new ArrayList<>();
        for (MediaItem mediaItem : sourceMediaItems) {
            if (mediaItem == null || mediaItem.getUrl() == null || mediaItem.getUrl().isBlank()) {
                continue;
            }

            clonedItems.add(MediaItem.builder()
                    .url(mediaItem.getUrl())
                    .mediaType(mediaItem.getMediaType())
                    .mimeType(mediaItem.getMimeType())
                    .sizeBytes(mediaItem.getSizeBytes())
                    .displayOrder(mediaItem.getDisplayOrder())
                    .build());
        }

        return clonedItems.isEmpty() ? null : clonedItems;
    }

    public CallSummary cloneCallSummary(CallSummary sourceCallSummary) {
        if (sourceCallSummary == null) {
            return null;
        }

        return CallSummary.builder()
                .sessionId(sourceCallSummary.getSessionId())
                .startedAt(sourceCallSummary.getStartedAt())
                .endedAt(sourceCallSummary.getEndedAt())
                .durationSeconds(sourceCallSummary.getDurationSeconds())
                .endReason(sourceCallSummary.getEndReason())
                .build();
    }

    public List<Message> applyRecallState(List<Message> messages) {
        if (messages == null || messages.isEmpty()) {
            return Collections.emptyList();
        }

        Instant recallTime = Instant.now();
        List<Message> recalledMessages = new ArrayList<>();

        for (Message message : messages) {
            if (message == null || Boolean.TRUE.equals(message.getIsHidden())) {
                continue;
            }

            message.setIsHidden(true);
            message.setContent(null);
            message.setMediaItems(null);
            message.setUpdatedAt(recallTime);

            Message savedMessage = this.messageRepository.saveMessage(message);
            recalledMessages.add(savedMessage);
        }

        return recalledMessages;
    }

    public record CascadeDeleteTarget(Message message, String deleteType) {
    }
    public List<CascadeDeleteTarget> collectCascadeDeleteTargets(Message rootMessage) {
        if (rootMessage == null) return Collections.emptyList();

        LinkedHashMap<String, CascadeDeleteTarget> targetsByMessageId = new LinkedHashMap<>();

        List<Message> forwardedDescendants = this.messageRepository
                .findForwardedDescendantsByOriginalMessageId(rootMessage.getMessageId());

        List<Message> descendantsInDeleteOrder = new ArrayList<>(forwardedDescendants);
        Collections.reverse(descendantsInDeleteOrder);

        for (Message descendant : descendantsInDeleteOrder) {
            addCascadeDeleteTargetIfAbsent(targetsByMessageId, descendant, DELETE_TYPE_FORWARDED);
        }

        addCascadeDeleteTargetIfAbsent(targetsByMessageId, rootMessage, DELETE_TYPE_ORIGINAL);

        return new ArrayList<>(targetsByMessageId.values());
    }

    public void addCascadeDeleteTargetIfAbsent(
            Map<String, CascadeDeleteTarget> targetsByMessageId,
            Message message, String deleteType
    ) {
        if (message == null || message.getMessageId() == null || message.getMessageId().isBlank()) {
            return;
        }

        targetsByMessageId.putIfAbsent(message.getMessageId(), new CascadeDeleteTarget(message, deleteType));
    }

    public void deleteSingleMessagePermanently(Message message) throws InvalidException {
        if (message == null) throw new InvalidException("Message is invalid");

        String targetChatRoomId = message.getChatRoomId();
        String targetMessageId = message.getMessageId();
        String targetMessageSk = message.getMessageSk();

        if (targetChatRoomId == null || targetChatRoomId.isBlank()
                || targetMessageId == null || targetMessageId.isBlank()
                || targetMessageSk == null || targetMessageSk.isBlank()) {
            throw new InvalidException("Message data is invalid for permanent delete");
        }

        cleanupMessageBinaryContent(message);

        try {
            this.messageRepository.deletePinnedMessage(targetChatRoomId, targetMessageId);
            this.messageRepository.deleteMessage(targetChatRoomId, targetMessageSk);
        } catch (RuntimeException e) {
            log.error("Failed to permanently delete message item: messageId={}, chatRoomId={}",
                    targetMessageId,
                    targetChatRoomId,
                    e);
            throw new InvalidException("Failed to permanently delete message");
        }
    }

    public MessageDeletedEventResponse buildMessageDeletedEvent(
            Message message, String deleteType,
            Long deletedByAccountId, Instant deletedAt
    ) {
        return MessageDeletedEventResponse.builder()
                .eventType(MESSAGE_DELETED_EVENT)
                .chatRoomId(message.getChatRoomId())
                .messageId(message.getMessageId())
                .deleteType(deleteType)
                .deletedByAccountId(deletedByAccountId)
                .deletedAt(deletedAt)
                .build();
    }

    public String generateMessageId() {
        return "msg_" + UUID.randomUUID().toString().replace("-", "");
    }

    public void validateNoBlockedDirectInteraction(ChatRoom chatRoom, Long currentAccountId) throws InvalidException {
        if (chatRoom.getType() != ChatRoomType.DIRECT) return;

        Long peerAccountId = this.chatMemberRepository.findByRoomRoomIdAndDeletedAtIsNull(chatRoom.getRoomId())
                .stream()
                .map(ChatMember::getAccount)
                .filter(Objects::nonNull)
                .map(Account::getAccountId)
                .filter(accountId -> !Objects.equals(accountId, currentAccountId))
                .findFirst()
                .orElseThrow(() -> new InvalidException("Direct chat room has invalid members"));

        UserRelationshipRepository.PairIds pair = UserRelationshipRepository.PairIds.of(currentAccountId, peerAccountId);
        this.userRelationshipRepository.lockPairForTransactionByCanonicalIds(pair.pairLowId(), pair.pairHighId());

        boolean blocked = this.userRelationshipRepository
                .existsByPairLowUser_AccountIdAndPairHighUser_AccountIdAndRelationshipStateAndDeletedAtIsNull(
                        pair.pairLowId(),
                        pair.pairHighId(),
                        RelationshipState.BLOCKED
                );

        if (blocked) throw new BlockedInteractionException("Cannot send message because this pair is blocked");
    }

    public List<Long> normalizeContactCardUserIds(List<Long> userIds) {
        if (userIds == null || userIds.isEmpty())  return Collections.emptyList();

        LinkedHashSet<Long> deduplicated = new LinkedHashSet<>();
        for (Long userId : userIds) {
            if (userId != null && userId > 0) {
                deduplicated.add(userId);
            }
        }

        return new ArrayList<>(deduplicated);
    }

    public boolean isFriendWithCurrentUser(Long currentAccountId, Long targetUserId) {
        if (currentAccountId == null || targetUserId == null || Objects.equals(currentAccountId, targetUserId)) {
            return false;
        }

        UserRelationshipRepository.PairIds pair = UserRelationshipRepository.PairIds.of(currentAccountId, targetUserId);
        return this.userRelationshipRepository
                .existsByPairLowUser_AccountIdAndPairHighUser_AccountIdAndRelationshipStateAndDeletedAtIsNull(
                        pair.pairLowId(),
                        pair.pairHighId(),
                        RelationshipState.FRIEND
                );
    }

    public void sendMessageDeletedEvent(Long chatRoomId, MessageDeletedEventResponse event) {
        if (chatRoomId == null) {
            log.warn("Skip delete event because chatRoomId is null for messageId={}",
                    event != null ? event.getMessageId() : null);
            return;
        }

        sendMessageDeletedEvent(chatRoomId.toString(), event);
    }

    public void sendMessageDeletedEvent(String chatRoomId, MessageDeletedEventResponse event) {
        if (chatRoomId == null || chatRoomId.isBlank() || event == null) return;
        try {
            messagingTemplate.convertAndSend("/topic/chatrooms/" + chatRoomId, event);
        } catch (RuntimeException e) {
            log.error("Failed to send delete event: chatRoomId={}, messageId={}, deleteType={}",
                    chatRoomId,
                    event.getMessageId(),
                    event.getDeleteType(),
                    e);
        }
    }

    public boolean isSuperAdmin(Account account) {
        return account.getRole() != null
                && account.getRole().getName() != null
                && Role.ADMIN.getValue().equalsIgnoreCase(account.getRole().getName());
    }

    public void cleanupMessageBinaryContent(Message message) throws InvalidException {
        if (message == null) return;

        MessageType messageType = message.getMessageType();
        boolean hasMediaItems = message.getMediaItems() != null && !message.getMediaItems().isEmpty();

        if (!hasMediaItems && !isBinaryMessageType(messageType)) return;

        LinkedHashSet<String> storageKeys = new LinkedHashSet<>();
        collectStorageKeysFromMediaItems(message.getMediaItems(), storageKeys);

        if (requiresLegacyContentCleanup(messageType)) {
            addStorageKeyFromContent(message.getContent(), storageKeys);
        }

        for (String key : storageKeys) {
            deleteStorageObjectByKey(message.getMessageId(), key);
        }
    }

    public void collectStorageKeysFromMediaItems(
            List<MediaItem> mediaItems, Set<String> storageKeys
    ) throws InvalidException
    {
        if (mediaItems == null || mediaItems.isEmpty()) return;

        for (MediaItem mediaItem : mediaItems) {
            if (mediaItem == null || mediaItem.getUrl() == null || mediaItem.getUrl().isBlank()) continue;

            String key = extractStorageKey(mediaItem.getUrl());
            if (key == null || key.isBlank()) {
                throw new InvalidException("Cannot determine storage key for deleting media item content");
            }

            storageKeys.add(key);
        }
    }

    public boolean requiresLegacyContentCleanup(MessageType messageType) {
        return messageType == MessageType.IMAGE || messageType == MessageType.VIDEO
                || messageType == MessageType.AUDIO || messageType == MessageType.FILE;
    }

    public void addStorageKeyFromContent(String content, Set<String> storageKeys) throws InvalidException {
        if (content == null || content.isBlank()) return;

        String key = extractStorageKey(content);
        if (key == null || key.isBlank()) {
            throw new InvalidException("Cannot determine storage key for deleting message content");
        }

        storageKeys.add(key);
    }

    public void deleteStorageObjectByKey(String messageId, String key) throws InvalidException {
        try {
            this.storageService.handleDeleteFile(key);
        } catch (Exception e) {
            log.error("Failed to delete storage object for messageId={}", messageId, e);
            throw new InvalidException("Failed to delete message file from storage");
        }
    }

    private boolean isBinaryMessageType(MessageType messageType) {
        return messageType == MessageType.MEDIA || messageType == MessageType.IMAGE
                || messageType == MessageType.VIDEO || messageType == MessageType.AUDIO
                || messageType == MessageType.FILE;
    }

    public CallSummary buildCallSummary(ChatCallSession session, Instant startedAt, Instant endedAt) {
        long durationSeconds = 0L;
        if (startedAt != null && endedAt != null && !endedAt.isBefore(startedAt)) {
            durationSeconds = Duration.between(startedAt, endedAt).getSeconds();
        }

        return CallSummary.builder()
                .sessionId(session.getCallSessionId())
                .startedAt(startedAt)
                .endedAt(endedAt)
                .durationSeconds(durationSeconds)
                .endReason(session.getEndReason())
                .build();
    }

    public boolean isUserInChatRoom(Long chatRoomId, Long accountId) {
        if (chatRoomId == null || accountId == null)  return false;

        return this.chatMemberRepository
                .existsByRoomRoomIdAndAccountAccountIdAndDeletedAtIsNull(chatRoomId, accountId);
    }

    public void validateForwardableSourceMessage(Message sourceMessage) throws InvalidException {
        if (Boolean.TRUE.equals(sourceMessage.getIsHidden())) {
            throw new InvalidException("Cannot forward a revoked message");
        }

        if (sourceMessage.getMessageType() == MessageType.SYSTEM) {
            throw new InvalidException("System messages cannot be forwarded");
        }

        if (!hasForwardablePayload(sourceMessage)) {
            throw new InvalidException("Cannot forward an empty message");
        }
    }

    public boolean hasForwardablePayload(Message sourceMessage) {
        if (sourceMessage == null) return false;

        if (sourceMessage.getContent() != null && !sourceMessage.getContent().isBlank()) return true;

        List<MediaItem> mediaItems = sourceMessage.getMediaItems();
        if (mediaItems == null || mediaItems.isEmpty()) return true;

        for (MediaItem mediaItem : mediaItems) {
            if (mediaItem != null && mediaItem.getUrl() != null && !mediaItem.getUrl().isBlank()) return true;
        }

        return false;
    }

    public ForwardMessageFailureResponse buildForwardFailure(Long targetChatRoomId, String code, String message) {
        return ForwardMessageFailureResponse.builder()
                .targetChatRoomId(targetChatRoomId)
                .code(code)
                .message(message)
                .build();
    }

    public String extractStorageKey(String content) {
        String trimmed = content.trim();
        if (!(trimmed.startsWith("http://") || trimmed.startsWith("https://"))) {
            return trimmed.startsWith("/") ? trimmed.substring(1) : trimmed;
        }

        try {
            URI uri = new URI(trimmed);
            String path = uri.getPath();
            if (path == null || path.isBlank()) {
                return null;
            }
            return path.startsWith("/") ? path.substring(1) : path;
        } catch (URISyntaxException e) {
            return null;
        }
    }

    public Long extractSenderAccountId(Message message) {
        if (message.getSender() != null && message.getSender().getAccountId() != null) {
            return message.getSender().getAccountId();
        }

        String senderId = message.getSenderId();
        if (senderId == null || senderId.isBlank()) {
            return null;
        }

        try {
            return Long.parseLong(senderId);
        } catch (NumberFormatException e) {
            return null;
        }
    }

    public SenderInfo buildSenderInfo(Account account) {
        if (account == null) return SenderInfo.builder().build();

        Account resolvedAccount = EntityUtil.unproxy(account);
        String fullName = resolveAccountDisplayName(resolvedAccount);
        String avatar = resolveAccountAvatar(resolvedAccount);

        return SenderInfo.builder()
                .accountId(resolvedAccount.getAccountId())
                .fullName(fullName)
                .username(resolvedAccount.getUsername())
                .email(resolvedAccount.getEmail())
                .avatar(avatar)
                .build();
    }

    public String resolveAccountDisplayName(Account account) {
        if (account == null) return null;

        Account resolvedAccount = EntityUtil.unproxy(account);

        if (resolvedAccount instanceof Company companyAccount
                && companyAccount.getName() != null
                && !companyAccount.getName().isBlank()) {
            return companyAccount.getName();
        }

        if (resolvedAccount instanceof User userAccount
                && userAccount.getFullName() != null
                && !userAccount.getFullName().isBlank()) {
            return userAccount.getFullName();
        }

        if (resolvedAccount.getUsername() != null && !resolvedAccount.getUsername().isBlank()) {
            return resolvedAccount.getUsername();
        }

        return resolvedAccount.getEmail();
    }

    public String resolveAccountAvatar(Account account) {
        if (account == null) return null;

        Account resolvedAccount = EntityUtil.unproxy(account);

        if (resolvedAccount instanceof Company companyAccount
                && companyAccount.getLogo() != null
                && !companyAccount.getLogo().isBlank()
        ) {
            return companyAccount.getLogo();
        }

        return resolvedAccount.getAvatar();
    }
}